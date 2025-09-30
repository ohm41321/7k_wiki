'use server';

import PostClient from './PostClient';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/app/lib/posts';

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  return <PostClient post={post} />;
}