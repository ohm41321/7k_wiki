import { createSupabaseReqResClient } from '@/lib/supabase/utils';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseReqResClient(req, res);

  await supabase.auth.signOut();

  // Return a new response with a JSON body, but with the headers from `res` to clear the cookie.
  return new NextResponse(JSON.stringify({ message: 'Success!' }), {
    status: 200,
    headers: res.headers,
  });
}
