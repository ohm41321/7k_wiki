import { createSupabaseReqResClient, createSupabaseAdminClient } from '@/lib/supabase/utils';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  // Use the standard client for user-facing auth operations
  const supabase = createSupabaseReqResClient(req, res);
  const { email, password, username }: { [key: string]: string } = await req.json();

  // First, sign up the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Optional: add user metadata
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

  // Use the admin client to securely insert into the public.users table
  // This bypasses RLS policies, which is necessary because the user is not yet logged in.
  const supabaseAdmin = createSupabaseAdminClient();
  const { error: userError } = await supabaseAdmin.from('users').insert([{
    id: authData.user.id,
    username,
  }]);

  if (userError) {
    // If creating the user profile fails, you might want to delete the auth user
    // For simplicity, we just log the error here.
    console.error('Error creating user profile:', userError);
    // IMPORTANT: Do not expose detailed database errors to the client
    return NextResponse.json({ error: 'Could not create user profile.' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Success! Please check your email to confirm.' }, { status: 200 });
}
