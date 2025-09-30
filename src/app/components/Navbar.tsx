'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gradient-to-r from-[#071023] to-[#081425] shadow-lg border-b border-yellow-900/20' : 'bg-black/40 backdrop-blur-sm'
      }`}
      style={{
        // keep navbar slightly translucent so banner shows but text remains readable
        WebkitBackdropFilter: 'saturate(120%) blur(6px)',
        backdropFilter: 'saturate(120%) blur(6px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-secondary font-bold text-2xl hover:text-accent transition-colors">
              7KReHub
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-textLight hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            {status === 'authenticated' && (
              <Link href="/create" className="text-textLight hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Create Post
              </Link>
            )}
            {status === 'loading' ? (
              <div className="text-textLight">Loading...</div>
            ) : status === 'authenticated' ? (
              <>
                <span className="text-yellow-300">Welcome, {session.user?.name}</span>
                <button 
                  onClick={() => signOut()} 
                  className="text-textLight hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-textLight hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link href="/register" className="text-textLight hover:text-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
