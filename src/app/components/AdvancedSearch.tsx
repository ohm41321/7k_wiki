'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchFilters {
  query: string;
  game: string;
  category: string;
  author: string;
  startDate: string;
  endDate: string;
  sortBy: string;
  sortOrder: string;
}

interface FilterOptions {
  games: string[];
  categories: string[];
  authors: string[];
  tags: string[];
}

interface SearchResults {
  posts: any[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  filters: FilterOptions;
}

export default function AdvancedSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    game: searchParams.get('game') || '',
    category: searchParams.get('category') || '',
    author: searchParams.get('author') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    games: [],
    categories: [],
    authors: [],
    tags: []
  });

  // Fetch filter options and perform search
  useEffect(() => {
    fetchFilterOptions();
    performSearch();
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.query) params.set('q', filters.query);
      if (filters.game) params.set('game', filters.game);
      if (filters.category) params.set('category', filters.category);
      if (filters.author) params.set('author', filters.author);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      params.set('sortBy', filters.sortBy);
      params.set('sortOrder', filters.sortOrder);
      params.set('limit', '1'); // We only need filter options

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data.filters);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      params.set('page', '1');
      params.set('limit', '10');

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    const resetFilters = {
      query: '',
      game: '',
      category: '',
      author: '',
      startDate: '',
      endDate: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    };
    setFilters(resetFilters);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const gameNames: { [key: string]: string } = {
    '7KRe': 'Seven Knights Re:Birth',
    'WutheringWaves': 'Wuthering Waves',
    'LostSword': 'LostSword',
    'BlueArchive': 'Blue Archive',
    'HonkaiStarRail': 'Honkai: Star Rail',
    'GenshinImpact': 'Genshin Impact',
    'PunishingGrayRaven': 'Punishing: Gray Raven',
    'ZenlessZoneZero': 'Zenless Zone Zero',
    'MonsterHunterWilds': 'Monster Hunter Wilds'
  };

  return (
    <div className="bg-primary/50 backdrop-blur-sm rounded-xl border border-accent/20 p-4 sm:p-6">
      {/* Search Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-secondary mb-2">ค้นหาโพสต์</h2>
        <p className="text-textLight/80 text-sm">ค้นหาเนื้อหาเกม ไกด์ และข่าวสาร</p>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาโพสต์... (ชื่อเรื่องหรือเนื้อหา)"
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-gray-800/50 border border-gray-600 rounded-lg text-textLight placeholder-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter Toggle Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg text-textLight transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          ตัวกรองขั้นสูง
          <svg className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Game Filter */}
            <div>
              <label className="block text-sm font-medium text-textLight mb-2">เกม</label>
              <select
                value={filters.game}
                onChange={(e) => updateFilter('game', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-textLight focus:outline-none focus:border-accent"
              >
                <option value="">ทุกเกม</option>
                {filterOptions.games.map(game => (
                  <option key={game} value={game}>{gameNames[game] || game}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-textLight mb-2">หมวดหมู่</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-textLight focus:outline-none focus:border-accent"
              >
                <option value="">ทุกหมวดหมู่</option>
                {filterOptions.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Author Filter */}
            <div>
              <label className="block text-sm font-medium text-textLight mb-2">ผู้เขียน</label>
              <input
                type="text"
                placeholder="ค้นหาผู้เขียน..."
                value={filters.author}
                onChange={(e) => updateFilter('author', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-textLight placeholder-gray-400 focus:outline-none focus:border-accent"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-textLight mb-2">ตั้งแต่วันที่</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => updateFilter('startDate', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-textLight focus:outline-none focus:border-accent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-textLight mb-2">ถึงวันที่</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => updateFilter('endDate', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-textLight focus:outline-none focus:border-accent"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-textLight mb-2">เรียงตาม</label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-textLight focus:outline-none focus:border-accent text-sm"
                >
                  <option value="created_at">วันที่สร้าง</option>
                  <option value="title">ชื่อเรื่อง</option>
                  <option value="author_name">ผู้เขียน</option>
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => updateFilter('sortOrder', e.target.value)}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-textLight focus:outline-none focus:border-accent text-sm"
                >
                  <option value="desc">ใหม่ที่สุด</option>
                  <option value="asc">เก่าที่สุด</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-textLight rounded-lg transition-colors"
            >
              รีเซ็ตตัวกรอง
            </button>
          </div>
        </div>
      )}

      {/* Search Button */}
      <div className="mb-6">
        <button
          onClick={performSearch}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-accent to-secondary hover:from-accent-light hover:to-secondary-light text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              กำลังค้นหา...
            </div>
          ) : (
            'ค้นหา'
          )}
        </button>
      </div>

      {/* Results Summary */}
      {results && (
        <div className="mb-4">
          <p className="text-textLight/80 text-sm">
            พบ {results.totalCount} โพสต์
            {filters.query && <span> สำหรับ "{filters.query}"</span>}
            {filters.game && <span> ในเกม {gameNames[filters.game] || filters.game}</span>}
          </p>
        </div>
      )}

      {/* Results */}
      {results && results.posts.length > 0 && (
        <div className="space-y-4">
          {results.posts.map((post) => (
            <div key={post.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-textLight hover:text-accent transition-colors">
                  <a href={`/${post.game}/posts/${post.slug}`} className="block">
                    {post.title}
                  </a>
                </h3>
                <span className="text-xs text-textLight/60 bg-gray-700/50 px-2 py-1 rounded">
                  {gameNames[post.game] || post.game}
                </span>
              </div>
              <p className="text-textLight/70 text-sm mb-2 line-clamp-2">
                {post.content?.substring(0, 150)}...
              </p>
              <div className="flex items-center justify-between text-xs text-textLight/60">
                <span>โดย {post.author_name}</span>
                <span>{new Date(post.created_at).toLocaleDateString('th-TH')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {results && results.posts.length === 0 && (
        <div className="text-center py-8 text-textLight/60">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-base">ไม่พบโพสต์ที่ตรงกับการค้นหา</p>
          <p className="text-sm mt-1">ลองปรับเปลี่ยนคำค้นหาหรือตัวกรอง</p>
        </div>
      )}
    </div>
  );
}