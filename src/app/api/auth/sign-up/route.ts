import { createSupabaseReqResClient, createSupabaseAdminClient } from '@/lib/supabase/utils';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Force Node.js runtime

export async function POST(req: NextRequest) {
  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server configuration error: Missing Supabase environment variables.' }, { status: 500 });
  }

  const res = NextResponse.next();
  const supabase = createSupabaseReqResClient(req, res);
  const { email, password, username }: { [key: string]: string } = await req.json();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      }
    }
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  if (!authData.user) {
    return NextResponse.json({ error: 'User not created in auth' }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error: userError } = await supabaseAdmin.from('users').insert([{
    id: authData.user.id,
    username,
  }]);

  if (userError) {
    console.error('Error creating user profile:', userError);
    return NextResponse.json({ error: 'Could not create user profile.' }, { status: 500 });
  }

  // Return a JSON response while preserving the headers from the original response
  return NextResponse.json(
    { message: 'Success! Please check your email to confirm.' },
    { status: 200, headers: res.headers }
  );
}
