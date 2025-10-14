
import { NextResponse } from 'next/server';
import { getPosts } from '@/app/lib/posts';

export async function GET() {
  const posts = await getPosts();
  console.log('API returning posts:', posts);

  // Prevent caching to ensure fresh data
  const response = NextResponse.json(posts);
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}
