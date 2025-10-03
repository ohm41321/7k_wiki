import { createSupabaseServerComponentClient } from '@/lib/supabase/utils';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs'; // Force Node.js runtime

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerComponentClient(cookieStore);
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      // Redirect to an error page or home page with an error message
      return NextResponse.redirect(new URL('/?error=auth_error', req.url));
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/', req.url));
}