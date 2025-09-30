'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push('/login');
      } else {
        const data = await res.json();
        setError(data.message || 'Something went wrong');
      }
    } catch (err: any) {
      setError(err.message);
    }
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 text-black bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
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
            Register
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