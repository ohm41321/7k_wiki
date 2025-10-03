'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Search from './Search';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setUser(null);
  };

  const renderAuthButtons = () => {
    if (loading) return <div className="w-24 h-8 bg-gray-700 rounded animate-pulse"></div>;

      return user ? (
      <div className="flex items-center gap-4">
        <span className="text-textLight text-sm hidden sm:block">{user.email}</span>
        <button 
          onClick={handleLogout} 
          className="text-textLight bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <Link href="/auth?view=sign_in" className="text-textLight bg-accent hover:bg-yellow-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
          Login
        </Link>
        <Link href="/auth?view=sign_up" className="text-textLight bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
          Register
        </Link>
      </div>
    );
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gradient-to-r from-[#071023] to-[#081425] shadow-lg border-b border-yellow-900/20' : 'bg-black/40 backdrop-blur-sm'
      }`}
      style={{
        WebkitBackdropFilter: 'saturate(120%) blur(6px)',
        backdropFilter: 'saturate(120%) blur(6px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-secondary font-bold text-2xl hover:text-accent transition-colors">
              Fonzu Wiki
            </Link>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Search />
            <Link href="/" className="text-textLight hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            {renderAuthButtons()}
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
             <button onClick={() => setIsOpen(!isOpen)} className="text-textLight hover:text-yellow-300 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="px-2 pb-2">
              <Search />
            </div>
            <Link href="/" className="text-textLight hover:text-yellow-300 block px-3 py-2 rounded-md text-base font-medium transition-colors">
              Home
            </Link>
            <div className="px-3 py-2">
              {renderAuthButtons()}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
