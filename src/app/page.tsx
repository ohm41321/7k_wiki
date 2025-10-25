'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Reveal from '@/app/components/Reveal';
import FonzuHubBackground from '@/app/components/FonzuHubBackground';
import GameCalendar from '@/app/components/GameCalendar';
import { getPosts } from '@/app/lib/posts';
import banner7k from '@/pic/7k_banner.webp';
import genericBanner from '@/pic/noname_feature.jpg';
import lostswordBanner from '@/pic/lostsword_thumnail.png';
import wutheringWavesBanner from '@/pic/capsule_616x353.jpg';
import blueArchiveBanner from '@/pic/ba.jpg';
import honkaiStarRailBanner from '@/pic/honkai-star-rail-official-art.jpg';
import genshinImpactBanner from '@/pic/genshin.jpeg';
import punishingGrayRavenBanner from '@/pic/pgr.jpg';
import zenlessZoneZeroBanner from '@/pic/zenless_featured.jpg';
import monsterHunterWildsBanner from '@/pic/mhwilds.jpg';
import chaosZeroNightmareBanner from '@/pic/CZNM2.jpg';
import AuthSuccessMessage from '@/app/components/AuthSuccessMessage';

// Define game categories
type GameCategory = 'Gacha' | 'Indy' | 'AAA';

// Define a mapping for game-specific details
const gameDetails: { [key: string]: { title: string; banner: any; category: GameCategory } } = {
  '7KRe': {
    title: 'Seven Knights Re:Birth',
    banner: genericBanner,
    category: 'Gacha',
  },
  'LostSword': {
    title: 'LostSword',
    banner: lostswordBanner,
    category: 'Gacha',
  },
  'WutheringWaves': {
    title: 'Wuthering Waves',
    banner: wutheringWavesBanner,
    category: 'Gacha',
  },
  'PunishingGrayRaven': {
    title: 'Punishing: Gray Raven',
    banner: punishingGrayRavenBanner,
    category: 'Gacha',
  },
  'BlueArchive': {
    title: 'Blue Archive',
    banner: blueArchiveBanner,
    category: 'Gacha',
  },
  'HonkaiStarRail': {
    title: 'Honkai: Star Rail',
    banner: honkaiStarRailBanner,
    category: 'Gacha',
  },
  'GenshinImpact': {
    title: 'Genshin Impact',
    banner: genshinImpactBanner,
    category: 'Gacha',
  },
  'ZenlessZoneZero': {
    title: 'Zenless Zone Zero',
    banner: zenlessZoneZeroBanner,
    category: 'Gacha',
  },
  'MonsterHunterWilds': {
    title: 'Monster Hunter Wilds',
    banner: monsterHunterWildsBanner,
    category: 'AAA',
  },
  'ChaosZeroNightmare': {
    title: 'Chaos Zero Nightmare',
    banner: chaosZeroNightmareBanner,
    category: 'Gacha',
  },
  // Add other games here
};

export default function FonzuHub() {
  const [activeTab, setActiveTab] = useState<GameCategory | 'All'>('All');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // This will be populated with actual data later
  const games = ['7KRe', 'LostSword', 'WutheringWaves', 'PunishingGrayRaven', 'BlueArchive', 'HonkaiStarRail', 'GenshinImpact', 'ZenlessZoneZero', 'MonsterHunterWilds', 'ChaosZeroNightmare'];

  // Filter games based on active tab
  const filteredGames = activeTab === 'All'
    ? games
    : games.filter(game => gameDetails[game]?.category === activeTab);

  const tabs = [
    { key: 'All' as const, label: 'ทั้งหมด', count: games.length },
    { key: 'Gacha' as const, label: 'Gacha', count: games.filter(game => gameDetails[game]?.category === 'Gacha').length },
    { key: 'AAA' as const, label: 'AAA', count: games.filter(game => gameDetails[game]?.category === 'AAA').length },
    { key: 'Indy' as const, label: 'Indy', count: games.filter(game => gameDetails[game]?.category === 'Indy').length },
  ];

  // Touch gesture functions for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const currentIndex = tabs.findIndex(tab => tab.key === activeTab);

    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      // Swipe left - next tab
      setActiveTab(tabs[currentIndex + 1].key);
      if (navigator.vibrate) navigator.vibrate(30);
    }

    if (isRightSwipe && currentIndex > 0) {
      // Swipe right - previous tab
      setActiveTab(tabs[currentIndex - 1].key);
      if (navigator.vibrate) navigator.vibrate(30);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = tabs.findIndex(tab => tab.key === activeTab);

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        setActiveTab(tabs[currentIndex - 1].key);
      } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
        e.preventDefault();
        setActiveTab(tabs[currentIndex + 1].key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, tabs]);

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

        {/* Enhanced Tab Navigation - Carousel Style */}
        <div className="relative mb-8 sm:mb-12">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-secondary/20 to-accent/20 rounded-2xl blur-xl animate-pulse"></div>

          {/* Tab Container with Horizontal Scroll */}
          <div
            className="relative overflow-x-auto scrollbar-hide"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            role="tablist"
            aria-label="ตัวเลือกประเภทเกม"
          >
            <div className="flex justify-center gap-3 sm:gap-6 px-4 py-2 min-w-max">
              {tabs.map((tab, index) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    // Haptic feedback simulation for mobile
                    if (navigator.vibrate) {
                      navigator.vibrate(50);
                    }
                  }}
                  className={`group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-500 transform hover:scale-110 active:scale-95 ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-br from-accent via-accent-light to-secondary text-white shadow-2xl shadow-accent/50 scale-110 active-tab-pulse'
                      : 'bg-gradient-to-br from-primary/80 to-primary text-textLight hover:from-secondary/80 hover:to-secondary hover:text-white hover:shadow-xl hover:shadow-secondary/30'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    transform: activeTab === tab.key ? 'translateY(-2px)' : 'translateY(0px)'
                  }}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  aria-controls={`tabpanel-${tab.key}`}
                  id={`tab-${tab.key}`}
                  tabIndex={activeTab === tab.key ? 0 : -1}
                >
                  {/* Background Glow Effect for Active Tab */}
                  {activeTab === tab.key && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/50 to-secondary/50 rounded-xl blur-lg opacity-75 animate-pulse"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-xl"></div>
                    </>
                  )}

                  {/* Tab Content */}
                  <div className="relative z-10 flex items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-xl">
                      {tab.key === 'All' ? '🎮' :
                       tab.key === 'Gacha' ? '🎰' :
                       tab.key === 'AAA' ? '⭐' : '🎯'}
                    </span>
                    <div className="flex flex-col items-center">
                      <span className="leading-tight">{tab.label}</span>
                      <span className={`text-xs sm:text-sm font-normal ${
                        activeTab === tab.key ? 'text-white/80' : 'text-textLight/70 group-hover:text-white/80'
                      }`}>
                        {tab.count} เกม
                      </span>
                    </div>
                  </div>

                  {/* Hover Effect Particles */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-1 left-2 w-1 h-1 bg-accent/60 rounded-full animate-ping"></div>
                    <div className="absolute top-2 right-3 w-1 h-1 bg-secondary/60 rounded-full animate-ping animation-delay-300"></div>
                    <div className="absolute bottom-2 left-4 w-1 h-1 bg-accent/60 rounded-full animate-ping animation-delay-600"></div>
                  </div>

                  {/* Active Tab Indicator */}
                  {activeTab === tab.key && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-accent rounded-full animate-bounce">
                      <div className="absolute inset-0 bg-accent rounded-full animate-ping"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Scroll Indicators for Mobile */}
          <div className="flex justify-center items-center gap-2 mt-4 sm:hidden">
            <div className="text-accent/60 text-sm">← สไลด์เพื่อเปลี่ยนแท็บ →</div>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-accent/30 rounded-full"></div>
              <div className="w-2 h-2 bg-accent/60 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-accent/30 rounded-full"></div>
            </div>
          </div>
        </div>

        {filteredGames.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center hover:[&>div]:blur-sm hover:[&>div]:opacity-50"
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            id={`tabpanel-${activeTab}`}
          >
            {filteredGames.map(gameSlug => {
              const details = gameDetails[gameSlug] || { title: gameSlug, banner: genericBanner };
              return (
                <Reveal key={gameSlug} className="block transition-all duration-300 hover:!blur-none hover:!opacity-100 hover:scale-110">
                  <Link href={`/${gameSlug}`}>
                    <div className="group block bg-primary rounded-lg overflow-hidden border-2 border-gray-800 hover:border-accent transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-2xl w-full max-w-xs sm:max-w-sm">
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
            <Reveal className="block transition-all duration-300 hover:!blur-none hover:!opacity-100 hover:scale-105">
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
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">ไม่มีเกมในประเภทนี้</div>
            <p className="text-gray-400">กรุณาเลือกประเภทอื่นหรือรอการเพิ่มเกมใหม่</p>
          </div>
        )}
      </div>

      {/* Calendar Section */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative inline-block">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary mb-2">
              <span className="relative">
                ปฏิทินอัพเดทเกม
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
              </span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-accent to-secondary mx-auto rounded-full"></div>
          </div>
          <p className="text-sm sm:text-base text-textLight/80 mt-4">
            ติดตามการอัพเดท ปิดปรับปรุง และอีเวนต์พิเศษของเกมทั้งหมด
            <span className="block text-accent font-semibold mt-1">/admin</span>
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-secondary/5 rounded-2xl blur-xl"></div>
            <div className="relative bg-primary/50 backdrop-blur-sm rounded-2xl border border-accent/20 p-6 sm:p-8">
              <GameCalendar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}