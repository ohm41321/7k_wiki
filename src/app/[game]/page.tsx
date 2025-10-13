'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Reveal from '@/app/components/Reveal';
import HeroBackground from '@/app/components/HeroBackground';
import lostswordBanner from '@/pic/lostsword_thumnail.png';
import wutheringWavesBanner from '@/pic/capsule_616x353.jpg';
import blueArchiveBanner from '@/pic/ba.jpg';
import genericBanner from '@/pic/noname_feature.jpg';
import honkaiStarRailBanner from '@/pic/honkai-star-rail-official-art.jpg';
import genshinImpactBanner from '@/pic/genshin.jpeg';
import punishingGrayRavenBanner from '@/pic/pgr.jpg';
import zenlessZoneZeroBanner from '@/pic/zenless_featured.jpg';
import monsterHunterWildsBanner from '@/pic/mhwilds.jpg';
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
  'WutheringWaves': {
    title: 'Wuthering Waves',
    banner: wutheringWavesBanner,
  },
  'PunishingGrayRaven': {
    title: 'Punishing: Gray Raven',
    banner: punishingGrayRavenBanner,
  },
  'BlueArchive': {
    title: 'Blue Archive',
    banner: blueArchiveBanner,
  },
  'HonkaiStarRail': {
    title: 'Honkai: Star Rail',
    banner: honkaiStarRailBanner,
  },
  'GenshinImpact': {
    title: 'Genshin Impact',
    banner: genshinImpactBanner,
  },
  'ZenlessZoneZero': {
    title: 'Zenless Zone Zero',
    banner: zenlessZoneZeroBanner,
  },
  'MonsterHunterWilds': {
    title: 'Monster Hunter Wilds',
    banner: monsterHunterWildsBanner,
  },
};

// No longer need PostData interface, type will be inferred from getPosts()

export default function GamePage({ params }: { params: { game: string } }) {
    const game = params.game; // Extract game from params
    const [posts, setPosts] = useState<any[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showCategoryFilter, setShowCategoryFilter] = useState<boolean>(false);

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
        setFilteredPosts(sortedPosts);

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

    // Listen for real-time post updates
    const postsSubscription = supabase
      .channel('posts-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `game=eq.${params.game}`
        },
        (payload) => {
          console.log('Real-time post update:', payload);
          // Refetch posts when there's a change
          fetchData();
        }
      )
      .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      postsSubscription.unsubscribe();
    };
  }, [params.game, supabase]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCategoryFilter && !(event.target as Element).closest('.category-filter-container')) {
        setShowCategoryFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryFilter]);

  // Filter posts based on selected category
  useEffect(() => {
    if (!posts.length) return;

    let filtered = posts;

    if (selectedCategory !== 'all') {
      switch (selectedCategory) {
        case 'tier-list':
          filtered = posts.filter(post =>
            post.category?.toLowerCase() === 'tier list' ||
            post.tags?.some((tag: string) => tag.toLowerCase().includes('tier'))
          );
          break;
        case 'build-guide':
          filtered = posts.filter(post =>
            post.category?.toLowerCase() === 'build guide' ||
            post.tags?.some((tag: string) => tag.toLowerCase().includes('build'))
          );
          break;
        case 'guide':
          filtered = posts.filter(post =>
            post.category?.toLowerCase() === 'guide' ||
            post.tags?.some((tag: string) => tag.toLowerCase().includes('guide'))
          );
          break;
        case 'news':
          filtered = posts.filter(post =>
            post.category?.toLowerCase() === 'news' ||
            post.tags?.some((tag: string) => tag.toLowerCase().includes('news'))
          );
          break;
        case 'tips':
          filtered = posts.filter(post =>
            post.category?.toLowerCase() === 'tips' ||
            post.tags?.some((tag: string) => tag.toLowerCase().includes('tip'))
          );
          break;
        case 'review':
          filtered = posts.filter(post =>
            post.category?.toLowerCase() === 'review' ||
            post.tags?.some((tag: string) => tag.toLowerCase().includes('review'))
          );
          break;
        case 'other':
          filtered = posts.filter(post =>
            post.category?.toLowerCase() === 'other' ||
            (post.category && !['tier list', 'build guide', 'guide', 'news', 'tips', 'review'].includes(post.category.toLowerCase()))
          );
          break;
        default:
          filtered = posts;
      }
    }

    setFilteredPosts(filtered);
  }, [posts, selectedCategory]);

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
           <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary">อัปเดตข่าวสาร ไกด์ และเคล็ดลับ</h2>
           {user && (
             <Link href={`/create?game=${game}`}>
               <span className="bg-accent hover:bg-accent-dark text-white font-bold py-2 px-4 rounded-md transition-colors text-sm sm:text-base whitespace-nowrap">
                 Create Post
               </span>
             </Link>
           )}
         </div>

         {/* Category Filter */}
         <div className="mb-8 sm:mb-12">
           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
             <h3 className="text-lg font-semibold text-secondary">กรองตามประเภทโพสต์</h3>
             <div className="relative category-filter-container">
               <button
                 onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                 className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 border border-gray-600"
               >
                 <span>
                   {selectedCategory === 'all' ? 'ทั้งหมด' :
                    selectedCategory === 'tier-list' ? 'Tier List' :
                    selectedCategory === 'build-guide' ? 'Build Guide' :
                    selectedCategory === 'guide' ? 'Guide' :
                    selectedCategory === 'news' ? 'News' :
                    selectedCategory === 'tips' ? 'Tips' :
                    selectedCategory === 'review' ? 'Review' : 'Other'}
                 </span>
                 <svg className={`w-4 h-4 transition-transform ${showCategoryFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </button>

               {showCategoryFilter && (
                 <div className="absolute top-full left-0 mt-2 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                   <div className="py-2">
                     <button
                       onClick={() => { setSelectedCategory('all'); setShowCategoryFilter(false); }}
                       className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                         selectedCategory === 'all' ? 'bg-secondary text-primary' : 'text-textLight'
                       }`}
                     >
                       ทั้งหมด ({posts.length})
                     </button>
                     <button
                       onClick={() => { setSelectedCategory('tier-list'); setShowCategoryFilter(false); }}
                       className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                         selectedCategory === 'tier-list' ? 'bg-secondary text-primary' : 'text-textLight'
                       }`}
                     >
                       Tier List ({posts.filter(post => post.category?.toLowerCase() === 'tier list' || post.tags?.some((tag: string) => tag.toLowerCase().includes('tier'))).length})
                     </button>
                     <button
                       onClick={() => { setSelectedCategory('build-guide'); setShowCategoryFilter(false); }}
                       className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                         selectedCategory === 'build-guide' ? 'bg-secondary text-primary' : 'text-textLight'
                       }`}
                     >
                       Build Guide ({posts.filter(post => post.category?.toLowerCase() === 'build guide' || post.tags?.some((tag: string) => tag.toLowerCase().includes('build'))).length})
                     </button>
                     <button
                       onClick={() => { setSelectedCategory('guide'); setShowCategoryFilter(false); }}
                       className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                         selectedCategory === 'guide' ? 'bg-secondary text-primary' : 'text-textLight'
                       }`}
                     >
                       Guide ({posts.filter(post => post.category?.toLowerCase() === 'guide' || post.tags?.some((tag: string) => tag.toLowerCase().includes('guide'))).length})
                     </button>
                     <button
                       onClick={() => { setSelectedCategory('news'); setShowCategoryFilter(false); }}
                       className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                         selectedCategory === 'news' ? 'bg-secondary text-primary' : 'text-textLight'
                       }`}
                     >
                       News ({posts.filter(post => post.category?.toLowerCase() === 'news' || post.tags?.some((tag: string) => tag.toLowerCase().includes('news'))).length})
                     </button>
                     <button
                       onClick={() => { setSelectedCategory('tips'); setShowCategoryFilter(false); }}
                       className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                         selectedCategory === 'tips' ? 'bg-secondary text-primary' : 'text-textLight'
                       }`}
                     >
                       Tips ({posts.filter(post => post.category?.toLowerCase() === 'tips' || post.tags?.some((tag: string) => tag.toLowerCase().includes('tip'))).length})
                     </button>
                     <button
                       onClick={() => { setSelectedCategory('review'); setShowCategoryFilter(false); }}
                       className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                         selectedCategory === 'review' ? 'bg-secondary text-primary' : 'text-textLight'
                       }`}
                     >
                       Review ({posts.filter(post => post.category?.toLowerCase() === 'review' || post.tags?.some((tag: string) => tag.toLowerCase().includes('review'))).length})
                     </button>
                     <button
                       onClick={() => { setSelectedCategory('other'); setShowCategoryFilter(false); }}
                       className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                         selectedCategory === 'other' ? 'bg-secondary text-primary' : 'text-textLight'
                       }`}
                     >
                       Other ({posts.filter(post => post.category?.toLowerCase() === 'other' || (post.category && !['tier list', 'build guide', 'guide', 'news', 'tips', 'review'].includes(post.category.toLowerCase()))).length})
                     </button>
                   </div>
                 </div>
               )}
             </div>
           </div>

           {/* Filter Summary */}
           <div className="text-sm text-textLight/70">
             แสดง {filteredPosts.length} จาก {posts.length} โพสต์
             {selectedCategory !== 'all' && (
               <span className="ml-2 text-accent">
                 (กรองโดย: {
                   selectedCategory === 'tier-list' ? 'Tier List' :
                   selectedCategory === 'build-guide' ? 'Build Guide' :
                   selectedCategory === 'guide' ? 'Guide' :
                   selectedCategory === 'news' ? 'News' :
                   selectedCategory === 'tips' ? 'Tips' :
                   selectedCategory === 'review' ? 'Review' : 'Other'
                 })
               </span>
             )}
           </div>
         </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
            <Reveal key={post.slug} className="block">
              <div className="block bg-primary rounded-lg overflow-hidden border-2 border-gray-800 hover:border-accent transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-2xl group">
                <Link href={`/${game}/posts/${post.slug}`}>
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
                    <Link href={`/${game}/category/${post.category.toLowerCase()}`}>
                      <span className="text-accent font-bold text-sm hover:underline">{post.category}</span>
                    </Link>
                  )}
                  <div className="flex items-center gap-2 mb-2 mt-1">
                    <Link href={`/${game}/posts/${post.slug}`}>
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
                      <Link href={`/${game}/tags/${tag.toLowerCase()}`} key={tag} className="text-xs bg-gray-700 text-textLight px-2 py-1 rounded-md hover:bg-gray-600 transition-colors">
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
            ))
           ) : (
             <div className="col-span-full text-center py-12">
               <div className="text-gray-400 text-lg mb-2">ไม่พบโพสต์ในหมวดหมู่นี้</div>
               <p className="text-gray-500 text-sm">ลองเลือกประเภทโพสต์อื่นหรือสร้างโพสต์ใหม่</p>
             </div>
           )}
         </div>
      </div>
      
    </div>
  );
}