import Link from 'next/link';
import Image from 'next/image';
import Reveal from '@/app/components/Reveal';
import FonzuHubBackground from '@/app/components/FonzuHubBackground';
import ImageUploader from '@/app/components/ImageUploader';
import banner from '@/pic/7k_banner.webp';

export default function FonzuHub() {
  return (
    <div className="text-textLight">
      {/* Hero Section */}
      <div className="relative h-[75vh] min-h-[600px] flex items-center justify-center text-center overflow-hidden">
        <FonzuHubBackground />
        <div className="z-10 px-4">
          <Reveal replay={true}>
            <h1 className="text-6xl md:text-8xl font-black mb-4 font-orbitron">
              <span className="text-orange-400">Fonzu</span> <span className="text-blue-400">Wiki</span>
            </h1>
          </Reveal>
          <Reveal replay={true}>
            <p className="text-xl md:text-2xl text-textLight fade-in mt-2">สารานุกรมข่าวสาร ไกด์ และข้อมูลเกมกาชา</p>
          </Reveal>
        </div>
      </div>

      {/* Games Section */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-secondary mb-2">เลือกเกมของคุณ</h2>
          <p>เลือกดูเนื้อหาของเกมที่คุณสนใจ</p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {/* Seven Knights Card */}
          <Reveal className="block">
            <Link href="/7k-re-fonzu">
              <div className="block bg-primary rounded-lg overflow-hidden border-2 border-gray-800 hover:border-accent transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-2xl group w-full max-w-sm">
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  <Image 
                    src={banner} 
                    alt="Seven Knights Re:Birth Banner"
                    fill
                    style={{ objectFit: 'cover' }} 
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                    <h3 className="mb-2 mt-1 text-2xl font-bold tracking-tight text-secondary group-hover:text-accent transition-colors">Seven Knights Re:Birth</h3>
                  <p className="font-normal text-textLight text-sm">
                    เข้าสู่คลังข้อมูล ไกด์ และข่าวสารล่าสุดของเกม
                  </p>
                </div>
              </div>
            </Link>
          </Reveal>

          {/* Coming Soon Card */}
          <Reveal className="block">
            <div className="block bg-primary rounded-lg overflow-hidden border-2 border-gray-800 w-full max-w-sm h-full">
              <div className="relative w-full aspect-[16/9] overflow-hidden bg-black/20 flex items-center justify-center">
                <p className="text-gray-500 text-lg">Coming Soon...</p>
              </div>
              <div className="p-6">
                  <h3 className="mb-2 mt-1 text-2xl font-bold tracking-tight text-gray-600">เกมใหม่เร็วๆ นี้</h3>
                <p className="font-normal text-gray-500 text-sm">
                  กำลังเตรียมข้อมูลของเกมถัดไป โปรดรอติดตาม
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Uploader Section for Testing */}
      <div className="py-16">
        <ImageUploader />
      </div>

    </div>
  );
}