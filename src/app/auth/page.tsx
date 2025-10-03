'use client'
import { createBrowserClient } from '@supabase/ssr'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthPageComponent() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const searchParams = useSearchParams()
  const view = searchParams.get('view') as 'sign_in' | 'sign_up' | null

  const pageTitle = view === 'sign_in' ? 'Sign In' : 'Create Account';
  const pageDescription = view === 'sign_in' ? 'Sign in to continue' : 'Create a new account';

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900/30 rounded-lg shadow-xl">
        <div className="text-center">
            <Link href="/">
                <h1 className="text-4xl font-extrabold text-secondary">{pageTitle}</h1>
            </Link>
            <p className="mt-2 text-textLight/80">{pageDescription}</p>
        </div>
        <Auth
          supabaseClient={supabase}
          view={view || 'sign_in'}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={['google', 'discord']}
          redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`}
        />
      </div>
    </div>
  )
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthPageComponent />
        </Suspense>
    )
}