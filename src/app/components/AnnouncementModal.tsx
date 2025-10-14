'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  version?: string;
  priority: number;
  image_url?: string;
  action_url?: string;
  action_text?: string;
  published_at: string;
  expires_at?: string;
}

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnnouncementModal({ isOpen, onClose }: AnnouncementModalProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchAnnouncements();
    }
  }, [isOpen]);

  // Handle ESC key for dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/announcements?limit=20');
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    const announcement = announcements[currentIndex];
    if (announcement?.action_url) {
      router.push(announcement.action_url);
      onClose();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '🎉';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-2xl border border-accent/20 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin text-accent">⟳</div>
            <p className="text-textLight">กำลังโหลดประกาศ...</p>
          </div>
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-accent/20 shadow-2xl max-w-md w-full ring-2 ring-accent/20">
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-textLight text-xl font-bold mb-3">ไม่มีประกาศ</h3>
            <p className="text-textLight/70 mb-6">ขณะนี้ไม่มีประกาศที่เผยแพร่</p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-accent to-secondary hover:from-accent-light hover:to-secondary-light text-black font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg w-full"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    );
  }

  const announcement = announcements[currentIndex];

  return (
    <dialog
      open={isOpen}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[2147483647] flex items-start justify-center pt-8 pb-8 p-4 bg-transparent m-0 w-full h-full max-w-none max-h-none"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        border: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      <div
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 border-accent/20 shadow-2xl max-w-2xl w-full h-[80vh] max-h-[80vh] flex flex-col ring-2 ring-accent/20 ring-offset-4 ring-offset-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-accent/20 bg-gradient-to-r from-accent/10 to-secondary/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl drop-shadow-lg">{getTypeIcon(announcement?.type || 'info')}</span>
              <h2 className="text-2xl font-bold text-textLight leading-tight">{announcement?.title}</h2>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="text-textLight/60 hover:text-textLight p-2 rounded-lg hover:bg-accent/20 transition-all duration-200 transform hover:scale-110"
              title="ปิด"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {announcement?.published_at && (
            <p className="text-textLight/70 text-sm">
              เผยแพร่เมื่อ: {new Date(announcement.published_at).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 p-6 overflow-y-auto">
          {announcement?.image_url && (
            <div className="mb-6 rounded-xl overflow-hidden border border-accent/20 shadow-lg">
              <img
                src={announcement.image_url}
                alt={announcement.title}
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          <div className="prose prose-invert max-w-none mb-6">
            <div className="text-textLight leading-relaxed whitespace-pre-wrap text-lg">
              {announcement?.content}
            </div>
          </div>

          {announcement?.action_url && (
            <div className="flex justify-center">
              <button
                onClick={handleAction}
                className="bg-gradient-to-r from-accent to-secondary hover:from-accent-light hover:to-secondary-light text-black font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                {announcement.action_text || 'ดูเพิ่มเติม'}
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        {announcements.length > 1 && (
          <div className="flex-shrink-0 p-6 border-t border-accent/20 bg-gradient-to-b from-gray-800/50 to-gray-900/50">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 text-textLight/70 hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 p-2 rounded-lg hover:bg-accent/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                ก่อนหน้า
              </button>

              <div className="flex items-center gap-2">
                {announcements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentIndex
                        ? 'bg-accent shadow-lg scale-125'
                        : 'bg-textLight/30 hover:bg-textLight/50'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentIndex(Math.min(announcements.length - 1, currentIndex + 1))}
                disabled={currentIndex === announcements.length - 1}
                className="flex items-center gap-2 text-textLight/70 hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 p-2 rounded-lg hover:bg-accent/10"
              >
                ถัดไป
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="text-center">
              <span className="text-textLight/60 text-sm">
                {currentIndex + 1} จาก {announcements.length} ประกาศ
              </span>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}