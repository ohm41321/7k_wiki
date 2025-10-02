'use client';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// IMPORTANT: Use service_role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET handler to fetch comments for a specific post slug.
 */
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;

  if (!slug) {
    return NextResponse.json({ error: 'Post slug is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_slug', slug)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase GET error:', error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to fetch comments: ${errorMessage}` }, { status: 500 });
  }
}

/**
 * POST handler to create a new comment for a specific post slug.
 */
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  
  if (!slug) {
    return NextResponse.json({ error: 'Post slug is required' }, { status: 400 });
  }

  try {
    const { content, author } = await request.json();

    if (!content || !author) {
      return NextResponse.json({ error: 'Missing content or author' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{ post_slug: slug, author, content }])
      .select()
      .single(); // .single() returns a single object instead of an array

    if (error) {
      console.error('Supabase POST error:', error);
      throw error;
    }

    return NextResponse.json(data, { status: 201 });

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to create comment: ${errorMessage}` }, { status: 500 });
  }
}