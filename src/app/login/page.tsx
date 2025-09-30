'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setError('Invalid credentials');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex justify-center items-center pt-24">
      <div className="w-full max-w-md p-8 space-y-6 bg-primary rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-secondary">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-textLight">Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 text-black bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
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
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-primary bg-secondary rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
