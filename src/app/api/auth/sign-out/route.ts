import { createSupabaseServerComponentClient } from '@/lib/supabase/utils';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Force Node.js runtime

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);

  await supabase.auth.signOut();

  return NextResponse.json({ message: 'Success!' });
}