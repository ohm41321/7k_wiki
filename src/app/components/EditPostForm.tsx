'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkBreaks from 'remark-breaks';
import { toast } from 'sonner';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import type { User } from '@supabase/supabase-js';

const customSchema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src || []), 'blob', 'data'],
  },
};

interface EditPostFormProps {
  post: {
    slug: string;
    title: string;
    content: string;
    tags: string[];
    imageurls?: string[];
  };
  game: string;
}

export default function EditPostForm({ post, game }: EditPostFormProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [title, setTitle] = useState(post.title);
  const [tags, setTags] = useState(post.tags.join(', '));
  const [content, setContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [stagedFiles, setStagedFiles] = useState<Map<string, File>>(new Map());
  const [existingImages, setExistingImages] = useState<string[]>(post.imageurls || []);
  const [imagesToDelete, setImagesToDelete] = useState<Set<string>>(new Set());

  // Debug logging for existing images
  useEffect(() => {
    console.log('EditPostForm initialized with existing images:', existingImages);
  }, []);

  useEffect(() => {
    return () => {
      stagedFiles.forEach((_, blobUrl) => URL.revokeObjectURL(blobUrl));
    };
  }, [stagedFiles]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const stageImageForUpload = (file: File) => {
    const blobUrl = URL.createObjectURL(file);
    const placeholder = `\n![${file.name}](${blobUrl})\n`;
    setContent(prev => prev + placeholder);
    setStagedFiles(prev => new Map(prev).set(blobUrl, file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      for (const file of Array.from(e.target.files)) {
        stageImageForUpload(file);
      }
      e.target.value = '';
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          stageImageForUpload(file);
          break;
        }
      }
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setContent(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleDeleteImage = (imageUrl: string) => {
    setImagesToDelete(prev => new Set(prev).add(imageUrl));
    setExistingImages(prev => prev.filter(url => url !== imageUrl));
  };

  const handleUndoDeleteImage = (imageUrl: string) => {
    setImagesToDelete(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageUrl);
      return newSet;
    });
    setExistingImages(prev => [...prev, imageUrl].sort());
  };

  const wrapText = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = `${before}${selectedText || 'text'}${after}`;
    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selectedText.length || 'text'.length));
    }, 0);
  };

  const handleDelete = async () => {
    const promise = async () => {
      const res = await fetch(`/api/posts/${post.slug}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }
      return { slug: post.slug };
    };

    toast.promise(promise(), {
      loading: 'Deleting post...',
      success: () => {
        router.push(`/${game}`);
        router.refresh();
        return `Post has been deleted.`;
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setLoading(true);
    setError(null);

    const promise = async () => {
      let finalContent = content;
      const uploadPromises: Promise<{ blobUrl: string, finalUrl: string }>[] = [];
      const markdownImageRegex = /!\[[^\]]*\]\((blob:[^)]+)\)/g;
      const matches = [...content.matchAll(markdownImageRegex)];

      // Upload all images first
      for (const match of matches) {
        const blobUrl = match[1];
        const fileToUpload = stagedFiles.get(blobUrl);

        if (fileToUpload) {
          const formData = new FormData();
          formData.append('file', fileToUpload);

          const uploadPromise = fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          .then(async res => {
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(errorData.error || `Upload failed with status ${res.status}`);
            }
            return res.json();
          })
          .then(data => ({ blobUrl, finalUrl: data.url }))
          .catch(error => {
            console.error('Upload error for blob:', blobUrl, error);
            throw error;
          });

          uploadPromises.push(uploadPromise);
        }
      }

      // Wait for all uploads to complete
      const settledUploads = await Promise.allSettled(uploadPromises);

      // Process successful uploads
      const successfulUploads = settledUploads
        .filter((result): result is PromiseFulfilledResult<{ blobUrl: string, finalUrl: string }> =>
          result.status === 'fulfilled'
        )
        .map(result => result.value);

      const failedUploads = settledUploads
        .filter((result): result is PromiseRejectedResult =>
          result.status === 'rejected'
        );

      const newImageUrls = successfulUploads.map(({ finalUrl }) => finalUrl);

      // Replace blob URLs with final URLs in content
      successfulUploads.forEach(({ blobUrl, finalUrl }) => {
        const regex = new RegExp(blobUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        finalContent = finalContent.replace(regex, finalUrl);
      });

      // Clean up blob URLs for successful uploads
      successfulUploads.forEach(({ blobUrl }) => {
        URL.revokeObjectURL(blobUrl);
        stagedFiles.delete(blobUrl);
      });

      // Log failed uploads for debugging
      if (failedUploads.length > 0) {
        console.warn('Some image uploads failed:', failedUploads.map(f => f.reason));
      }

      console.log(`Image upload summary: ${successfulUploads.length} successful, ${failedUploads.length} failed`);

      // Calculate final image URLs (existing images minus deleted ones, plus new ones)
      const finalImageUrls = [...existingImages.filter(url => !imagesToDelete.has(url)), ...newImageUrls];

      console.log('Sending PUT request to:', `/api/posts/${post.slug}`);
      console.log('Post slug:', post.slug);
      console.log('Final image URLs:', finalImageUrls);
      console.log('Staged files count:', stagedFiles.size);
      console.log('Request data:', {
        title: title?.substring(0, 50),
        contentLength: finalContent?.length,
        tags,
        imageUrlsCount: finalImageUrls?.length,
        game: game
      });

      const res = await fetch(`/api/posts/${post.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: finalContent.trim(),
          tags: tags.trim(),
          imageurls: finalImageUrls || []
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update post');
      }
      return { ...await res.json() };
    };

    toast.promise(promise(), {
      loading: 'Saving changes...',
      success: (data) => {
        router.push(`/${game}`);
        router.refresh();
        return `Post "${data.title}" has been updated.`;
      },
      error: (err) => {
        setError(err.message);
        return `Error: ${err.message}`;
      },
      finally: () => {
        setLoading(false);
      }
    });
  };
  
  if (authLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center">Please log in to edit this post.</div>;
  }

  return (
    <div className="flex">
      <div className="flex-grow bg-gray-900/30 p-6 sm:p-8 rounded-lg shadow-xl">
          <form onSubmit={handleSubmit}>
              <div className="border-b border-gray-700 pb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                  <input
                      id="title"
                      type="text"
                      className="block w-full bg-gray-800 border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-lg font-bold text-white placeholder-gray-500 p-2"
                      placeholder="Post Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                  />
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-400 mt-4 mb-1">Tags</label>
                  <input
                      id="tags"
                      type="text"
                      className="block w-full bg-gray-800 border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white placeholder-gray-500 p-2"
                      placeholder="Tags (comma-separated)"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                  />
              </div>

              <div className="mt-4">
                  <div className="border-b border-gray-700">
                      <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                      <button
                          type="button"
                          onClick={() => setActiveTab('write')}
                          className={`${activeTab === 'write' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                      >
                          Write
                      </button>
                      <button
                          type="button"
                          onClick={() => setActiveTab('preview')}
                          className={`${activeTab === 'preview' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                      >
                          Preview
                      </button>
                      </nav>
                  </div>
                  <div className="mt-4">
                      {activeTab === 'write' ? (
                        <div>
                          <div className="flex items-center space-x-2 p-2 bg-gray-900 rounded-t-md border-b border-gray-700">
                              <button type="button" onClick={() => wrapText('**', '**')} className="px-3 py-1 text-sm font-bold text-white hover:bg-gray-700 rounded">B</button>
                              <button type="button" onClick={() => wrapText('*', '*')} className="px-3 py-1 text-sm italic text-white hover:bg-gray-700 rounded">I</button>
                              <button type="button" onClick={() => wrapText('~~', '~~')} className="px-3 py-1 text-sm line-through text-white hover:bg-gray-700 rounded">S</button>
                              <button type="button" onClick={() => wrapText('\n# ', '\n')} className="px-3 py-1 text-sm font-bold text-white hover:bg-gray-700 rounded">H1</button>
                              <button type="button" onClick={() => wrapText('\n## ', '\n')} className="px-3 py-1 text-sm font-bold text-white hover:bg-gray-700 rounded">H2</button>
                              <button type="button" onClick={() => wrapText('\n### ', '\n')} className="px-3 py-1 text-sm font-bold text-white hover:bg-gray-700 rounded">H3</button>
                          </div>
                          <textarea
                              ref={textareaRef}
                              rows={15}
                              className="block w-full bg-gray-800 border-gray-600 rounded-b-md focus:ring-0 sm:text-lg text-white placeholder-gray-500 p-3 resize-y"
                              placeholder="Write your post here..."
                              value={content}
                              onChange={(e) => setContent(e.target.value)}
                              onPaste={handlePaste}
                          />
                        </div>
                      ) : (
                      <div className="prose prose-lg dark:prose-invert max-w-none bg-gray-800 p-3 rounded-md text-white overflow-auto" style={{ minHeight: 360 }}>
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw, [rehypeSanitize, customSchema]]}>{content || '*Preview will appear here*'}</ReactMarkdown>
                      </div>
                      )}
                  </div>
              </div>

              {/* Image Management Section */}
              {existingImages.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">รูปภาพที่มีอยู่</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={`${imageUrl}-${index}`} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Existing image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border border-gray-600"
                          onError={(e) => {
                            console.error('Failed to load image:', imageUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-md flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(imageUrl)}
                            className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-all duration-200"
                            title="ลบรูปภาพ"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        {imagesToDelete.has(imageUrl) && (
                          <div className="absolute inset-0 bg-red-900 bg-opacity-75 rounded-md flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-white text-xs mb-2">จะถูกลบ</p>
                              <button
                                type="button"
                                onClick={() => handleUndoDeleteImage(imageUrl)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-1">
                      <label htmlFor="image-upload-edit" className="cursor-pointer text-white hover:text-accent p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </label>
                      <input id="image-upload-edit" type="file" accept="image/*" className="hidden" onChange={handleFileChange} multiple />
                      <button type="button" className="cursor-pointer text-white hover:text-accent p-2 rounded-full" onClick={() => setShowEmojiPicker(prev => !prev)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                      <button type="button" className="cursor-pointer text-white hover:text-accent p-2 rounded-full" onClick={() => setShowMarkdownHelp(prev => !prev)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4 0 1.105-.448 2.105-1.172 2.828a4.002 4.002 0 00-2.828 1.172V15m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                  </div>

                  <div className="flex items-center">
                      {error && <p className="text-red-500 text-sm mr-4">{error}</p>}
                      <button
                          type="button"
                          onClick={() => handleDelete()}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full mr-auto"
                      >
                          Delete Post
                      </button>
                      <button
                          type="button"
                          onClick={() => router.back()}
                          className="bg-gray-600 text-white px-4 py-2 rounded-full mr-2"
                      >
                          Cancel
                      </button>
                      <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full disabled:opacity-50"
                          disabled={loading}
                      > 
                          {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                  </div>
              </div>
              {showEmojiPicker && (
                <div className="mt-2">
                  <EmojiPicker onEmojiClick={onEmojiClick} width="100%" theme={Theme.DARK} />
                </div>
              )}
          </form>
      </div>

      {/* Markdown Help Panel */}
      <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-y-auto ${showMarkdownHelp ? 'w-72 pl-4' : 'w-0'}`}>
        <div className={`h-full p-4 bg-gray-900/50 rounded-md border border-gray-700 text-sm text-gray-300 ${!showMarkdownHelp && 'hidden'}`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-white">Markdown Guide</h3>
            <button type="button" onClick={() => setShowMarkdownHelp(false)} className="text-gray-400 hover:text-white">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <ul className="list-disc list-inside space-y-2">
              <li><code># Heading 1</code></li>
              <li><code>**Bold**</code></li>
              <li><code>*Italic*</code></li>
              <li><code>- List item</code></li>
              <li><code>[Link](https://...)</code></li>
              <li>Paste image to upload</li>
            </ul>
        </div>
      </div>
    </div>
  );
}