'use client';

import { useState, useEffect } from 'react';
import { mutate } from 'swr';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

export default function CommentForm({ slug }: { slug: string }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น');
      return;
    }

    if (!content.trim()) return toast.error('Comment cannot be empty.');

    setLoading(true);

    const res = await fetch(`/api/comments/${slug}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }
    );

    setLoading(false);

    if (res.ok) {
      toast.success('Comment posted!');
      setContent('');
      mutate(`/api/comments/${slug}`); // Re-fetch comments after submission
      window.location.reload();
    } else {
      toast.error('Failed to post comment.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Add a Comment</h2>

      {!user ? (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4">
          <p className="text-gray-300">กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น</p>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">
            แสดงความคิดเห็นในฐานะ: <span className="text-accent font-semibold">{user.user_metadata?.full_name || user.email}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="commentContent" className="sr-only">Comment</label>
          <textarea
            id="commentContent"
            className="w-full bg-gray-800 p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-accent"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your comment here..."
            required
            disabled={!user}
          ></textarea>
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-accent text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
        disabled={loading || !user}
      >
        {loading ? 'Submitting...' : 'Submit Comment'}
      </button>
    </form>
  );
}
