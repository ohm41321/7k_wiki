import { createSupabaseServerComponentClient } from '@/lib/supabase/utils';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);

  try {
    const { searchParams } = new URL(req.url);

    // Extract search parameters
    const query = searchParams.get('q') || '';
    const game = searchParams.get('game') || '';
    const tags = searchParams.get('tags') || '';
    const author = searchParams.get('author') || '';
    const category = searchParams.get('category') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build the query
    let supabaseQuery = supabase
      .from('posts')
      .select('*', { count: 'exact' });

    // Text search in title and content
    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
    }

    // Filter by game
    if (game) {
      supabaseQuery = supabaseQuery.eq('game', game);
    }

    // Filter by category
    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category);
    }

    // Filter by tags (assuming tags is a comma-separated string)
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      supabaseQuery = supabaseQuery.overlaps('tags', tagArray);
    }

    // Filter by author
    if (author) {
      supabaseQuery = supabaseQuery.ilike('author_name', `%${author}%`);
    }

    // Filter by date range
    if (startDate) {
      supabaseQuery = supabaseQuery.gte('created_at', startDate);
    }
    if (endDate) {
      supabaseQuery = supabaseQuery.lte('created_at', endDate);
    }

    // Sort options
    const validSortFields = ['created_at', 'title', 'author_name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? true : false;

    supabaseQuery = supabaseQuery
      .order(sortField, { ascending: order })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await supabaseQuery;

    if (error) {
      console.error('Error searching posts:', error);
      throw error;
    }

    // Get unique values for filter options
    const { data: gamesData } = await supabase
      .from('posts')
      .select('game')
      .not('game', 'is', null);

    const { data: categoriesData } = await supabase
      .from('posts')
      .select('category')
      .not('category', 'is', null);

    const { data: authorsData } = await supabase
      .from('posts')
      .select('author_name')
      .not('author_name', 'is', null);

    const { data: tagsData } = await supabase
      .from('posts')
      .select('tags')
      .not('tags', 'is', null);

    // Extract unique values
    const games = [...new Set(gamesData?.map(item => item.game).filter(Boolean))];
    const categories = [...new Set(categoriesData?.map(item => item.category).filter(Boolean))];
    const authors = [...new Set(authorsData?.map(item => item.author_name).filter(Boolean))];
    const allTags = [...new Set(tagsData?.flatMap(item => item.tags).filter(Boolean))];

    return NextResponse.json({
      posts: data || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
      hasNextPage: offset + limit < (count || 0),
      hasPrevPage: page > 1,
      filters: {
        games: games.sort(),
        categories: categories.sort(),
        authors: authors.sort(),
        tags: allTags.sort()
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search posts' },
      { status: 500 }
    );
  }
}