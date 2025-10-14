'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Search from './Search';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { isNewVersionAvailable, getCurrentVersion, updateLastSeenVersion } from '@/app/lib/announcements';
import AnnouncementModal from './AnnouncementModal';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  useEffect(() => {
    // Ensure we're on the client side before accessing window
    if (typeof window === 'undefined') return;

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

    // Check for new announcements
    checkForNewAnnouncements();

    // Update last seen version
    updateLastSeenVersion(getCurrentVersion());

    return () => {
      window.removeEventListener('scroll', handleScroll);
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const checkForNewAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements?limit=5');
      if (response.ok) {
        const data = await response.json();
        const announcements = data.announcements || [];

        // Check if there are unseen high-priority announcements
        const seenAnnouncements = JSON.parse(localStorage.getItem('seen_announcements') || '[]');
        const unseenHighPriority = announcements.filter((ann: any) =>
          ann.priority >= 3 && !seenAnnouncements.includes(ann.id)
        );

        setHasNewAnnouncements(unseenHighPriority.length > 0);
      }
    } catch (error) {
      console.error('Error checking announcements:', error);
    }
  };

  const handleAnnouncementModalClose = () => {
    setShowAnnouncementModal(false);
    // Recheck for new announcements after modal closes
    setTimeout(() => {
      checkForNewAnnouncements();
    }, 1000);
  };

  const handleAnnouncementButtonClick = () => {
    setShowAnnouncementModal(true);
    // Mark announcements as potentially seen when user opens modal
    setTimeout(() => {
      checkForNewAnnouncements();
    }, 500);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout');
      const data = await response.json();

      if (data.success) {
        window.location.href = data.redirect || '/';
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const renderAuthButtons = () => {
    if (loading) {
      return (
        <div className="flex items-center space-x-3">
          <div className="w-20 h-8 bg-gray-700/50 rounded-lg animate-pulse"></div>
          <div className="w-16 h-8 bg-gray-700/50 rounded-lg animate-pulse"></div>
        </div>
      );
    }

    return user ? (
      <div className="flex items-center space-x-3">
        <div className="hidden sm:block text-right">
          <div className="text-textLight text-sm font-medium">
            {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </div>
          <div className="text-textLight/60 text-xs">
            ผู้ใช้
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/profile"
            className="text-textLight hover:text-accent p-2 rounded-lg hover:bg-accent/10 transition-all duration-200"
            title="โปรไฟล์"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>

          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all duration-200"
            title="ออกจากระบบ"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    ) : (
      <div className="flex items-center space-x-2">
        <Link
          href="/auth?view=sign_in"
          className="text-textLight hover:text-accent px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent/10"
        >
          เข้าสู่ระบบ
        </Link>
        <Link
          href="/auth?view=sign_up"
          className="bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-black px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          สมัครสมาชิก
        </Link>
      </div>
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-gradient-to-r from-[#0a1428] to-[#1a2847] shadow-xl border-b border-accent/20'
          : 'bg-gradient-to-r from-[#0a1428]/90 to-[#1a2847]/90 backdrop-blur-md'
      }`}
      style={{
        WebkitBackdropFilter: 'saturate(180%) blur(8px)',
        backdropFilter: 'saturate(180%) blur(8px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="group">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-black font-bold text-sm">F</span>
                </div>
                <span className="text-secondary font-bold text-xl group-hover:text-accent transition-colors">
                  Fonzu Wiki
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-textLight hover:text-accent px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent/10"
              >
                หน้าแรก
              </Link>
            </div>

            <div className="h-6 w-px bg-gray-600"></div>

            <div className="flex items-center space-x-3">
              <Search />
            </div>

            <div className="h-6 w-px bg-gray-600"></div>

            {/* Announcement Button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAnnouncementButtonClick}
                className="relative text-textLight hover:text-accent p-2 rounded-lg hover:bg-accent/10 transition-all duration-200"
                title="ประกาศและอัพเดท"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {hasNewAnnouncements && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </button>
            </div>

            <div className="h-6 w-px bg-gray-600"></div>

            <div className="flex items-center space-x-3">
              {renderAuthButtons()}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-textLight hover:text-accent focus:outline-none p-2 rounded-lg hover:bg-accent/10 transition-all duration-200"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-4 py-4 bg-gradient-to-b from-[#0a1428]/95 to-[#1a2847]/95 backdrop-blur-sm border-t border-accent/20">
          <div className="space-y-3">
            <Link
              href="/"
              className="text-textLight hover:text-accent block px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-accent/10"
              onClick={() => setIsOpen(false)}
            >
              🏠 หน้าแรก
            </Link>

            <div className="border-t border-gray-600 pt-3">
              <div className="px-3 py-2 text-xs text-textLight/60 uppercase tracking-wider font-semibold">
                ค้นหา
              </div>
              <div className="px-2">
                <Search />
              </div>
            </div>

            <div className="border-t border-gray-600 pt-3">
              <button
                onClick={() => {
                  handleAnnouncementButtonClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 text-textLight hover:text-accent px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-accent/10 w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ประกาศและอัพเดท
                {hasNewAnnouncements && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto"></div>
                )}
              </button>
            </div>

            <div className="border-t border-gray-600 pt-3">
              <div className="px-3 py-2 text-xs text-textLight/60 uppercase tracking-wider font-semibold">
                บัญชีผู้ใช้
              </div>
              <div className="space-y-2">
                {user && (
                  <Link
                    href="/profile"
                    className="text-textLight hover:text-accent block px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent/10"
                    onClick={() => setIsOpen(false)}
                  >
                    👤 โปรไฟล์
                  </Link>
                )}
                <div className="px-3">
                  {renderAuthButtons()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <AnnouncementModal
          autoShow={true}
          maxPriority={1} // Show all announcements when manually opened
        />
      )}
    </nav>
  );
};

export default Navbar;
