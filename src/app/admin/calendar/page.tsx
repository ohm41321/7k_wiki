'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';

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

const eventTypes = [
  { value: 'update', label: 'อัพเดทเกม' },
  { value: 'maintenance', label: 'ปิดปรับปรุง' },
  { value: 'event', label: 'อีเวนต์' },
  { value: 'announcement', label: 'ประกาศ' },
  { value: 'other', label: 'อื่นๆ' }
];

const games = [
  { value: '7KRe', label: 'Seven Knights Re:Birth' },
  { value: 'WutheringWaves', label: 'Wuthering Waves' },
  { value: 'LostSword', label: 'LostSword' },
  { value: 'BlueArchive', label: 'Blue Archive' },
  { value: 'HonkaiStarRail', label: 'Honkai: Star Rail' },
  { value: 'GenshinImpact', label: 'Genshin Impact' },
  { value: 'PunishingGrayRaven', label: 'Punishing: Gray Raven' },
  { value: 'ZenlessZoneZero', label: 'Zenless Zone Zero' }
];

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    game: '',
    event_type: 'update'
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    checkAuthAndFetchEvents();
  }, []);

  const checkAuthAndFetchEvents = async () => {
    try {
      // First check if user is authenticated by calling the admin API
      const response = await fetch('/api/admin/calendar');
      if (response.status === 401) {
        toast.error('กรุณาเข้าสู่ระบบก่อนจัดการอีเวนต์');
        return;
      }
      const data = await response.json();
      setEvents(data || []);
    } catch (error) {
      console.error('Error checking auth and fetching events:', error);
      toast.error('กรุณาเข้าสู่ระบบก่อนจัดการอีเวนต์');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/calendar');
      if (response.status === 401) {
        toast.error('กรุณาเข้าสู่ระบบก่อนจัดการอีเวนต์');
        // Don't redirect, just show error and keep user on page
        setEvents([]);
        return;
      }
      const data = await response.json();
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingEvent ? 'PUT' : 'POST';
      const response = await fetch('/api/admin/calendar', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEvent ? { ...formData, id: editingEvent.id } : formData)
      });

      if (response.ok) {
        toast.success(editingEvent ? 'Event updated successfully' : 'Event created successfully');
        setShowAddForm(false);
        setEditingEvent(null);
        setFormData({
          title: '',
          description: '',
          event_date: '',
          event_time: '',
          game: '',
          event_type: 'update'
        });
        fetchEvents();
      } else {
        toast.error(editingEvent ? 'Failed to update event' : 'Failed to create event');
      }
    } catch (error) {
      console.error(`Error ${editingEvent ? 'updating' : 'creating'} event:`, error);
      toast.error(`Failed to ${editingEvent ? 'update' : 'create'} event`);
    }
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      event_time: event.event_time || '',
      game: event.game || '',
      event_type: event.event_type
    });
    setShowAddForm(true);
  };

  const handleDelete = async (eventId: number) => {
    try {
      const response = await fetch(`/api/admin/calendar?id=${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Event deleted successfully');
        setDeleteConfirm(null);
        fetchEvents();
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const cancelEdit = () => {
    setEditingEvent(null);
    setShowAddForm(false);
    setFormData({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      game: '',
      event_type: 'update'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-primary p-3 sm:p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary">จัดการปฏิทินเกม</h1>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Add event button clicked');
              setShowAddForm(true);
            }}
            className="bg-accent hover:bg-accent-dark text-white font-bold py-2 px-4 rounded-lg transition-colors w-full sm:w-auto text-center"
          >
            เพิ่มอีเวนต์ใหม่
          </button>
        </div>

        {showAddForm && (
          <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-700">
            <h2 className="text-xl font-semibold text-textLight mb-4">
              {editingEvent ? 'แก้ไขอีเวนต์' : 'เพิ่มอีเวนต์ใหม่'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textLight mb-2">
                    ชื่ออีเวนต์ *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textLight mb-2">
                    ประเภทอีเวนต์ *
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                    required
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textLight mb-2">
                    วันที่ *
                  </label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textLight mb-2">
                    เวลา
                  </label>
                  <input
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textLight mb-2">
                    เกม
                  </label>
                  <select
                    value={formData.game}
                    onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                  >
                    <option value="">เลือกเกม</option>
                    {games.map(game => (
                      <option key={game.value} value={game.value}>{game.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-textLight mb-2">
                  รายละเอียด
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                  placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-secondary hover:bg-secondary-dark text-primary font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  {editingEvent ? 'อัปเดต' : 'บันทึก'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-textLight/60">
            <div className="text-4xl mb-2">📭</div>
            <p>ไม่มีอีเวนต์ หรือกรุณาเข้าสู่ระบบก่อน</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700 relative">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-textLight">{event.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.event_type === 'update' ? 'bg-blue-500' :
                    event.event_type === 'maintenance' ? 'bg-red-500' :
                    event.event_type === 'event' ? 'bg-purple-500' :
                    event.event_type === 'announcement' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  } text-white`}>
                    {eventTypes.find(t => t.value === event.event_type)?.label}
                  </span>
                </div>

                {event.description && (
                  <p className="text-textLight/80 text-sm mb-3">{event.description}</p>
                )}

                <div className="text-sm text-textLight/60 space-y-1 mb-4">
                  <p>📅 {formatDate(event.event_date)}</p>
                  {event.event_time && <p>🕐 {event.event_time}</p>}
                  {event.game && <p>🎮 {games.find(g => g.value === event.game)?.label}</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                  <button
                    onClick={() => handleEdit(event)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-3 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    แก้ไข
                  </button>

                  {deleteConfirm === event.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-3 px-3 rounded-lg transition-colors"
                      >
                        ยืนยันลบ
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-3 px-3 rounded-lg transition-colors"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(event.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-3 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      ลบ
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}