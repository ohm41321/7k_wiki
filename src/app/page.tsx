import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '@/app/lib/posts';
import Reveal from '@/app/components/Reveal';
import Footer from '@/app/components/Footer';
import banner from '@/pic/noname_feature.jpg';

interface PostData {
  slug: string;
  title: string;
  date: string;
  author: string;
  imageUrls?: string[];
}

export default async function Home() {
  const posts: PostData[] = getPosts();

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
  <div className="relative h-[50vh] min-h-[420px] flex items-center justify-center text-center pt-16">
  <Image src={banner} alt="7K banner" fill style={{ objectFit: 'cover' }} className="absolute inset-0 -z-10" />
        <div className="absolute inset-0 bg-black/40 -z-5" />
        <div className="z-10 px-4">
          <div className="mx-auto mb-4 w-full max-w-3xl">
            <Image src={banner} alt="Site banner" width={1200} height={180} className="mx-auto rounded-md shadow-lg" />
          </div>
          <Reveal>
            <h1 className="text-5xl md:text-7xl font-extrabold text-yellow-400 drop-shadow-lg mb-4 typing inline-block">7KRe:Hub</h1>
          </Reveal>
          <Reveal>
            <p className="text-lg md:text-xl text-textLight fade-in mt-2">by Fonzu – คลังไกด์อัศวินแห่ง Rebirth</p>
          </Reveal>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-secondary mb-2">Latest News</h2>
          <p>Stay up to date with the latest articles and guides.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Reveal key={post.slug} className="block">
              <Link 
                href={`/posts/${post.slug}`} 
                className="block bg-primary rounded-lg overflow-hidden border-2 border-gray-800 hover:border-accent transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-2xl group"
              >
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  {post.imageUrls && post.imageUrls.length > 0 ? (
                    <Image 
                      src={post.imageUrls[0]} 
                      alt={post.title} 
                      fill
                      style={{ objectFit: 'cover' }} 
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <p className="text-gray-500">No Image</p>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold tracking-tight text-secondary group-hover:text-accent transition-colors">{post.title}</h3>
                  <p className="font-normal text-textLight text-sm" suppressHydrationWarning>
                    By {post.author} on {formatDateThai(post.date)} เวลา {formatTimeThai(post.date)}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
