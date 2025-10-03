import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '@/app/lib/posts';
import Reveal from '@/app/components/Reveal';
import banner from '@/pic/noname_feature.jpg';

// No longer need PostData interface

type PageProps = {
  params: { game: string; tag: string };
};

export default async function TagPage({ params }: PageProps) {
  const { game, tag } = params;
  
  // Await and filter posts
  const allPosts = await getPosts();
  const posts = allPosts.filter(post => 
    post.game === game && 
    post.tags?.map((t: string) => t.toLowerCase()).includes(tag.toLowerCase())
  );

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary mb-2">Tag: #{tag}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Reveal key={post.slug} className="block">
              <Link 
                href={`/${game}/posts/${post.slug}`} 
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
                      unoptimized={true}
                    />
                  ) : (
                    <Image 
                        src={banner} 
                        alt="Default Post Image" 
                        fill
                        style={{ objectFit: 'cover' }} 
                        className="transition-transform duration-500 group-hover:scale-110"
                      />
                  )}
                </div>
                <div className="p-6">
                  {post.category && (
                    <Link href={`/${game}/category/${post.category.toLowerCase()}`}>
                      <span className="text-accent font-bold text-sm hover:underline">{post.category}</span>
                    </Link>
                  )}
                  <h3 className="mb-2 mt-1 text-xl font-bold tracking-tight text-secondary group-hover:text-accent transition-colors">{post.title}</h3>
                  <p className="font-normal text-textLight text-sm" suppressHydrationWarning>
                    By {post.author?.username || 'Unknown'} on {formatDateThai(post.created_at)} เวลา {formatTimeThai(post.created_at)}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </main>
    </div>
  );
}