import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('Logout API called');

  // Create response that will redirect client-side
  const response = NextResponse.json({ success: true, redirect: '/' });

  // Clear all Supabase auth-related cookies
  const cookiesToClear = [
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token'
  ];

  // Get all cookies and clear any that contain 'sb-' or 'supabase'
  const allCookies = request.cookies.getAll();
  allCookies.forEach(cookie => {
    if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
      response.cookies.set(cookie.name, '', {
        expires: new Date(0),
        path: '/',
      });
    }
  });

  console.log('Cookies cleared');
  return response;
}