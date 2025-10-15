
import { NextResponse, type NextRequest } from 'next/server';
import { getPosts } from '@/app/lib/posts';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameFilter = searchParams.get('game');

  const posts = await getPosts();

  // Filter posts by game if specified
  let filteredPosts = posts;
  if (gameFilter) {
    filteredPosts = posts.filter((post: any) => post.game === gameFilter);
    console.log(`API filtering posts for game: ${gameFilter}, found: ${filteredPosts.length}`);
  } else {
    console.log('API returning all posts:', posts.length);
  }

  // Prevent caching to ensure fresh data
  const response = NextResponse.json(filteredPosts);
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}
