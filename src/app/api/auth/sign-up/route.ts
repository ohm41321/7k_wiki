import { createSupabaseReqResClient } from '@/lib/supabase/utils';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Force Node.js runtime

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseReqResClient(req, res);
  const { email, password, username } = await req.json();

  // The database trigger will now automatically create the user profile.
  // We just need to pass the username in the options metadata.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      }
    }
  });

  if (error) {
    // The error message from Supabase (e.g., "User already registered") is sent to the client.
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: 'Success! Please check your email to confirm.' },
    { headers: res.headers }
  );
}
