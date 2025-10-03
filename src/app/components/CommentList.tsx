
'use client';

import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error: any = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object.
    try {
      error.info = await res.json();
    } catch (e) {
      error.info = { message: 'Failed to parse error JSON' };
    }
    error.status = res.status;
    throw error;
  }

  return res.json();
};

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export default function CommentList({ slug }: { slug: string }) {
  const { data: comments, error } = useSWR(`/api/comments/${slug}`, fetcher, { refreshInterval: 5000 });

  if (error) return <div>Failed to load comments.</div>;
  if (!comments) return <div>Loading comments...</div>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Comments</h2>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment: Comment) => (
            <li key={comment.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <p className="font-bold mr-2">{comment.author_name || 'Anonymous'}</p>
                <p className="text-sm text-gray-400">{new Date(comment.created_at).toLocaleString()}</p>
              </div>
              <p>{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
