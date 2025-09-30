
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  slug: string;
  title: string;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('/api/posts');
      const posts = await res.json();
      setAllPosts(posts);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      const searchResults = allPosts.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase())
      );
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, allPosts]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts..."
        className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
      />
      {results.length > 0 && (
        <ul className="absolute top-full mt-2 w-full bg-gray-800 rounded-lg shadow-lg z-10">
          {results.map(post => (
            <li key={post.slug}>
              <Link href={`/posts/${post.slug}`} className="block px-4 py-2 hover:bg-gray-700">
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
