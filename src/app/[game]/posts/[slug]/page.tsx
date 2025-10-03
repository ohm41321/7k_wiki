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

  return {
    title: post.title,
    description: post.content.substring(0, 150),
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
