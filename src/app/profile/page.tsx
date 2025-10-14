'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import Navbar from '@/app/components/Navbar';
import PushNotificationManager from '@/app/components/PushNotificationManager';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState('');
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userComments, setUserComments] = useState<any[]>([]);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth');
        return;
      }

      setUser(user);
      setName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

      // Fetch user posts and comments
      await fetchUserContent(user.id);

      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        router.push('/auth');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  const fetchUserContent = async (userId: string) => {
    try {
      // Fetch user posts
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      // Fetch user comments
      const { data: comments } = await supabase
        .from('comments')
        .select(`
          *,
          posts(title, slug, game)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      setUserPosts(posts || []);
      setUserComments(comments || []);
    } catch (error) {
      console.error('Error fetching user content:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: name,
          email: user.email,
        });

      if (error) throw error;

      // Update auth metadata
      await supabase.auth.updateUser({
        data: { full_name: name }
      });

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
    setUpdating(false);
  };

  const formatDateThai = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Bangkok'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary text-textLight">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page
  }

  return (
    <div className="min-h-screen bg-primary text-textLight">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-secondary">โปรไฟล์ผู้ใช้</h1>

          {/* Profile Information */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-accent">ข้อมูลส่วนตัว</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">ชื่อผู้ใช้</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600 focus:outline-none focus:border-accent"
                  placeholder="กรุณากรอกชื่อ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">อีเมล</label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600 text-gray-400"
                />
              </div>
            </div>

            <button
              onClick={updateProfile}
              disabled={updating}
              className="bg-accent hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {updating ? 'กำลังอัปเดต...' : 'อัปเดตโปรไฟล์'}
            </button>
          </div>

          {/* Push Notifications */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <PushNotificationManager />
          </div>

          {/* User Posts */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-accent">โพสต์ของฉัน ({userPosts.length})</h2>

            {userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <Link key={post.id} href={`/${post.game}/posts/${post.slug}`}>
                    <div className="border border-gray-700 rounded-lg p-4 hover:border-accent hover:bg-gray-800/50 transition-all duration-200 cursor-pointer">
                      <h3 className="font-semibold text-secondary hover:text-accent transition-colors">{post.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        สร้างเมื่อ: {formatDateThai(post.created_at)}
                      </p>
                      <p className="text-sm text-gray-400">
                        เกม: {post.game} | หมวดหมู่: {post.category || 'ไม่มี'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">ยังไม่มีโพสต์</p>
            )}
          </div>

          {/* User Comments */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-accent">ความคิดเห็นของฉัน ({userComments.length})</h2>

            {userComments.length > 0 ? (
              <div className="space-y-4">
                {userComments.map((comment) => (
                  <div key={comment.id} className="border border-gray-700 rounded-lg p-4 hover:border-accent transition-colors">
                    <p className="text-secondary mb-2">{comment.content}</p>
                    {comment.posts ? (
                      <Link href={`/${comment.posts.game}/posts/${comment.posts.slug}`}>
                        <p className="text-sm text-accent hover:underline mb-1 cursor-pointer">
                          ในโพสต์: {comment.posts.title}
                        </p>
                      </Link>
                    ) : (
                      <p className="text-sm text-gray-500 mb-1">
                        ในโพสต์: โพสต์ที่ถูกลบแล้ว
                      </p>
                    )}
                    <p className="text-sm text-gray-400">
                      เมื่อ: {formatDateThai(comment.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">ยังไม่มีความคิดเห็น</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}