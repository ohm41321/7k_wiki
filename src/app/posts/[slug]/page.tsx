'use server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import PostClient from './PostClient';
import { notFound } from 'next/navigation';

interface PostData {
  slug: string;
  title: string;
  date: string;
  author: string;
  content: string;
  imageUrls?: string[];
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postsDirectory = path.join(process.cwd(), 'posts');
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return notFound();
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  let imageUrls: string[] | undefined = undefined;
  if (data.imageUrls) {
    imageUrls = data.imageUrls.map((url: string) => (url.startsWith('/') ? url : url));
  }

  const post: PostData = {
    slug,
    title: data.title,
    date: data.date,
    author: data.author,
    content,
    imageUrls,
  };
  return <PostClient post={post} />;
}