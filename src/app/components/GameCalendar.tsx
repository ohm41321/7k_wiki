'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Reveal from './Reveal';

interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  game: string | null;
  event_type: string;
  is_active: boolean;
  created_at: string;
}

const eventTypeConfig = {
  update: {
    label: 'อัพเดทเกม',
    color: 'bg-blue-500',
    icon: '🔄'
  },
  maintenance: {
    label: 'ปิดปรับปรุง',
    color: 'bg-red-500',
    icon: '🔧'
  },
  event: {
    label: 'อีเวนต์',
    color: 'bg-purple-500',
    icon: '🎉'
  },
  announcement: {
    label: 'ประกาศ',
    color: 'bg-yellow-500',
    icon: '📢'
  },
  other: {
    label: 'อื่นๆ',
    color: 'bg-gray-500',
    icon: '📅'
  }
};

const gameNames: { [key: string]: string } = {
  '7KRe': 'Seven Knights Re:Birth',
  'WutheringWaves': 'Wuthering Waves',
  'LostSword': 'LostSword',
  'BlueArchive': 'Blue Archive',
  'HonkaiStarRail': 'Honkai: Star Rail',
  'GenshinImpact': 'Genshin Impact',
  'PunishingGrayRaven': 'Punishing: Gray Raven',
  'ZenlessZoneZero': 'Zenless Zone Zero'
};

// Game abbreviation mapping and colors for display
const gameAbbreviations: { [key: string]: string } = {
  '7KRe': '7KR',
  'LostSword': 'LS',
  'WutheringWaves': 'WW',
  'PunishingGrayRaven': 'PGR',
  'BlueArchive': 'BA',
  'HonkaiStarRail': 'HSR',
  'GenshinImpact': 'GI',
  'ZenlessZoneZero': 'ZZZ'
};

const gameColors: { [key: string]: string } = {
  '7KRe': 'from-orange-500 to-red-600',
  'LostSword': 'from-gray-600 to-gray-800',
  'WutheringWaves': 'from-blue-400 to-cyan-500',
  'PunishingGrayRaven': 'from-purple-500 to-pink-600',
  'BlueArchive': 'from-blue-500 to-indigo-600',
  'HonkaiStarRail': 'from-purple-400 to-purple-600',
  'GenshinImpact': 'from-green-400 to-blue-500',
  'ZenlessZoneZero': 'from-gray-400 to-gray-600'
};

// Alternative: Use a single placeholder image that exists
// const gameBanners: { [key: string]: string } = {
//   '7KRe': '/vercel.svg', // Using existing Next.js placeholder
//   'LostSword': '/vercel.svg',
//   'WutheringWaves': '/vercel.svg',
//   'PunishingGrayRaven': '/vercel.svg',
//   'BlueArchive': '/vercel.svg',
//   'HonkaiStarRail': '/vercel.svg',
//   'GenshinImpact': '/vercel.svg',
//   'ZenlessZoneZero': '/vercel.svg'
// };

export default function GameCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchEvents();
  }, [selectedMonth]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('is_active', true)
        .gte('event_date', startOfMonth.toISOString().split('T')[0])
        .lte('event_date', endOfMonth.toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string, timeString?: string | null) => {
    const date = new Date(dateString);
    const thaiDate = date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      timeZone: 'Asia/Bangkok'
    });

    if (timeString) {
      const time = timeString.substring(0, 5); // Get HH:MM format
      return `${thaiDate} เวลา ${time}`;
    }

    return thaiDate;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-secondary flex items-center gap-2">
          <span className="text-3xl">📅</span>
          ปฏิทินเกม
        </h3>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-lg font-semibold text-textLight min-w-[120px] text-center">
            {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear() + 543}
          </div>

          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 text-textLight/60">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-base">ไม่มีอีเวนต์ในเดือนนี้</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => {
            const eventConfig = eventTypeConfig[event.event_type as keyof typeof eventTypeConfig] || eventTypeConfig.other;


            return (
              <Reveal key={event.id}>
                <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    {/* Game Abbreviation Badge - Show on all devices */}
                    {event.game && (
                      <div className="flex-shrink-0">
                        <div className="relative group">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gameColors[event.game] || 'from-accent to-secondary'} flex items-center justify-center text-white text-sm font-bold border-2 border-gray-600/50 shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl`}>
                            {gameAbbreviations[event.game] || event.game.charAt(0).toUpperCase()}
                          </div>
                          {/* Tooltip - Show on hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            {gameNames[event.game] || event.game}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Event Type Icon */}
                    <div className={`${eventConfig.color} w-10 h-10 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0`}>
                      {eventConfig.icon}
                    </div>

                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <h4 className="font-semibold text-textLight text-sm sm:text-base">{event.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventConfig.color} text-white w-fit`}>
                          {eventConfig.label}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-textLight/80 text-xs sm:text-sm mb-2">{event.description}</p>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-textLight/60">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs sm:text-sm">{formatEventDate(event.event_date, event.event_time)}</span>
                        </span>

                        {event.game && (
                          <span className="flex items-center gap-1 bg-gray-700/50 px-2 py-1 rounded-full w-fit">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-medium text-accent truncate max-w-[100px] sm:max-w-none">{gameNames[event.game] || event.game}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}