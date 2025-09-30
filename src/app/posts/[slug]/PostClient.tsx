"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import Lightbox from '@/app/components/Lightbox';
import Toast from '@/app/components/Toast';

interface PostData {
  slug: string;
  title: string;
  date: string;
  author: string;
  content: string;
  imageUrls?: string[];
}

export default function PostClient({ post }: { post: PostData }) {
  const router = useRouter();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [objectFitStyle, setObjectFitStyle] = useState<'cover' | 'contain'>('cover');

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/posts/${post.slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete post');
      setShowToastMessage('Post deleted successfully!');
      // refresh homepage data then navigate home
      router.refresh();
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setShowToastMessage(`Error: ${message}`);
    }
  };

  const [showToastMessage, setShowToastMessage] = useState<string | null>(null);

  return (
    <>
      {showToastMessage && (
        <Toast message={showToastMessage} onClose={() => setShowToastMessage(null)} />
      )}
      <article className="bg-primary-dark bg-opacity-50 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <div className="p-4 flex justify-end">
          <button
            onClick={() => setObjectFitStyle(prev => prev === 'cover' ? 'contain' : 'cover')}
            className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm"
          >
            Toggle Image Fit: {objectFitStyle}
          </button>
        </div>

        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
            {post.imageUrls.map((url, index) => (
              <div key={index} className="relative w-full aspect-square cursor-pointer" onClick={() => openLightbox(index)}>
                <Image src={url} alt={`${post.title} - Image ${index + 1}`} fill style={{ objectFit: objectFitStyle }} className="rounded-md" />
              </div>
            ))}
          </div>
        )}

        <div className="p-6 md:p-10">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-secondary">{post.title}</h1>
          <p className="text-textLight text-sm text-center mb-8" suppressHydrationWarning>
            By {post.author} | {new Date(post.date).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Bangkok' })} - {new Date(post.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })}
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none mx-auto text-textLight prose-headings:text-secondary prose-a:text-accent prose-strong:text-white prose-blockquote:border-accent prose-code:bg-gray-900 prose-code:p-1 prose-code:rounded-md">
            {/* Preprocess ++underline++ -> <u>..</u> and convert single newlines to hard breaks so saved posts show the same line breaks as the editor */}
            {(() => {
              const processed = post.content
                .replace(/\+\+(.+?)\+\+/g, '<u>$1</u>')
                // explicit <br/> for single newlines so rehypeRaw will render them
                .replace(/([^\n])\r?\n(?!\r?\n)/g, '$1<br/>\n');
              return <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>{processed}</ReactMarkdown>;
            })()}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-700 flex justify-center items-center gap-4">
            <Link href="/" className="px-6 py-2 rounded-md font-semibold text-textLight bg-gray-700 hover:bg-gray-600 transition-colors">
              Back to Home
            </Link>
            <button onClick={handleDelete} className="px-6 py-2 rounded-md font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">Delete Post</button>
          </div>
        </div>
      </article>

      {lightboxOpen && post.imageUrls && (
        <Lightbox images={post.imageUrls} startIndex={selectedImageIndex} onClose={closeLightbox} />
      )}
    </>
  );
}
