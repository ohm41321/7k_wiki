import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '@/app/lib/posts';
import Reveal from '@/app/components/Reveal';
import HeroBackground from '@/app/components/HeroBackground';
import lostswordBanner from '@/pic/lostsword_thumnail.png';
import genericBanner from '@/pic/noname_feature.jpg';

// Define a mapping for game-specific details
const gameDetails: { [key: string]: { title: string; banner: any } } = {
  '7k-re-fonzu': {
    title: 'Seven Knights Re:Birth',
    banner: genericBanner,
  },
  'LostSword': {
    title: 'LostSword',
    banner: lostswordBanner,
  },
};

// No longer need PostData interface, type will be inferred from getPosts()

export default async function GamePage({ params }: { params: { game: string } }) {
  // Await and filter posts
  const allPosts = await getPosts();
  const posts = allPosts.filter(post => post.game === params.game);

  const details = gameDetails[params.game] || { title: params.game, banner: genericBanner };

  const formatDateThai = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Bangkok' });
  };

  const formatTimeThai = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  };

  return (
    <div className="text-textLight">
      {/* Hero Section */}
      <div className="relative h-[65vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden mb-12">
        <HeroBackground />
        <div className="z-10 px-4">
          <Reveal replay={true}>
            <div className="mx-auto mb-4 w-full max-w-4xl">
              <Image src={details.banner} alt="Site banner" width={1200} height={180} className="mx-auto rounded-md shadow-lg" unoptimized={true} />
            </div>
          </Reveal>
          <Reveal replay={true}>
            <h1 className="text-5xl md:text-7xl font-extrabold text-yellow-400 drop-shadow-lg mb-4 typing inline-block p-4">{details.title}</h1>
          </Reveal>
          <Reveal replay={true}>
            <p className="text-lg md:text-xl text-textLight fade-in mt-2">สารานุกรมเกมกาชา โดย Fonzu</p>
          </Reveal>
        </div>

      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold text-secondary">อัปเดตข่าวสาร ไกด์ และเคล็ดลับจากจารย์ปิง!</h2>
          <Link href={`/create?game=${params.game}`}>
            <span className="bg-accent hover:bg-accent-dark text-white font-bold py-2 px-4 rounded-md transition-colors">
              Create Post
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <Link href={`/${params.game}/posts/${post.slug}`}>
                    <h3 className="mb-2 mt-1 text-xl font-bold tracking-tight text-secondary group-hover:text-accent transition-colors">{post.title}</h3>
                  </Link>

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