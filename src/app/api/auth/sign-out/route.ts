import { createSupabaseReqResClient } from '@/lib/supabase/utils';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseReqResClient(req, res);

  await supabase.auth.signOut();

  // Return the response object which now has cleared cookies
  return res;
}
