'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Lightbox from '@/app/components/Lightbox';
import CommentList from '@/app/components/CommentList';
import CommentForm from '@/app/components/CommentForm';

interface PostClientProps {
  post: {
    slug: string;
    title: string;
    date: string;
    author: string;
    content: string;
    category: string;
    tags: string[];
    imageUrls?: string[];
  };
}

export default function PostClient({ post }: PostClientProps) {
  const [lightbox, setLightbox] = useState<{ images: string[]; startIndex: number } | null>(null);

  useEffect(() => {
    const handleContentImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.closest('#post-content')) {
        const contentImages = Array.from(document.querySelectorAll('#post-content img')).map(img => (img as HTMLImageElement).src);
        const clickedIndex = contentImages.indexOf((target as HTMLImageElement).src);
        if (clickedIndex !== -1) {
          setLightbox({ images: contentImages, startIndex: clickedIndex });
        }
      }
    };

    document.addEventListener('click', handleContentImageClick);

    return () => {
      document.removeEventListener('click', handleContentImageClick);
    };
  }, []);

  const formatDateThai = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Bangkok' });
  };

  const formatTimeThai = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  };

  return (
    <div className="bg-primary min-h-screen text-textLight">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article>
          <header className="mb-8 text-center">
            {post.category && (
              <Link href={`/category/${post.category.toLowerCase()}`}>
                <span className="text-accent font-bold text-lg hover:underline">{post.category}</span>
              </Link>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold text-secondary mb-3">{post.title}</h1>
            <p className="text-textDark" suppressHydrationWarning>
              By {post.author} on {formatDateThai(post.date)} at {formatTimeThai(post.date)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {post.tags.map(tag => (
                <Link href={`/tags/${tag.toLowerCase()}`} key={tag}>
                  <span className="bg-gray-700 text-textLight px-2 py-1 rounded-md text-sm hover:bg-gray-600">#{tag}</span>
                </Link>
              ))}
            </div>
          </header>

          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {post.imageUrls.map((url, index) => (
                <div key={index} className="cursor-pointer" onClick={() => setLightbox({ images: post.imageUrls || [], startIndex: index })}>
                  <Image
                    src={url}
                    alt={`${post.title} - Image ${index + 1}`}
                    width={800}
                    height={450}
                    className="w-full h-auto rounded-lg shadow-lg object-cover hover:opacity-90 transition-opacity"
                  />
                </div>
              ))}
            </div>
          )}

          <div
            id="post-content"
            className="prose prose-invert prose-lg mx-auto post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <CommentList slug={post.slug} />
        <CommentForm slug={post.slug} />
      </main>

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          startIndex={lightbox.startIndex}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}