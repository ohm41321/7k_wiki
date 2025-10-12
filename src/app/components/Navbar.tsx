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
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showAuthDropdown &&
        !(event.target as Element).closest('.auth-dropdown') &&
        !(event.target as Element).closest('.auth-dropdown-button')
      ) {
        setShowAuthDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAuthDropdown]);

  const handleLogout = async () => {
    try {
      console.log('Calling server logout...');
      // Call server-side logout
      const response = await fetch('/api/auth/logout');
      const data = await response.json();
      console.log('Server logout response:', data);

      if (data.success) {
        // Redirect to the specified URL
        window.location.href = data.redirect || '/';
      } else {
        console.error('Logout failed');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: redirect to home
      window.location.href = '/';
    }
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
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowAuthDropdown(!showAuthDropdown);
          }}
          className="auth-dropdown-button flex items-center gap-2 text-textLight bg-gradient-to-r from-secondary to-accent hover:from-accent hover:to-secondary px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg w-full md:w-auto justify-center md:justify-start"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Account
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${showAuthDropdown ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAuthDropdown && (
          <>
            {/* Dropdown */}
            <div className="auth-dropdown absolute right-0 top-full mt-1 w-full bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700/50 z-[2147483647] md:right-0 md:w-48 md:left-auto md:mt-2 left-0 max-h-[80vh] overflow-y-auto">
              <div className="py-2">
                <Link
                  href="/auth?view=sign_in"
                  className="flex items-center gap-3 px-4 py-3 text-textLight hover:bg-gray-800/50 transition-colors group cursor-pointer"
                  onClick={() => {
                    setShowAuthDropdown(false);
                  }}
                >
                  <svg className="w-5 h-5 text-secondary group-hover:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </Link>
                <Link
                  href="/auth?view=sign_up"
                  className="flex items-center gap-3 px-4 py-3 text-textLight hover:bg-gray-800/50 transition-colors group cursor-pointer"
                  onClick={() => {
                    setShowAuthDropdown(false);
                  }}
                >
                  <svg className="w-5 h-5 text-accent group-hover:text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Account
                </Link>
              </div>
              <div className="border-t border-gray-700/50">
                <div className="px-4 py-3 text-xs text-textLight/60">
                  Join our gaming community
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
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
             <button
               onClick={() => setIsOpen(!isOpen)}
               className="text-textLight hover:text-yellow-300 focus:outline-none p-2 rounded-md hover:bg-white/10 transition-all duration-200 transform hover:scale-105"
             >
              <svg
                className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
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
      <div className={`md:hidden overflow-visible transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-b from-[#071023]/95 to-[#081425]/95 backdrop-blur-sm border-t border-yellow-900/20">
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
    </nav>
  );
};

export default Navbar;
