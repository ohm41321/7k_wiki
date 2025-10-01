'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import Toast from '@/app/components/Toast';

interface EditPostFormProps {
  post: {
    slug: string;
    title: string;
    content: string;
    tags: string[];
    imageUrls?: string[];
  };
}

export default function EditPostForm({ post }: EditPostFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [title, setTitle] = useState(post.title);
  const [tags, setTags] = useState(post.tags.join(', '));
  const [content, setContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToastMessage, setShowToastMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${post.slug}`,
       {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, tags }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update post');
      }

      setShowToastMessage('Post updated successfully!');
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push(`/7k-re-fonzu/posts/${post.slug}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  if (status === 'loading') {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="bg-gray-900/30 p-6 sm:p-8 rounded-lg shadow-xl">
        {showToastMessage && (
            <Toast message={showToastMessage} onClose={() => setShowToastMessage(null)} />
        )}
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
                    <textarea
                        ref={textareaRef}
                        rows={15}
                        className="block w-full bg-gray-800 border-gray-600 rounded-md focus:ring-0 sm:text-lg text-white placeholder-gray-500 p-3 resize-y"
                        placeholder="Write your post here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    ) : (
                    <div className="prose prose-lg dark:prose-invert max-w-none bg-gray-800 p-3 rounded-md text-white overflow-auto" style={{ minHeight: 360 }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>{
                        content || '*Preview will appear here*'
                        }</ReactMarkdown>
                    </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-end pt-4 mt-4 border-t border-gray-700">
                {error && <p className="text-red-500 text-sm mr-4">{error}</p>}
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
                    disabled={loading || !title.trim()}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    </div>
  );
}
