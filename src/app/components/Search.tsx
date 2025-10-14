
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  slug: string;
  title: string;
  game: string;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch(`/api/posts?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
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
      setResults(searchResults.slice(0, 5)); // Limit to 5 results
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, allPosts]);

  const handleFocus = () => {
    if (query.length > 1 && results.length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding to allow clicking on results
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="ค้นหาโพสต์..."
            className="bg-gray-800/50 text-textLight px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent border border-gray-600/50 w-full"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {isOpen && results.length > 0 && (
            <ul className="absolute top-full mt-2 w-full bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg z-50 border border-gray-600/50 max-h-64 overflow-y-auto">
              {results.map(post => (
                <li key={post.slug}>
                  <Link
                    href={`/${post.game}/posts/${post.slug}`}
                    className="block px-4 py-3 hover:bg-gray-700/50 text-textLight transition-colors"
                    onClick={() => {
                      setQuery('');
                      setIsOpen(false);
                    }}
                  >
                    <div className="font-medium">{post.title}</div>
                    <div className="text-xs text-textLight/60 mt-1">
                      {post.game}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          href="/search"
          className="px-3 py-2 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 rounded-lg transition-colors whitespace-nowrap text-sm font-medium"
        >
          ค้นหาขั้นสูง
        </Link>
      </div>
    </div>
  );
}
