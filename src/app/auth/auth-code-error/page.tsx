import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#111', color: 'white' }}>
      <h1>Authentication Error</h1>
      <p>There was an error during the authentication process.</p>
      <p>Please try again.</p>
      <Link href="/auth" style={{ color: '#0070f3', marginTop: '20px' }}>
        Back to Login
      </Link>
    </div>
  )
}
