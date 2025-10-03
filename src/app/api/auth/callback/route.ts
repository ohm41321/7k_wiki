import { createSupabaseReqResClient } from '@/lib/supabase/utils';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseReqResClient(req, res);
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/', req.url));
}
