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
  autoShow?: boolean; // Whether to show modal automatically on mount
  maxPriority?: number; // Maximum priority to show (default: 3)
}

export default function AnnouncementModal({
  autoShow = true,
  maxPriority = 3
}: AnnouncementModalProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unseenAnnouncements, setUnseenAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (autoShow && unseenAnnouncements.length > 0 && !loading) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [unseenAnnouncements, loading, autoShow]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setHasError(false);

      const response = await fetch('/api/announcements?limit=20');
      if (!response.ok) throw new Error('Failed to fetch announcements');

      const data = await response.json();
      const fetchedAnnouncements: Announcement[] = data.announcements || [];

      // Filter by priority and check if user has seen them
      const highPriorityAnnouncements = fetchedAnnouncements.filter(
        announcement => announcement.priority >= maxPriority
      );

      const unseen = getUnseenAnnouncements(highPriorityAnnouncements);
      setAnnouncements(fetchedAnnouncements);
      setUnseenAnnouncements(unseen);

    } catch (error) {
      console.error('Error fetching announcements:', error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const getUnseenAnnouncements = (announcementList: Announcement[]): Announcement[] => {
    if (typeof window === 'undefined') return announcementList;

    try {
      const seenAnnouncements = JSON.parse(
        localStorage.getItem('seen_announcements') || '[]'
      );

      return announcementList.filter(announcement =>
        !seenAnnouncements.includes(announcement.id)
      );
    } catch (error) {
      console.error('Error reading seen announcements from localStorage:', error);
      return announcementList;
    }
  };

  const markAsSeen = (announcementId: string) => {
    if (typeof window === 'undefined') return;

    try {
      const seenAnnouncements = JSON.parse(
        localStorage.getItem('seen_announcements') || '[]'
      );

      if (!seenAnnouncements.includes(announcementId)) {
        seenAnnouncements.push(announcementId);
        localStorage.setItem('seen_announcements', JSON.stringify(seenAnnouncements));
      }
    } catch (error) {
      console.error('Error saving seen announcement to localStorage:', error);
    }
  };

  const handleClose = () => {
    if (unseenAnnouncements[currentIndex]) {
      markAsSeen(unseenAnnouncements[currentIndex].id);
    }
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentIndex < unseenAnnouncements.length - 1) {
      markAsSeen(unseenAnnouncements[currentIndex].id);
      setCurrentIndex(currentIndex + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleAction = () => {
    const currentAnnouncement = unseenAnnouncements[currentIndex];
    if (currentAnnouncement?.action_url) {
      markAsSeen(currentAnnouncement.id);
      router.push(currentAnnouncement.action_url);
      setIsVisible(false);
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/50',
          icon: '🎉',
          text: 'text-green-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          icon: '⚠️',
          text: 'text-yellow-400'
        };
      case 'error':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          icon: '❌',
          text: 'text-red-400'
        };
      default:
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/50',
          icon: 'ℹ️',
          text: 'text-blue-400'
        };
    }
  };

  if (loading || hasError || unseenAnnouncements.length === 0) {
    return null;
  }

  const currentAnnouncement = unseenAnnouncements[currentIndex];
  const typeStyles = getTypeStyles(currentAnnouncement?.type || 'info');

  return (
    <>
      {/* Modal Backdrop */}
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Content */}
            <div className={`
              relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 ${typeStyles.border}
              shadow-2xl shadow-black/50 transform transition-all duration-300
              ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
            `}>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className={`p-6 pb-4 border-b ${typeStyles.border}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{typeStyles.icon}</span>
                  <h2 className="text-2xl font-bold text-white">
                    {currentAnnouncement?.title}
                  </h2>
                  {currentAnnouncement?.version && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeStyles.bg} ${typeStyles.text}`}>
                      v{currentAnnouncement.version}
                    </span>
                  )}
                </div>

                {currentAnnouncement && (
                  <p className="text-gray-300 text-sm">
                    เผยแพร่เมื่อ: {new Date(currentAnnouncement.published_at).toLocaleDateString('th-TH')}
                  </p>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {currentAnnouncement?.image_url && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <img
                      src={currentAnnouncement.image_url}
                      alt={currentAnnouncement.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="prose prose-invert max-w-none mb-6">
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {currentAnnouncement?.content}
                  </p>
                </div>

                {/* Action Button */}
                {currentAnnouncement?.action_url && (
                  <button
                    onClick={handleAction}
                    className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent-light hover:to-secondary-light text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {currentAnnouncement.action_text || 'ดูเพิ่มเติม'}
                  </button>
                )}
              </div>

              {/* Footer with Navigation */}
              {unseenAnnouncements.length > 1 && (
                <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <span className="text-sm text-gray-400">
                        {currentIndex + 1} จาก {unseenAnnouncements.length}
                      </span>

                      <button
                        onClick={handleNext}
                        disabled={currentIndex === unseenAnnouncements.length - 1}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      ข้ามทั้งหมด
                    </button>
                  </div>

                  {/* Progress Dots */}
                  <div className="flex justify-center gap-2 mt-3">
                    {unseenAnnouncements.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentIndex ? 'bg-accent' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}