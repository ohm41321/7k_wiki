-- Create announcements table for feature updates and notifications
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, success, error
  version TEXT, -- Version this announcement is for
  priority INTEGER DEFAULT 1, -- 1 = low, 2 = medium, 3 = high, 4 = critical
  active BOOLEAN DEFAULT true,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  target_audience TEXT DEFAULT 'all', -- all, logged_in, admins, specific_game
  game TEXT, -- Specific game this announcement is for (optional)
  image_url TEXT,
  action_url TEXT, -- URL to redirect when user clicks action button
  action_text TEXT DEFAULT 'ดูเพิ่มเติม', -- Text for action button
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(active);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(published);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON public.announcements(priority DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON public.announcements(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (for published announcements)
CREATE POLICY "Anyone can view published announcements" ON public.announcements
  FOR SELECT USING (published = true AND active = true);

-- Create policy for authenticated users to manage announcements (admin only in production)
CREATE POLICY "Authenticated users can manage announcements" ON public.announcements
  FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_announcements_updated_at_trigger
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION update_announcements_updated_at();

-- Insert some sample announcements for testing
INSERT INTO public.announcements (title, content, type, version, priority, published, published_at) VALUES
(
  '🎉 ยินดีต้อนรับสู่ Fonzu Wiki!',
  'เว็บสารานุกรมเกมกาชาของเราเปิดให้บริการแล้ว พร้อมข้อมูล ไกด์ และข่าวสารเกมต่างๆ มากมาย',
  'info',
  '1.0.0',
  4,
  true,
  now()
),
(
  '🔍 ระบบค้นหาขั้นสูงพร้อมใช้งานแล้ว',
  'คุณสามารถค้นหาโพสต์ตามเกม แท็ก ผู้เขียน และวันที่ได้แล้วที่หน้า /search',
  'success',
  '1.1.0',
  3,
  true,
  now()
),
(
  '📱 PWA พร้อมให้ติดตั้งแล้ว',
  'ติดตั้งเว็บเป็นแอปบนมือถือได้แล้ว พร้อมรับการแจ้งเตือนข่าวสารเกม',
  'success',
  '1.2.0',
  3,
  true,
  now()
);