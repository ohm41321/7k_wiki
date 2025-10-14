import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerComponentClient } from '@/lib/supabase/utils';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

// GET - Fetch published announcements for users
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createSupabaseServerComponentClient(cookieStore);

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // Filter by announcement type

    let query = supabase
      .from('announcements')
      .select('*')
      .eq('published', true)
      .eq('active', true)
      .not('expires_at', 'is', null)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('priority', { ascending: false })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by type if specified
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }

    return NextResponse.json({
      announcements: data || [],
      totalCount: count || 0,
      hasMore: (offset + limit) < (count || 0)
    });

  } catch (error) {
    console.error('Announcements API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST - Create new announcement (Admin only)
export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.ADMIN_API_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = cookies();
    const supabase = createSupabaseServerComponentClient(cookieStore);

    const announcementData = await req.json();
    const {
      title,
      content,
      type = 'info',
      version,
      priority = 1,
      target_audience = 'all',
      game,
      image_url,
      action_url,
      action_text = 'ดูเพิ่มเติม',
      expires_at
    } = announcementData;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { message: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    // Get current user for created_by field
    const { data: { user } } = await supabase.auth.getUser();

    const newAnnouncement = {
      title,
      content,
      type,
      version,
      priority,
      target_audience,
      game,
      image_url,
      action_url,
      action_text,
      expires_at,
      published: false, // Draft by default
      created_by: user?.id
    };

    const { data, error } = await supabase
      .from('announcements')
      .insert(newAnnouncement)
      .select()
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Create announcement error:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

// PUT - Update announcement (Admin only)
export async function PUT(req: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.ADMIN_API_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = cookies();
    const supabase = createSupabaseServerComponentClient(cookieStore);

    const updateData = await req.json();
    const { id, ...fieldsToUpdate } = updateData;

    if (!id) {
      return NextResponse.json(
        { message: 'Missing announcement ID' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    fieldsToUpdate.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('announcements')
      .update(fieldsToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Update announcement error:', error);
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

// DELETE - Delete announcement (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.ADMIN_API_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = cookies();
    const supabase = createSupabaseServerComponentClient(cookieStore);

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Missing announcement ID' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete announcement error:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}