'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Reveal from '@/app/components/Reveal';
import HeroBackground from '@/app/components/HeroBackground';
import lostswordBanner from '@/pic/lostsword_thumnail.png';
import genericBanner from '@/pic/noname_feature.jpg';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

// Define a mapping for game-specific details
const gameDetails: { [key: string]: { title: string; banner: any } } = {
  '7KRe': {
    title: 'Seven Knights Re:Birth',
    banner: genericBanner,
  },
  'LostSword': {
    title: 'LostSword',
    banner: lostswordBanner,
  },
};

// No longer need PostData interface, type will be inferred from getPosts()

export default function GamePage({ params }: { params: { game: string } }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch posts from API
        const postsResponse = await fetch('/api/posts');
        const allPosts = await postsResponse.json();
        const filteredPosts = allPosts.filter((post: any) => post.game === params.game);
        // Sort posts from newest to oldest
        const sortedPosts = filteredPosts.sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setPosts(sortedPosts);

        // Get user session
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [params.game, supabase.auth]);

  const details = gameDetails[params.game] || { title: params.game, banner: genericBanner };

  const formatDateThai = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Bangkok' });
  };

  const formatTimeThai = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  };

  const isNewPost = (createdAt: string) => {
    const postDate = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24; // Less than 24 hours = 1 day
  };

  return (
    <div className="text-textLight">
      {/* Hero Section */}
      <div className="relative h-[50vh] sm:h-[60vh] lg:h-[65vh] min-h-[400px] sm:min-h-[500px] flex items-center justify-center text-center overflow-hidden mb-8 sm:mb-12">
        <HeroBackground />
        <div className="z-10 px-4 sm:px-6">
          <Reveal replay={true}>
            <div className="mx-auto mb-4 w-full max-w-4xl">
              <Image
                src={details.banner}
                alt="Site banner"
                width={1200}
                height={180}
                className="mx-auto rounded-md shadow-lg w-full max-w-md sm:max-w-lg lg:max-w-4xl"
                unoptimized={true}
              />
            </div>
          </Reveal>
          <Reveal replay={true}>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-yellow-400 drop-shadow-lg mb-2 sm:mb-4 typing inline-block p-2 sm:p-4">{details.title}</h1>
          </Reveal>
          <Reveal replay={true}>
            <p className="text-base sm:text-lg md:text-xl text-textLight fade-in mt-2 px-2">สารานุกรมเกมกาชา โดย Fonzu</p>
          </Reveal>
        </div>

      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary">อัปเดตข่าวสาร ไกด์ และเคล็ดลับ</h2>
          {user && (
            <Link href={`/create?game=${params.game}`}>
              <span className="bg-accent hover:bg-accent-dark text-white font-bold py-2 px-4 rounded-md transition-colors text-sm sm:text-base whitespace-nowrap">
                Create Post
              </span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {posts.map((post) => (
            <Reveal key={post.slug} className="block">
              <div className="block bg-primary rounded-lg overflow-hidden border-2 border-gray-800 hover:border-accent transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-2xl group">
                <Link href={`/${params.game}/posts/${post.slug}`}>
                  <div className="relative w-full aspect-[16/9] overflow-hidden">
                    {post.imageurls && post.imageurls.length > 0 ? (
                      <Image 
                        src={post.imageurls[0]} 
                        alt={post.title} 
                        fill
                        style={{ objectFit: 'cover' }} 
                        className="transition-transform duration-500 group-hover:scale-110"
                        unoptimized={true}
                      />
                    ) : (
                      <Image 
                        src={details.banner} 
                        alt="Default Post Image" 
                        fill
                        style={{ objectFit: 'cover' }} 
                        className="transition-transform duration-500 group-hover:scale-110"
                        unoptimized={true}
                      />
                    )}
                  </div>
                </Link>
                <div className="p-6">
                  {post.category && (
                    <Link href={`/${params.game}/category/${post.category.toLowerCase()}`}>
                      <span className="text-accent font-bold text-sm hover:underline">{post.category}</span>
                    </Link>
                  )}
                  <div className="flex items-center gap-2 mb-2 mt-1">
                    <Link href={`/${params.game}/posts/${post.slug}`}>
                      <h3 className="text-xl font-bold tracking-tight text-secondary group-hover:text-accent transition-colors">{post.title}</h3>
                    </Link>
                    {isNewPost(post.created_at) && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-lg">
                        New!
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags?.map((tag: string) => (
                      <Link href={`/${params.game}/tags/${tag.toLowerCase()}`} key={tag} className="text-xs bg-gray-700 text-textLight px-2 py-1 rounded-md hover:bg-gray-600 transition-colors">
                        #{tag}
                      </Link>
                    ))}
                  </div>

                  <p className="font-normal text-textLight text-sm" suppressHydrationWarning>
                    By {post.author_name || 'Anonymous'} on {formatDateThai(post.created_at)} เวลา {formatTimeThai(post.created_at)}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      
    </div>
  );
}