'use client';

import Image from 'next/image';
import bgGif from '@/pic/wuthering-waves-changli.gif';

export default function FonzuHubBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <Image
        src={bgGif}
        alt="Wuthering Waves Changli GIF Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        unoptimized={true} // Important for GIFs to prevent static image optimization
        className="opacity-50"
      />
      <div className="absolute inset-0 bg-black/50"></div> {/* Overlay for better text readability */}
    </div>
  );
}