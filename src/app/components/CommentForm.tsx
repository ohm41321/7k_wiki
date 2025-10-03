'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { toast } from 'sonner';

export default function CommentForm({ slug }: { slug: string }) {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorName.trim()) return toast.error('Please enter your name.');
    if (!content.trim()) return toast.error('Comment cannot be empty.');

    setLoading(true);

    const res = await fetch(`/api/comments/${slug}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, author_name: authorName }),
      }
    );

    setLoading(false);

    if (res.ok) {
      toast.success('Comment posted!');
      setContent('');
      // We can leave the author name in case they want to comment again
      mutate(`/api/comments/${slug}`); // Re-fetch comments after submission
    } else {
      toast.error('Failed to post comment.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Add a Comment</h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="authorName" className="sr-only">Your Name</label>
          <input
            id="authorName"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your Name"
            className="w-full bg-gray-800 p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-accent"
            required
          />
        </div>
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
          ></textarea>
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-accent text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Comment'}
      </button>
    </form>
  );
}
