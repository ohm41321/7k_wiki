import { Metadata } from 'next';
import AdvancedSearch from '@/app/components/AdvancedSearch';

export const metadata: Metadata = {
  title: 'ค้นหาโพสต์ - Fonzu Wiki',
  description: 'ค้นหาเนื้อหาเกม ไกด์ และข่าวสารจาก Fonzu Wiki สารานุกรมเกมกาชา',
  keywords: 'ค้นหาเกม, ไกด์เกม, ข่าวสารเกม, Fonzu Wiki, gacha game wiki',
  openGraph: {
    title: 'ค้นหาโพสต์ - Fonzu Wiki',
    description: 'ค้นหาเนื้อหาเกม ไกด์ และข่าวสารจาก Fonzu Wiki',
    type: 'website',
  },
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <AdvancedSearch />
        </div>
      </div>
    </div>
  );
}