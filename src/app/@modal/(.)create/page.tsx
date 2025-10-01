'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/app/components/Modal';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkBreaks from 'remark-breaks';
import { transformForPreview } from '@/lib/markdown';
import Toast from '@/app/components/Toast';

// shared transforms are in src/lib/markdown.ts

export default function CreatePostModal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // no-op: preview is produced via transformForPreview below

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setSelectedFiles(prev => [...prev, file]);
          setImagePreviews(prev => [...prev, URL.createObjectURL(file)]);
        }
        e.preventDefault();
        break;
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const url = prev[index];
  try { URL.revokeObjectURL(url); } catch { }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => {
    try { URL.revokeObjectURL(url); } catch { }
      });
    };
  }, [imagePreviews]);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setContent(prev => prev + emojiData.emoji);
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

    // Focus and select the placeholder text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selectedText.length || 'text'.length));
    }, 0);
  };

  const handleImageUploads = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`Failed to upload image: ${file.name}`);
        const data = await res.json();
        uploadedUrls.push(data.imageUrl);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!content.trim() && selectedFiles.length === 0) {
      setError('Post must have content or an image.');
      return;
    }
    setLoading(true);
    setError(null);

    const imageUrls = await handleImageUploads();
    if (selectedFiles.length > 0 && imageUrls.length === 0) {
      setLoading(false);
      setError('Image upload failed. Please try again.');
      return;
    }

    const author = session?.user?.name || 'Anonymous';

    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, content, imageUrls, tags }),
      });

      if (!res.ok) throw new Error('Failed to create post');
      // show a success toast so the user sees it, then navigate back after a short delay
      setShowToastMessage('Post created successfully!');
      // clear inputs quickly
      setTitle('');
      setContent('');
      setTags('');
      setSelectedFiles([]);
      setImagePreviews(prev => {
  prev.forEach(url => { try { URL.revokeObjectURL(url); } catch { } });
        return [];
      });
      // allow toast to be visible briefly
      await new Promise(resolve => setTimeout(resolve, 900));
      router.refresh();
      router.back();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const [showToastMessage, setShowToastMessage] = useState<string | null>(null);
  
  if (status === 'loading') {
    return <Modal><div className="text-center">Loading...</div></Modal>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <Modal>
      <div className="flex">
        {/* Main Content Area */}
        <div className="flex-grow transition-all duration-300 ease-in-out">
          {showToastMessage && (
            <Toast message={showToastMessage} onClose={() => setShowToastMessage(null)} />
          )}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-xl font-bold text-textLight">{session?.user?.name?.charAt(0)}</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <form onSubmit={handleSubmit}>
                <div className="border-b border-gray-700 pb-4">
                  <input
                    type="text"
                    className="block w-full bg-transparent border-0 focus:ring-0 sm:text-lg font-bold text-white placeholder-gray-500"
                    placeholder="Post Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="mt-2 block w-full bg-transparent border-0 focus:ring-0 sm:text-sm text-white placeholder-gray-500"
                    placeholder="Tags (comma-separated, e.g., Guide, PvP, Beginner)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                  <div className="mt-2">
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
                            rows={12}
                            className="block w-full bg-transparent border border-gray-800 resize-none focus:ring-0 sm:text-lg text-white placeholder-gray-500 p-3 rounded-b-md"
                            placeholder="Write your post here. You can use Markdown like # headings, - lists, **bold**, and other formatting."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onPaste={handlePaste}
                          />
                        </div>
                      ) : (
                        <div className="prose prose-lg dark:prose-invert max-w-none bg-gray-900 p-3 rounded-md text-white overflow-auto" style={{ minHeight: 300 }}>
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{
                            content || '*Preview will appear here*'
                          }</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md bg-gray-800">
                      <img src={preview} alt={`Image Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-75"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1">
                    <label htmlFor="image-upload" className="cursor-pointer text-white hover:text-accent p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      multiple
                    />
                    <button 
                      type="button" 
                      className="cursor-pointer text-white hover:text-accent p-2 rounded-full"
                      onClick={() => setShowEmojiPicker(prev => !prev)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      className="cursor-pointer text-white hover:text-accent p-2 rounded-full"
                      onClick={() => setShowMarkdownHelp(prev => !prev)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4 0 1.105-.448 2.105-1.172 2.828a4.002 4.002 0 00-2.828 1.172V15m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center">
                    {error && <p className="text-red-500 text-sm mr-4">{error}</p>}
                    <button
                      type="submit"
                      className="bg-white text-black px-4 py-2 rounded-full disabled:opacity-50"
                      disabled={loading || !title.trim()}
                    >
                      {loading ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
                {showEmojiPicker && (
                  <div className="mt-2">
                    {/* Leave out theme prop to avoid typing mismatch in this project's typings */}
                    <EmojiPicker onEmojiClick={onEmojiClick} width="100%" />
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Markdown Help Panel */}
        <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-y-auto ${showMarkdownHelp ? 'w-72 pl-4' : 'w-0'}`}>
          <div className={`h-full p-4 bg-gray-900 rounded-md border border-gray-700 text-sm text-gray-300 ${!showMarkdownHelp && 'hidden'}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-white">Markdown Guide</h3>
              <button type="button" onClick={() => setShowMarkdownHelp(false)} className="text-gray-400 hover:text-white">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="list-disc list-inside space-y-2">
              <li><code># Heading 1</code> - Biggest heading</li>
              <li><code>## Heading 2</code> - Medium heading</li>
              <li><code>### Heading 3</code> - Smallest heading</li>
              <li><code>**Bold Text**</code> - Makes text bold</li>
              <li><code>*Italic Text*</code> - Makes text italic</li>
              <li><code>- List item</code> - Creates a bulleted list</li>
              <li><code>[Link Text](https://example.com)</code> - Creates a link</li>
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// transforms live in src/lib/markdown.ts