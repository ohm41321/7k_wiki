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
      // Hard reload to ensure session is read correctly by all components
      window.location.assign('/');
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