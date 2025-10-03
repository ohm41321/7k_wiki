import { createSupabaseReqResClient, createSupabaseAdminClient } from '@/lib/supabase/utils';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Using NextResponse.next() to get a response object that can be modified
  const res = NextResponse.next();
  const supabase = createSupabaseReqResClient(req, res);
  const { login, password } = await req.json();

  let emailToSignIn: string;

  const isEmail = login.includes('@');

  if (isEmail) {
    emailToSignIn = login;
  } else {
    const supabaseAdmin = createSupabaseAdminClient();
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', login)
      .single();

    if (findError || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(user.id);

    if (authUserError || !authUser.user.email) {
      return NextResponse.json({ error: 'Could not find user email' }, { status: 500 });
    }
    
    emailToSignIn = authUser.user.email;
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: emailToSignIn,
    password,
  });

  if (signInError) {
    return NextResponse.json({ error: signInError.message }, { status: 400 });
  }

  // The `res` object now has the session cookie set by the Supabase client.
  // We return a new JSON response, but with the headers from `res` to include the cookie.
  return NextResponse.json({ message: 'Success!' }, { status: 200, headers: res.headers });
}
