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
  'LostSword': 'LostSword'
};

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
          <p>ไม่มีอีเวนต์ในเดือนนี้</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => {
            const eventConfig = eventTypeConfig[event.event_type as keyof typeof eventTypeConfig] || eventTypeConfig.other;

            return (
              <Reveal key={event.id}>
                <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className={`${eventConfig.color} w-10 h-10 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0`}>
                      {eventConfig.icon}
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-textLight">{event.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventConfig.color} text-white`}>
                          {eventConfig.label}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-textLight/80 text-sm mb-2">{event.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-textLight/60">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatEventDate(event.event_date, event.event_time)}
                        </span>

                        {event.game && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {gameNames[event.game] || event.game}
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