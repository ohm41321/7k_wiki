import { createSupabaseReqResClient } from '@/lib/supabase/utils';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Force Node.js runtime

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseReqResClient(req, res);
  const { email, password } = await req.json();

  // --- DIAGNOSTIC STEP --- 
  // We are only calling signUp and not creating a user profile
  // to test if the admin client is the cause of the 500 error.

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // For this test, we will just return a success message.
  // The user profile will NOT be created.
  return NextResponse.json(
    { message: 'TEST SUCCESSFUL: signUp completed without crashing.' },
    { status: 200, headers: res.headers }
  );
}