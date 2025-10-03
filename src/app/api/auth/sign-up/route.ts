import { createSupabaseServerComponentClient } from '@/lib/supabase/utils';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Force Node.js runtime

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);
  const { email, password, username } = await req.json();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      user_metadata: {
        username: username,
      }
    }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Success! Please check your email to confirm.' });
}