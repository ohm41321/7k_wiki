'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Modal } from '@/app/components/Modal';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkBreaks from 'remark-breaks';
import { toast } from 'sonner';

const customSchema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src || []), 'blob', 'data'],
  },
};

export default function CreatePostModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const game = searchParams.get('game');
  
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [stagedFiles, setStagedFiles] = useState<Map<string, File>>(new Map());
  
    useEffect(() => {
      return () => {
        stagedFiles.forEach((_, blobUrl) => URL.revokeObjectURL(blobUrl));
      };
    }, [stagedFiles]);
  
    const stageImageForUpload = (file: File) => {
      const blobUrl = URL.createObjectURL(file);
      // แก้ไข: ใช้ template literal ที่ถูกต้อง ไม่มี newline
      const placeholder = `![Uploading ${file.name}...](${blobUrl})`;
      setContent(prev => prev + '\n' + placeholder + '\n');
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
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return setError('Title is required.');
      if (!content.trim()) return setError('Post must have content.');
      
      setLoading(true);
      setError(null);
  
      const promise = async () => {
        let finalContent = content;
        const imageUrls: string[] = [];
        
        // แก้ไข: ใช้ regex ที่รองรับทั้ง single line และ multiline
        const markdownImageRegex = /!\[([^\]]*)\]\((blob:[^)]+)\)/g;
        const matches = [...content.matchAll(markdownImageRegex)];
  
        // อัปโหลดรูปภาพทั้งหมด
        for (const match of matches) {
          const blobUrl = match[2];
          const fileToUpload = stagedFiles.get(blobUrl);
          
          if (fileToUpload) {
            try {
              const formData = new FormData();
              formData.append('file', fileToUpload);
              
              const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
              });
              
              if (!uploadRes.ok) {
                const errorData = await uploadRes.json().catch(() => ({}));
                throw new Error(errorData.error || 'Upload failed');
              }
              
              const data = await uploadRes.json();
              
              // แทนที่ blob URL ด้วย URL จริง
              finalContent = finalContent.replace(blobUrl, data.url);
              imageUrls.push(data.url);
              
              // Cleanup: revoke blob URL หลังอัปโหลดสำเร็จ
              URL.revokeObjectURL(blobUrl);
            } catch (uploadError) {
              console.error('Failed to upload image:', uploadError);
              throw new Error(`Failed to upload image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
            }
          }
        }
  
        // สร้างโพสต์
        const res = await fetch('/api/posts/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content: finalContent,
            imageUrls,
            tags,
            game
          }),
        });
  
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to create post');
        }
        
        return await res.json();
      };
  
      toast.promise(promise(), {
        loading: 'Creating post...',
        success: (data) => {
          // Clear staged files
          setStagedFiles(new Map());
          router.refresh();
          setTimeout(() => router.back(), 500);
          return `Post "${data.title}" has been created.`;
        },
        error: (err) => {
          setLoading(false);
          setError(err.message);
          return `Error: ${err.message}`;
        },
        finally: () => setLoading(false),
      });
    };
  
    return (
      <Modal>
        <div className="flex">
          <div className="flex-grow transition-all duration-300 ease-in-out">
            <form onSubmit={handleSubmit} className="p-2 sm:p-4">
              <input
                type="text"
                className="block w-full bg-transparent border-0 focus:ring-0 sm:text-lg font-bold text-white placeholder-gray-500 mb-2"
                placeholder="Post Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                type="text"
                className="block w-full bg-transparent border-0 focus:ring-0 sm:text-sm text-white placeholder-gray-500 mb-4"
                placeholder="Tags (comma-separated, e.g., Guide, PvP, Beginner)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />            
            <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <button type="button" onClick={() => setActiveTab('write')} className={`${activeTab === 'write' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Write</button>
                <button type="button" onClick={() => setActiveTab('preview')} className={`${activeTab === 'preview' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Preview</button>
              </nav>
            </div>
            <div className="mt-4">
              {activeTab === 'write' ? (
                <div>
                  <div className="flex items-center space-x-1 sm:space-x-2 p-2 bg-gray-900 rounded-t-md border-b border-gray-700">
                    <button type="button" title="Bold" onClick={() => wrapText('**', '**')} className="px-2 py-1 text-xs sm:text-sm font-bold text-white hover:bg-gray-700 rounded">B</button>
                    <button type="button" title="Italic" onClick={() => wrapText('*', '*')} className="px-2 py-1 text-xs sm:text-sm italic text-white hover:bg-gray-700 rounded">I</button>
                    <button type="button" title="Strikethrough" onClick={() => wrapText('~~', '~~')} className="px-2 py-1 text-xs sm:text-sm line-through text-white hover:bg-gray-700 rounded">S</button>
                    <button type="button" title="Heading 1" onClick={() => wrapText('\n# ', '\n')} className="px-2 py-1 text-xs sm:text-sm font-bold text-white hover:bg-gray-700 rounded">H1</button>
                    <button type="button" title="Heading 2" onClick={() => wrapText('\n## ', '\n')} className="px-2 py-1 text-xs sm:text-sm font-bold text-white hover:bg-gray-700 rounded">H2</button>
                  </div>
                  <textarea
                    ref={textareaRef}
                    rows={12}
                    className="block w-full bg-transparent border border-gray-800 resize-none focus:ring-0 sm:text-lg text-white placeholder-gray-500 p-3 rounded-b-md"
                    placeholder="Write your post here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onPaste={handlePaste}
                  />
                </div>
              ) : (
                <div className="prose prose-lg dark:prose-invert max-w-none bg-gray-900 p-3 rounded-md text-white overflow-auto" style={{ minHeight: 300 }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw, [rehypeSanitize, customSchema]]}>{content || '*Preview will appear here*'}</ReactMarkdown>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-700">
              <div className="flex items-center space-x-1">
                <label htmlFor="image-upload" title="Upload Image" className="cursor-pointer text-white hover:text-accent p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </label>
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} multiple />
                <button type="button" title="Emoji" className="cursor-pointer text-white hover:text-accent p-2 rounded-full" onClick={() => setShowEmojiPicker(prev => !prev)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
                <button type="button" title="Markdown Help" className="cursor-pointer text-white hover:text-accent p-2 rounded-full" onClick={() => setShowMarkdownHelp(prev => !prev)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4 0 1.105-.448 2.105-1.172 2.828a4.002 4.002 0 00-2.828 1.172V15m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
              </div>
              <div className="flex items-center">
                {error && <p className="text-red-500 text-sm mr-4">{error}</p>}
                <button type="submit" className="bg-white text-black px-4 py-2 rounded-full disabled:opacity-50" disabled={loading}>
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
            {showEmojiPicker && (
              <div className="mt-2 absolute z-10">
                <EmojiPicker onEmojiClick={onEmojiClick} width="100%" theme={Theme.DARK} />
              </div>
            )}
          </form>
        </div>
        <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-y-auto ${showMarkdownHelp ? 'w-72 pl-4' : 'w-0'}`}>
          <div className={`h-full p-4 bg-gray-900 rounded-md border border-gray-700 text-sm text-gray-300 ${!showMarkdownHelp && 'hidden'}`}> 
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
    </Modal>
  );
}