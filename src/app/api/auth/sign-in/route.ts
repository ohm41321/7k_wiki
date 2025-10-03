import { createSupabaseReqResClient } from '@/lib/supabase/utils';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseReqResClient(req, res);
  const { email, password } = await req.json();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Success!' }, { status: 200 });
}
