'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Search from './Search';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
