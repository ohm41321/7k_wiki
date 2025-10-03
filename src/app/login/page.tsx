'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      toast.error('Invalid credentials');
    } else {
      toast.success('Login successful!');
        // Wait briefly to allow server-set cookies to be available to the browser.
        // The sign-in route returns the session when available. Poll a couple times before redirect.
        const body = await res.json();
        const hasSession = !!body?.session;

        if (hasSession) {
          window.location.assign('/');
        } else {
          // Poll a few times for session to appear (this handles some hosting timing edge cases)
          let attempts = 0;
          const maxAttempts = 5;
          const poll = async () => {
            attempts += 1;
            try {
              const sRes = await fetch('/api/auth/session');
              if (sRes.ok) {
                const sBody = await sRes.json();
                if (sBody?.session) {
                  window.location.assign('/');
                  return;
                }
              }
            } catch (err) {
              // ignore and retry
            }

            if (attempts < maxAttempts) {
              setTimeout(poll, 400);
            } else {
              // Last resort, reload
              window.location.assign('/');
            }
          };
          setTimeout(poll, 400);
        }
    }
  };

  return (
    <div className="flex justify-center items-center pt-24">
      <div className="w-full max-w-lg p-8 space-y-6 bg-primary rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-secondary">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-textLight">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-black bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-textLight">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-black bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-primary bg-secondary rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}