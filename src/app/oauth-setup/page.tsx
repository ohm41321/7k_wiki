import Link from 'next/link'

export default function OAuthSetupPage() {
  return (
    <div className="min-h-screen bg-primary text-textLight py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-secondary mb-4">OAuth Setup Guide</h1>
          <p className="text-textLight/80 text-lg">Complete guide to set up Google and Discord login</p>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-8 border border-gray-800/50">
          <div className="prose prose-invert max-w-none">
            <h2>🚀 Quick Setup</h2>
            <p>Follow these steps to enable Google and Discord OAuth for your Fonzu Wiki:</p>

            <h3>1. Google OAuth Setup</h3>
            <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4 mb-4">
              <h4 className="text-amber-400 font-semibold mb-2">📋 Google OAuth Credentials</h4>
              <div className="text-sm text-amber-300 space-y-2">
                <p><strong>Client ID:</strong> <span className="bg-black/30 px-2 py-1 rounded text-xs font-mono">Get from Google Cloud Console</span></p>
                <p><strong>Client Secret:</strong> <span className="bg-black/30 px-2 py-1 rounded text-xs font-mono">Get from Google Cloud Console</span></p>
                <p className="text-yellow-400 text-xs mt-2">ℹ️ <strong>Note:</strong> Credentials are available in your Google Cloud Console. See steps below.</p>
              </div>
            </div>
            <ol>
              <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-secondary">Google Cloud Console</a></li>
              <li>Create a new project or select existing one</li>
              <li>Enable Google+ API (or Google People API)</li>
              <li>Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"</li>
              <li>Set Application type to "Web application"</li>
              <li>Add authorized redirect URI: <code>https://kdqigyxovetdghziplrb.supabase.co/auth/v1/callback</code></li>
              <li>Copy your Client ID and Client Secret</li>
            </ol>

            <h3>2. Discord OAuth Setup</h3>
            <ol>
              <li>Go to <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-secondary">Discord Developer Portal</a></li>
              <li>Create a new application</li>
              <li>Go to "OAuth2" → "General"</li>
              <li>Add redirect URI: <code>https://kdqigyxovetdghziplrb.supabase.co/auth/v1/callback</code></li>
              <li>Copy Client ID and Client Secret</li>
            </ol>

            <h3>3. Supabase Configuration</h3>
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-4">
              <h4 className="text-blue-400 font-semibold mb-2">🔧 Supabase Dashboard Steps</h4>
              <ol className="text-sm text-blue-300 space-y-2">
                <li>1. Go to <a href="https://supabase.com/dashboard/project/kdqigyxovetdghziplrb/auth/providers" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-secondary underline">Supabase Auth Providers</a></li>
                <li>2. <strong>Enable Google Provider:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• Toggle "Enable sign in with Google" ON</li>
                    <li>• Client ID: Paste your Google Client ID from step 1</li>
                    <li>• Client Secret: Paste your Google Client Secret from step 1</li>
                  </ul>
                </li>
                <li>3. <strong>Enable Discord Provider:</strong> (Set up Discord app first, then enter credentials)</li>
                <li>4. <strong>Redirect URLs:</strong> Should already be set to <code className="bg-black/30 px-1 rounded">https://kdqigyxovetdghziplrb.supabase.co/auth/v1/callback</code></li>
                <li>5. Click "Save" to apply changes</li>
              </ol>
            </div>
            <p className="text-red-400 text-sm mb-4">🚨 <strong>Important:</strong> Make sure the redirect URL matches exactly, including the protocol (https://) and trailing slash.</p>

            <h3>4. Test OAuth</h3>
            <p>After setup, test the OAuth flow by:</p>
            <ol>
              <li>Going to <Link href="/auth" className="text-accent hover:text-secondary">/auth</Link> page</li>
              <li>Clicking "Continue with Google" or "Continue with Discord"</li>
              <li>You should be redirected back to the home page with a success message</li>
            </ol>

            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 my-6">
              <h4 className="text-red-400 font-semibold">⚠️ Important Notes</h4>
              <ul className="text-sm text-red-300 mt-2">
                <li>• Use different OAuth apps for development and production</li>
                <li>• Never commit OAuth secrets to version control</li>
                <li>• Regularly rotate your OAuth secrets</li>
                <li>• Monitor OAuth usage in Supabase dashboard</li>
              </ul>
            </div>

            <h3>🔧 Troubleshooting</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-secondary">"Invalid OAuth access token"</h4>
                <p className="text-sm text-textLight/80">Check that redirect URIs match exactly in both provider settings and Supabase</p>
              </div>
              <div>
                <h4 className="font-semibold text-secondary">"OAuth provider not configured"</h4>
                <p className="text-sm text-textLight/80">Ensure providers are enabled in Supabase Authentication → Providers</p>
              </div>
              <div>
                <h4 className="font-semibold text-secondary">"Redirect URI mismatch"</h4>
                <p className="text-sm text-textLight/80">Make sure the redirect URI in provider settings matches Supabase callback URL</p>
              </div>
            </div>


            <div className="text-center mt-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://supabase.com/dashboard/project/kdqigyxovetdghziplrb/auth/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  🔧 Open Supabase Dashboard
                </a>
                <Link
                  href="/auth"
                  className="inline-block bg-gradient-to-r from-secondary to-accent hover:from-accent hover:to-secondary text-primary font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Try OAuth Login →
                </Link>
              </div>
              <p className="text-textLight/60 text-sm">
                After configuring OAuth in Supabase, refresh the auth page and try logging in with Google!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}