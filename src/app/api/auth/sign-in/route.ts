import { createSupabaseServerComponentClient } from '@/lib/supabase/utils';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Force Node.js runtime

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  // Note: Using createSupabaseServerComponentClient as it uses the correct cookie handling pattern for Route Handlers.
  const supabase = createSupabaseServerComponentClient(cookieStore);
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Read the session that should have been set via cookies by the server-side client
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    // still return success since sign in succeeded, but surface the session error for debugging
    console.error('Error fetching session after sign-in:', sessionError);
  }

  return NextResponse.json({ message: 'Success!', session: sessionData?.session ?? null });
}
