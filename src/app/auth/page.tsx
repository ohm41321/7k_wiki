'use client'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { toast } from 'sonner'

function AuthPageComponent() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const searchParams = useSearchParams()
  const router = useRouter()
  const view = searchParams.get('view') as 'sign_in' | 'sign_up' | null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignIn, setIsSignIn] = useState(view === 'sign_in')

  useEffect(() => {
    setIsSignIn(view === 'sign_in')
  }, [view])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!isSignIn && password !== confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      if (isSignIn) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        toast.success('Successfully signed in!')
        router.push('/')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error

        toast.success('Account created successfully! Please check your email to verify your account.')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'discord') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      if (error.message?.includes('Unsupported provider')) {
        toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth is not configured yet. Please use email/password login or contact admin to set up OAuth providers.`)
      } else {
        toast.error(error.message || 'An error occurred')
      }
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-5xl font-black font-orbitron bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent hover:scale-105 transition-transform">
              Fonzu Wiki
            </h1>
          </Link>
          <p className="mt-4 text-textLight/80 text-lg">
            {isSignIn ? 'Welcome back! Sign in to continue' : 'Join our community of gamers'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800/50 p-8">
          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-gray-800/50 p-1 mb-6">
            <button
              onClick={() => setIsSignIn(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isSignIn
                  ? 'bg-secondary text-primary shadow-lg'
                  : 'text-textLight/70 hover:text-textLight'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isSignIn
                  ? 'bg-secondary text-primary shadow-lg'
                  : 'text-textLight/70 hover:text-textLight'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-textLight/90 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-textLight placeholder-textLight/50 transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-textLight/90 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-textLight placeholder-textLight/50 transition-all"
                placeholder="Enter your password"
                minLength={6}
              />
            </div>

            {!isSignIn && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-textLight/90 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-textLight placeholder-textLight/50 transition-all"
                  placeholder="Confirm your password"
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-secondary to-accent hover:from-accent hover:to-secondary text-primary font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isSignIn ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                isSignIn ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-textLight/60 text-sm">or continue with</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuthSignIn('google')}
              className="w-full flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-white/20 border border-gray-600 rounded-lg transition-all duration-200 group"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-textLight group-hover:text-white transition-colors">
                Continue with Google
              </span>
            </button>

            <button
              onClick={() => handleOAuthSignIn('discord')}
              className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg transition-all duration-200 group"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
              </svg>
              <span className="text-textLight group-hover:text-white transition-colors">
                Continue with Discord
              </span>
            </button>

            {/* OAuth Setup Note */}
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3 text-center">
              <div className="text-blue-400 text-sm font-medium mb-1">
                🔧 Quick Setup Available
              </div>
              <p className="text-textLight/70 text-xs mb-2">
                Google OAuth credentials are ready - just configure in Supabase
              </p>
              <Link
                href="/oauth-setup"
                className="text-accent hover:text-secondary text-xs underline transition-colors"
              >
                ⚡ Quick Setup Guide →
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-textLight/60 text-sm">
              {isSignIn ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-secondary hover:text-accent transition-colors font-medium"
              >
                {isSignIn ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-textLight/60 hover:text-textLight transition-colors text-sm inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
    return (
        <Suspense fallback={
          <div className="min-h-screen bg-primary flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
            <AuthPageComponent />
        </Suspense>
    )
}