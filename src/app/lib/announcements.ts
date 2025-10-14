// Utility functions for managing announcements and version tracking

export interface Announcement {
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

// Version tracking utilities
export const VERSION_KEY = 'fonzu_wiki_version';
export const SEEN_ANNOUNCEMENTS_KEY = 'seen_announcements';
export const LAST_SEEN_VERSION_KEY = 'last_seen_version';

/**
 * Get current app version
 */
export function getCurrentVersion(): string {
  // In a real app, this would come from package.json or environment
  return process.env.NEXT_PUBLIC_APP_VERSION || '1.2.0';
}

/**
 * Get last seen version from localStorage
 */
export function getLastSeenVersion(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(LAST_SEEN_VERSION_KEY);
  } catch (error) {
    console.error('Error reading last seen version:', error);
    return null;
  }
}

/**
 * Update last seen version in localStorage
 */
export function updateLastSeenVersion(version: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(LAST_SEEN_VERSION_KEY, version);
  } catch (error) {
    console.error('Error saving last seen version:', error);
  }
}

/**
 * Check if current version is newer than last seen version
 */
export function isNewVersionAvailable(): boolean {
  const currentVersion = getCurrentVersion();
  const lastSeenVersion = getLastSeenVersion();

  if (!lastSeenVersion) return true; // First time visiting

  return isVersionNewer(currentVersion, lastSeenVersion);
}

/**
 * Compare two version strings (semantic versioning)
 */
export function isVersionNewer(current: string, lastSeen: string): boolean {
  const currentParts = current.split('.').map(Number);
  const lastSeenParts = lastSeen.split('.').map(Number);

  for (let i = 0; i < Math.max(currentParts.length, lastSeenParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const lastSeenPart = lastSeenParts[i] || 0;

    if (currentPart > lastSeenPart) return true;
    if (currentPart < lastSeenPart) return false;
  }

  return false;
}

/**
 * Get list of seen announcement IDs from localStorage
 */
export function getSeenAnnouncements(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const seen = localStorage.getItem(SEEN_ANNOUNCEMENTS_KEY);
    return seen ? JSON.parse(seen) : [];
  } catch (error) {
    console.error('Error reading seen announcements:', error);
    return [];
  }
}

/**
 * Mark announcement as seen
 */
export function markAnnouncementAsSeen(announcementId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const seen = getSeenAnnouncements();
    if (!seen.includes(announcementId)) {
      seen.push(announcementId);
      localStorage.setItem(SEEN_ANNOUNCEMENTS_KEY, JSON.stringify(seen));
    }
  } catch (error) {
    console.error('Error saving seen announcement:', error);
  }
}

/**
 * Mark multiple announcements as seen
 */
export function markAnnouncementsAsSeen(announcementIds: string[]): void {
  if (typeof window === 'undefined') return;

  try {
    const seen = getSeenAnnouncements();
    const newSeen = [...new Set([...seen, ...announcementIds])];
    localStorage.setItem(SEEN_ANNOUNCEMENTS_KEY, JSON.stringify(newSeen));
  } catch (error) {
    console.error('Error saving seen announcements:', error);
  }
}

/**
 * Check if announcement has been seen
 */
export function hasSeenAnnouncement(announcementId: string): boolean {
  return getSeenAnnouncements().includes(announcementId);
}

/**
 * Get unseen announcements from a list
 */
export function getUnseenAnnouncements(announcements: Announcement[]): Announcement[] {
  const seenIds = getSeenAnnouncements();
  return announcements.filter(announcement => !seenIds.includes(announcement.id));
}

/**
 * Clear all seen announcements (useful for testing)
 */
export function clearSeenAnnouncements(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(SEEN_ANNOUNCEMENTS_KEY);
    localStorage.removeItem(LAST_SEEN_VERSION_KEY);
  } catch (error) {
    console.error('Error clearing seen announcements:', error);
  }
}

/**
 * Get announcement type styling
 */
export function getAnnouncementTypeStyles(type: string) {
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
}