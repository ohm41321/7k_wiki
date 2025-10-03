import { createSupabaseServerComponentClient } from '@/lib/supabase/utils';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session in /api/auth/session:', error);
      return NextResponse.json({ session: null }, { status: 200 });
    }

    return NextResponse.json({ session: data?.session ?? null });
  } catch (err) {
    console.error('Unexpected error in /api/auth/session:', err);
    return NextResponse.json({ session: null }, { status: 200 });
  }
}
