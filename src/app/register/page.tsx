'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const promise = async () => {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }
      return { ...await res.json() };
    };

    toast.promise(promise(), {
      loading: 'Creating account...',
      success: () => {
        return 'Account created! Please check your email to confirm.';
      },
      error: (err) => `Error: ${err.message}`,
      finally: () => setLoading(false),
    });
  };

  return (
    <div className="flex justify-center items-center pt-24">
      <div className="w-full max-w-md p-8 space-y-6 bg-primary rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-secondary">Create an Account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-textLight">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 text-black bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={loading}
            />
          </div>
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-textLight">
          Already have an account?{' '} 
          <Link href="/login" className="font-medium text-secondary hover:text-accent">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
