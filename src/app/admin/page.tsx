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

export default function AdminPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'announcements'>('calendar');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    game: '',
    event_type: 'update'
  });

  const [notificationData, setNotificationData] = useState({
    title: 'ทดสอบการแจ้งเตือน',
    body: 'นี่คือการทดสอบการแจ้งเตือนจาก Fonzu Wiki',
    url: '/',
    game: ''
  });

  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    version: '',
    priority: 1,
    target_audience: 'all',
    game: '',
    image_url: '',
    action_url: '',
    action_text: 'ดูเพิ่มเติม',
    expires_at: '',
    published: true,
    active: true
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    checkAuthAndFetchEvents();
    if (activeTab === 'announcements') {
      fetchAnnouncements();
    }
  }, [activeTab]);

  const checkAuthAndFetchEvents = async () => {
    try {
      // First check if user is authenticated by calling the admin API
      const response = await fetch('/api/admin');
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
      const response = await fetch('/api/admin');
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

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements?limit=100');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      } else {
        console.error('Error fetching announcements:', response.status);
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingEvent ? 'PUT' : 'POST';
      const response = await fetch('/api/admin', {
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
      const response = await fetch(`/api/admin?id=${eventId}`, {
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

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_TOKEN || 'test-token'}`
        },
        body: JSON.stringify({
          title: notificationData.title,
          body: notificationData.body,
          url: notificationData.url,
          game: notificationData.game || undefined
        })
      });

      if (response.ok) {
        toast.success('ส่งการแจ้งเตือนสำเร็จ!');
        setShowNotificationForm(false);
      } else {
        toast.error('ส่งการแจ้งเตือนไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งการแจ้งเตือน');
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingAnnouncement ? 'PUT' : 'POST';
      const url = editingAnnouncement
        ? `/api/announcements?id=${editingAnnouncement.id}`
        : '/api/announcements';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_TOKEN || 'test-token'}`
        },
        body: JSON.stringify(editingAnnouncement ? { ...announcementFormData, id: editingAnnouncement.id } : announcementFormData)
      });

      if (response.ok) {
        toast.success(editingAnnouncement ? 'อัปเดตประกาศสำเร็จ' : 'สร้างประกาศสำเร็จ');
        setShowAnnouncementForm(false);
        setEditingAnnouncement(null);
        resetAnnouncementForm();
        fetchAnnouncements();
      } else {
        toast.error(editingAnnouncement ? 'อัปเดตประกาศไม่สำเร็จ' : 'สร้างประกาศไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกประกาศ');
    }
  };

  const handleEditAnnouncement = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setAnnouncementFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      version: announcement.version || '',
      priority: announcement.priority,
      target_audience: announcement.target_audience,
      game: announcement.game || '',
      image_url: announcement.image_url || '',
      action_url: announcement.action_url || '',
      action_text: announcement.action_text || 'ดูเพิ่มเติม',
      expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : '',
      published: announcement.published !== undefined ? announcement.published : true,
      active: announcement.active !== undefined ? announcement.active : true
    });
    setShowAnnouncementForm(true);
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      const response = await fetch(`/api/announcements?id=${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_TOKEN || 'test-token'}`
        }
      });

      if (response.ok) {
        toast.success('ลบประกาศสำเร็จ');
        fetchAnnouncements();
      } else {
        toast.error('ลบประกาศไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('เกิดข้อผิดพลาดในการลบประกาศ');
    }
  };

  const resetAnnouncementForm = () => {
    setAnnouncementFormData({
      title: '',
      content: '',
      type: 'info',
      version: '',
      priority: 1,
      target_audience: 'all',
      game: '',
      image_url: '',
      action_url: '',
      action_text: 'ดูเพิ่มเติม',
      expires_at: '',
      published: true,
      active: true
    });
  };

  const cancelAnnouncementEdit = () => {
    setEditingAnnouncement(null);
    setShowAnnouncementForm(false);
    resetAnnouncementForm();
  };

  return (
    <div className="min-h-screen bg-primary p-3 sm:p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary">จัดการเนื้อหา</h1>

          {/* Tab Navigation */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-accent text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📅 ปฏิทินเกม
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'announcements'
                  ? 'bg-accent text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📢 ประกาศ
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'calendar' && (
          <>
            <div className="flex gap-2 w-full sm:w-auto mb-6">
              <button
                onClick={() => setShowNotificationForm(!showNotificationForm)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center"
              >
                🔔 ส่งแจ้งเตือน
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Add event button clicked');
                  setShowAddForm(true);
                }}
                className="bg-accent hover:bg-accent-dark text-white font-bold py-2 px-4 rounded-lg transition-colors text-center"
              >
                เพิ่มอีเวนต์ใหม่
              </button>
            </div>
          </>
        )}

        {activeTab === 'announcements' && (
          <>
            <div className="flex gap-2 w-full sm:w-auto mb-6">
              <button
                onClick={() => setShowAnnouncementForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-center"
              >
                ➕ สร้างประกาศใหม่
              </button>
            </div>
          </>
        )}

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

        {/* Push Notification Section */}
        {showNotificationForm && (
          <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-purple-500/30">
            <h2 className="text-xl font-semibold text-textLight mb-4 flex items-center gap-2">
              <span className="text-purple-400">🔔</span>
              ส่งการแจ้งเตือนทดสอบ
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textLight mb-2">
                  หัวข้อการแจ้งเตือน
                </label>
                <input
                  type="text"
                  value={notificationData.title}
                  onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-purple-500"
                  placeholder="เช่น: มีอัพเดทเกมใหม่!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textLight mb-2">
                  ข้อความการแจ้งเตือน
                </label>
                <textarea
                  value={notificationData.body}
                  onChange={(e) => setNotificationData({ ...notificationData, body: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-purple-500"
                  placeholder="รายละเอียดการแจ้งเตือน..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textLight mb-2">
                    ลิงก์เมื่อคลิก (ไม่บังคับ)
                  </label>
                  <input
                    type="url"
                    value={notificationData.url}
                    onChange={(e) => setNotificationData({ ...notificationData, url: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-purple-500"
                    placeholder="เช่น: /GenshinImpact"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textLight mb-2">
                    เกมที่เกี่ยวข้อง (ไม่บังคับ)
                  </label>
                  <select
                    value={notificationData.game}
                    onChange={(e) => setNotificationData({ ...notificationData, game: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">เลือกเกม</option>
                    {games.map(game => (
                      <option key={game.value} value={game.value}>{game.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                <button
                  onClick={sendTestNotification}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  ส่งการแจ้งเตือน
                </button>
                <button
                  onClick={() => setShowNotificationForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Announcements Management Section */}
        {activeTab === 'announcements' && (
          <>
            {showAnnouncementForm && (
              <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-700">
                <h2 className="text-xl font-semibold text-textLight mb-4">
                  {editingAnnouncement ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}
                </h2>
                <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-textLight mb-2">
                        หัวข้อประกาศ *
                      </label>
                      <input
                        type="text"
                        value={announcementFormData.title}
                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-textLight mb-2">
                        ประเภท *
                      </label>
                      <select
                        value={announcementFormData.type}
                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, type: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                        required
                      >
                        <option value="info">ℹ️ ข้อมูล</option>
                        <option value="success">🎉 สำเร็จ</option>
                        <option value="warning">⚠️ คำเตือน</option>
                        <option value="error">❌ ข้อผิดพลาด</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-textLight mb-2">
                        ความสำคัญ
                      </label>
                      <select
                        value={announcementFormData.priority}
                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, priority: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                      >
                        <option value={1}>⭐ ต่ำ</option>
                        <option value={2}>⭐⭐ ปานกลาง</option>
                        <option value={3}>⭐⭐⭐ สูง</option>
                        <option value={4}>⭐⭐⭐⭐ สูงมาก</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-textLight mb-2">
                        เวอร์ชัน
                      </label>
                      <input
                        type="text"
                        value={announcementFormData.version}
                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, version: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                        placeholder="เช่น: 1.2.0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textLight mb-2">
                      เนื้อหาประกาศ *
                    </label>
                    <textarea
                      value={announcementFormData.content}
                      onChange={(e) => setAnnouncementFormData({ ...announcementFormData, content: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-textLight mb-2">
                        ลิงก์เมื่อคลิก (ไม่บังคับ)
                      </label>
                      <input
                        type="url"
                        value={announcementFormData.action_url}
                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, action_url: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                        placeholder="เช่น: /search หรือ /GenshinImpact"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-textLight mb-2">
                        ข้อความปุ่ม (ไม่บังคับ)
                      </label>
                      <input
                        type="text"
                        value={announcementFormData.action_text}
                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, action_text: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                        placeholder="เช่น: ดูเพิ่มเติม หรือ เข้าสู่ระบบ"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-textLight mb-2">
                        รูปภาพ (ไม่บังคับ)
                      </label>
                      <input
                        type="url"
                        value={announcementFormData.image_url}
                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, image_url: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                        placeholder="URL ของรูปภาพ"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-textLight mb-2">
                        หมดอายุ (ไม่บังคับ)
                      </label>
                      <input
                        type="date"
                        value={announcementFormData.expires_at}
                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, expires_at: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-textLight focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="published"
                        checked={announcementFormData.published}
                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, published: e.target.checked })}
                        className="mr-2 w-4 h-4 text-accent bg-gray-700 border-gray-600 rounded focus:ring-accent"
                      />
                      <label htmlFor="published" className="text-sm font-medium text-textLight">
                        เผยแพร่ทันที
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="active"
                        checked={announcementFormData.active}
                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, active: e.target.checked })}
                        className="mr-2 w-4 h-4 text-accent bg-gray-700 border-gray-600 rounded focus:ring-accent"
                      />
                      <label htmlFor="active" className="text-sm font-medium text-textLight">
                        ใช้งานอยู่
                      </label>
                    </div>
                  </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-secondary hover:bg-secondary-dark text-primary font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      {editingAnnouncement ? 'อัปเดต' : 'สร้างประกาศ'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelAnnouncementEdit}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Announcements List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700 relative">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {announcement.type === 'success' ? '🎉' :
                         announcement.type === 'warning' ? '⚠️' :
                         announcement.type === 'error' ? '❌' : 'ℹ️'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        announcement.priority >= 3 ? 'bg-red-500/20 text-red-400' :
                        announcement.priority >= 2 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        ความสำคัญ: {announcement.priority}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        title="แก้ไข"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="ลบ"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-textLight mb-2">{announcement.title}</h3>
                  <p className="text-textLight/80 text-sm mb-3 line-clamp-3">{announcement.content}</p>

                  <div className="text-xs text-textLight/60 space-y-1">
                    {announcement.version && <p>เวอร์ชัน: {announcement.version}</p>}
                    {announcement.game && <p>เกม: {games.find(g => g.value === announcement.game)?.label}</p>}
                    <p>สร้างเมื่อ: {new Date(announcement.created_at).toLocaleDateString('th-TH')}</p>
                    {announcement.expires_at && (
                      <p>หมดอายุ: {new Date(announcement.expires_at).toLocaleDateString('th-TH')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {announcements.length === 0 && (
              <div className="text-center py-8 text-textLight/60">
                <div className="text-4xl mb-2">📭</div>
                <p>ยังไม่มีประกาศ หรือกด "สร้างประกาศใหม่" เพื่อเพิ่มประกาศ</p>
              </div>
            )}
          </>
        )}

        {/* Calendar Events Section */}
        {activeTab === 'calendar' && (
          <>
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
                      <p className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                        {formatDate(event.event_date)}
                      </p>
                      {event.event_time && (
                        <p className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-secondary rounded-full"></span>
                          {event.event_time}
                        </p>
                      )}
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
          </>
        )}
      </div>
    </div>
  );
}