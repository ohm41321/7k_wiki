
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { mutate } from 'swr';

export default function CommentForm({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    const res = await fetch(`/api/comments/${slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, author: session?.user?.name || 'Anonymous' }),
    });

    if (res.ok) {
      setContent('');
      mutate(`/api/comments/${slug}`); // Re-fetch comments after submission
    }
  };

  if (!session) {
    return <p>Please log in to comment.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Add a Comment</h2>
      <textarea
        className="w-full bg-gray-800 p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-accent"
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment here..."
      ></textarea>
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-accent text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors"
      >
        Submit
      </button>
    </form>
  );
}
