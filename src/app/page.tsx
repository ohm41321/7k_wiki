import Link from 'next/link';
import Image from 'next/image';
import Reveal from '@/app/components/Reveal';
import FonzuHubBackground from '@/app/components/FonzuHubBackground';
import { getPosts } from '@/app/lib/posts';
import banner7k from '@/pic/7k_banner.webp';
import genericBanner from '@/pic/noname_feature.jpg';
import lostswordBanner from '@/pic/lostsword_thumnail.png';
import AuthSuccessMessage from '@/app/components/AuthSuccessMessage';

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
  // Add other games here
};

export default async function FonzuHub() {
  const allPosts = await getPosts();
  const games = allPosts ? [...new Set(allPosts.map(post => post.game).filter(Boolean))] as string[] : [];

  return (
    <div className="text-textLight">
      <AuthSuccessMessage />

      {/* Hero Section */}
      <div className="relative h-[60vh] sm:h-[70vh] lg:h-[75vh] min-h-[500px] sm:min-h-[600px] flex items-center justify-center text-center overflow-hidden">
        <FonzuHubBackground />
        <div className="z-10 px-4 sm:px-6">
          <Reveal replay={true}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-2 sm:mb-4 font-orbitron">
              <span className="text-orange-400">Fonzu</span> <span className="text-blue-400">Wiki</span>
            </h1>
          </Reveal>
          <Reveal replay={true}>
            <p className="text-lg sm:text-xl md:text-2xl text-textLight fade-in mt-2 px-2">สารานุกรมข่าวสาร ไกด์ และข้อมูลเกมกาชา</p>
          </Reveal>
        </div>
      </div>

      {/* Games Section */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary mb-2">เลือกเกมของคุณ</h2>
          <p className="text-sm sm:text-base">เลือกดูเนื้อหาของเกมที่คุณสนใจ</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
          {games.map(gameSlug => {
            const details = gameDetails[gameSlug] || { title: gameSlug, banner: genericBanner };
            return (
              <Reveal key={gameSlug} className="block">
                <Link href={`/${gameSlug}`}>
                  <div className="block bg-primary rounded-lg overflow-hidden border-2 border-gray-800 hover:border-accent transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-2xl group w-full max-w-xs sm:max-w-sm">
                    <div className="relative w-full aspect-[16/9] overflow-hidden">
                      <Image
                        src={details.banner}
                        alt={`${details.title} Banner`}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-500 group-hover:scale-110"
                        unoptimized={true}
                      />
                    </div>
                    <div className="p-4 sm:p-6">
                        <h3 className="mb-2 mt-1 text-xl sm:text-2xl font-bold tracking-tight text-secondary group-hover:text-accent transition-colors">{details.title}</h3>
                      <p className="font-normal text-textLight text-sm">
                        เข้าสู่คลังข้อมูล ไกด์ และข่าวสารล่าสุดของเกม
                      </p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}

          {/* Coming Soon Card */}
          <Reveal className="block">
            <div className="block bg-primary rounded-lg overflow-hidden border-2 border-gray-800 w-full max-w-xs sm:max-w-sm h-full">
              <div className="relative w-full aspect-[16/9] overflow-hidden bg-black/20 flex items-center justify-center">
                <p className="text-gray-500 text-base sm:text-lg">Coming Soon...</p>
              </div>
              <div className="p-4 sm:p-6">
                  <h3 className="mb-2 mt-1 text-xl sm:text-2xl font-bold tracking-tight text-gray-600">เกมใหม่เร็วๆ นี้</h3>
                <p className="font-normal text-gray-500 text-sm">
                  กำลังเตรียมข้อมูลของเกมถัดไป โปรดรอติดตาม
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}