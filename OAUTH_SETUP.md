# OAuth Setup Guide for Fonzu Wiki

## Google OAuth Setup

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application type to "Web application"
6. Add authorized redirect URIs:
   - For development: `https://kdqigyxovetdghziplrb.supabase.co/auth/v1/callback`
   - For production: `https://yourdomain.supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret

### 2. Supabase Dashboard Setup
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Enable Google provider
4. Enter:
   - Client ID: Your Google OAuth Client ID
   - Client Secret: Your Google OAuth Client Secret
   - Redirect URL: `https://kdqigyxovetdghziplrb.supabase.co/auth/v1/callback`

## Discord OAuth Setup

### 1. Discord Developer Portal Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "OAuth2" → "General"
4. Add redirect URI:
   - For development: `https://kdqigyxovetdghziplrb.supabase.co/auth/v1/callback`
   - For production: `https://yourdomain.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret

### 2. Supabase Dashboard Setup
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Enable Discord provider
4. Enter:
   - Client ID: Your Discord OAuth Client ID
   - Client Secret: Your Discord OAuth Client Secret
   - Redirect URL: `https://kdqigyxovetdghziplrb.supabase.co/auth/v1/callback`

## Testing OAuth

After setup, test the OAuth flow:
1. Go to `/auth` page
2. Click "Continue with Google" or "Continue with Discord"
3. You should be redirected to the provider's login page
4. After authentication, you should be redirected back to the home page with a success message

## Troubleshooting

### Common Issues:
1. **"Invalid OAuth access token"**: Check that redirect URIs match exactly
2. **"OAuth provider not configured"**: Ensure providers are enabled in Supabase dashboard
3. **"Redirect URI mismatch"**: Make sure the redirect URI in provider settings matches Supabase callback URL

### Environment Variables
Make sure these are set in your deployment environment:
- `NEXT_PUBLIC_SUPABASE_URL=https://kdqigyxovetdghziplrb.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`
- `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`

## Security Notes
- Never commit OAuth secrets to version control
- Use different OAuth apps for development and production
- Regularly rotate OAuth secrets
- Monitor OAuth usage in Supabase dashboard