'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Lightbox from '@/app/components/Lightbox';
import CommentList from '@/app/components/CommentList';
import CommentForm from '@/app/components/CommentForm';

import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { transformForPreview } from '@/lib/markdown';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
    game: string;
  };
}



export default function PostClient({ post }: PostClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [lightbox, setLightbox] = useState<{ images: string[]; startIndex: number } | null>(null);
  const [imageGridView, setImageGridView] = useState(true);



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

        <article className="bg-gray-900/30 p-6 sm:p-8 rounded-lg shadow-xl">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="md:w-2/3">
                {post.category && (
                  <Link href={`/${post.game}/category/${post.category.toLowerCase()}`}>
                    <span className="text-accent font-bold text-lg hover:underline">{post.category}</span>
                  </Link>
                )}
                <h1 className="text-4xl md:text-5xl font-extrabold text-secondary mt-1">{post.title}</h1>
              </div>
              <div className="md:w-1/3 md:text-right mt-2 md:mt-0 flex-shrink-0">
                <p className="text-textLight/80" suppressHydrationWarning>
                  By <span className="font-semibold text-secondary">{post.author}</span>
                </p>
                <p className="text-sm text-textLight/60" suppressHydrationWarning>
                  {formatDateThai(post.date)} at {formatTimeThai(post.date)}
                </p>
                {session?.user?.name === post.author && (
                  <div className="mt-4">
                    <button 
                      onClick={() => router.push(`/${post.game}/posts/${post.slug}/edit`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors"
                    >
                      Edit Post
                    </button>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2 md:justify-end">
                  {post.tags.map(tag => (
                    <Link href={`/${post.game}/tags/${tag.toLowerCase()}`} key={tag}>
                      <span className="bg-gray-700 text-textLight px-2 py-1 rounded-md text-xs hover:bg-gray-600 transition-colors">#{tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <hr className="border-gray-700 my-8" />

          {/* Image Section */}
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => setImageGridView(!imageGridView)}
                  className="px-4 py-2 bg-gray-700 text-textLight rounded-md hover:bg-gray-600 transition-colors text-sm"
                >
                  {imageGridView ? 'View Original Sizes' : 'View Grid'}
                </button>
              </div>
              {imageGridView ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {post.imageUrls.map((url, index) => (
                    <div 
                      key={index} 
                      className="cursor-pointer relative aspect-video rounded-lg shadow-md overflow-hidden" 
                      onClick={() => setLightbox({ images: post.imageUrls || [], startIndex: index }) }
                    >
                      <Image
                        src={url}
                        alt={`${post.title} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:opacity-90 transition-opacity"
                        unoptimized={true}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {post.imageUrls.map((url, index) => (
                    <div 
                      key={index} 
                      className="cursor-pointer" 
                      onClick={() => setLightbox({ images: post.imageUrls || [], startIndex: index }) }
                    >
                      <Image
                        src={url}
                        alt={`${post.title} - Image ${index + 1}`}
                        width={1920}
                        height={1080}
                        className="w-full h-auto rounded-lg shadow-lg"
                        unoptimized={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div id="post-content" className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-lg">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkBreaks]} 
              rehypePlugins={[rehypeRaw]}
            >
              {transformForPreview(post.content)}
            </ReactMarkdown>
          </div>
        </article>

        <hr className="border-gray-700 my-12" />

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
      <Link href={`/${post.game}`}>
        <span className="fixed top-20 left-8 z-40 bg-secondary hover:bg-accent text-white font-bold py-3 px-4 rounded-full shadow-lg transition-transform duration-200 ease-in-out hover:scale-105 flex items-center gap-2 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>กลับไปหน้ารวมโพสต์</span>
        </span>
      </Link>
    </div>
  );
}