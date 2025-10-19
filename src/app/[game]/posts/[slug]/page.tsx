import { getPostBySlug } from '@/app/lib/posts';
import PostClient from './PostClient';
import { Metadata } from 'next';
import { Suspense } from 'react';
import Loading from '@/app/loading';
import { notFound } from 'next/navigation';

type Props = {
  params: { slug: string; game: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
   const post = await getPostBySlug(params.slug);

   if (!post || post.game !== params.game) {
     return notFound();
   }

   // Get the first image for preview, or use default
   const previewImage = post.imageurls && post.imageurls.length > 0
     ? post.imageurls[0]
     : '/pic/7k_banner.webp';

   // Clean description for meta tags
   const cleanDescription = post.content
     ? post.content.replace(/[#*`~]/g, '').substring(0, 200) + '...'
     : 'อ่านบทความและข่าวสารเกมกาชาล่าสุดจาก Fonzu Wiki';

   const baseUrl = 'https://fonzu-wiki.vercel.app';
   const postUrl = `${baseUrl}/${post.game}/posts/${post.slug}`;

   return {
     title: `${post.title} | Fonzu Wiki`,
     description: cleanDescription,
     openGraph: {
       title: `${post.title} | Fonzu Wiki`,
       description: cleanDescription,
       url: postUrl,
       siteName: 'Fonzu Wiki',
       locale: 'th_TH',
       type: 'article',
       images: [
         {
           url: previewImage,
           width: 1200,
           height: 630,
           alt: post.title,
         },
       ],
     },
     twitter: {
       card: 'summary_large_image',
       title: `${post.title} | Fonzu Wiki`,
       description: cleanDescription,
       images: [previewImage],
       creator: '@fonzuwiki',
     },
     alternates: {
       canonical: postUrl,
     },
   };
 }

export default async function PostPage({ params }: { params: { slug: string; game: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post || post.game !== params.game) {
    return notFound();
  }

  return (
    <Suspense fallback={<Loading />}>
      <PostClient post={post} />
    </Suspense>
  );
}
