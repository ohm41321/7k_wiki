import { createSupabaseServerComponentClient } from '@/lib/supabase/utils';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('is_active', true)
      .order('event_date', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);

  try {
    // For admin operations, we'll use a simple token-based auth
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.ADMIN_API_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const eventData = await req.json();
    const { title, description, event_date, event_time, game, event_type } = eventData;

    if (!title || !event_date || !event_type) {
      return NextResponse.json({ message: 'Missing required fields: title, event_date, event_type' }, { status: 400 });
    }

    const newEvent = {
      title,
      description,
      event_date,
      event_time,
      game,
      event_type,
      is_active: true,
    };

    const { data, error } = await supabase.from('calendar_events').insert(newEvent).select().single();

    if (error) {
      console.error('Error creating event:', error);
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);

  try {
    // For admin operations, we'll use a simple token-based auth
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.ADMIN_API_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const eventData = await req.json();
    const { id, title, description, event_date, event_time, game, event_type, is_active } = eventData;

    if (!id || !title || !event_date || !event_type) {
      return NextResponse.json({ message: 'Missing required fields: id, title, event_date, event_type' }, { status: 400 });
    }

    const updateData = {
      title,
      description,
      event_date,
      event_time,
      game,
      event_type,
      is_active,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      throw error;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);

  try {
    // For admin operations, we'll use a simple token-based auth
    // In production, you'd want proper admin role checking
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.ADMIN_API_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing event ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('Error deleting event:', error);
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: message || 'Internal Server Error' }, { status: 500 });
  }
}