'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/utils';
import type { User } from '@supabase/supabase-js';
import Search from './Search';

// Custom hook to manage Supabase auth state
function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('username')
          .eq('id', session.user.id)
          .single();
        setProfile(userProfile);
      }
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('username')
          .eq('id', session.user.id)
          .single();
        setProfile(userProfile);
      } else {
        setProfile(null); // Clear profile on logout
      }
      setLoading(false);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' });
  };

  return { user, profile, loading, handleSignOut };
}

const Navbar = () => {
  const { user, profile, loading, handleSignOut } = useSupabaseAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

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
            
            {loading ? (
              <div className="text-textLight">Loading...</div>
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 text-yellow-300 hover:text-yellow-100 transition-colors">
                  <span>{profile?.username || user.email}</span>
                  <svg className={`h-5 w-5 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                    <button 
                      onClick={() => { handleSignOut(); setIsUserMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-textLight hover:bg-gray-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
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
            
            {loading ? (
              <div className="text-textLight px-3 py-2">Loading...</div>
            ) : user ? (
              <>
                <div className="px-3 py-2">
                  <span className="text-yellow-300">Welcome, {user.email}</span>
                </div>
                <button 
                  onClick={handleSignOut} 
                  className="text-textLight hover:text-yellow-300 block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-textLight hover:text-secondary block px-3 py-2 rounded-md text-base font-medium transition-colors">
                  Login
                </Link>
                <Link href="/register" className="text-textLight hover:text-secondary block px-3 py-2 rounded-md text-base font-medium transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;