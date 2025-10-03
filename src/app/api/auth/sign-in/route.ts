import { createSupabaseReqResClient, createSupabaseAdminClient } from '@/lib/supabase/utils';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const { login, password } = await req.json();

  let emailToSignIn: string;

  // Check if the login field is an email
  const isEmail = login.includes('@');

  if (isEmail) {
    emailToSignIn = login;
  } else {
    // If not an email, assume it's a username and find the corresponding email.
    // This requires an admin client to bypass RLS.
    const supabaseAdmin = createSupabaseAdminClient();
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('id') // We need to select a column, id is fine.
      .eq('username', login)
      .single();

    if (findError || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    // Now get the email from the auth.users table using the user id
    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(user.id);

    if (authUserError || !authUser.user.email) {
        return NextResponse.json({ error: 'Could not find user email' }, { status: 500 });
    }
    
    emailToSignIn = authUser.user.email;
  }

  // Now, attempt to sign in with the determined email
  const supabase = createSupabaseReqResClient(req, res);
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: emailToSignIn,
    password,
  });

  if (signInError) {
    return NextResponse.json({ error: signInError.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Success!' }, { status: 200 });
}