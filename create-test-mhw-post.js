// Script to create a proper test post for MonsterHunterWilds
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestPost() {
  try {
    console.log('Creating a proper test post for MonsterHunterWilds...');

    const testPost = {
      title: 'Monster Hunter Wilds - คู่มือเริ่มต้นสำหรับมือใหม่',
      content: `# Monster Hunter Wilds - คู่มือเริ่มต้นสำหรับมือใหม่

สวัสดี Hunters ทุกคน! Monster Hunter Wilds กำลังจะมาถึงแล้ว และนี่คือคู่มือเริ่มต้นที่จะช่วยให้คุณพร้อมสำหรับการผจญภัยครั้งใหม่

## สิ่งที่ควรรู้ก่อนเริ่มเล่น

### อาวุธใหม่และระบบการต่อสู้
- ระบบการต่อสู้ที่พัฒนาขึ้น
- อาวุธใหม่ที่จะเพิ่มเข้ามา
- การปรับสมดุลของมอนสเตอร์

### โลกเปิดกว้าง
- สำรวจแผนที่ขนาดใหญ่
- สภาพอากาศแบบไดนามิก
- การเปลี่ยนแปลงของสิ่งแวดล้อม

### กราฟิกและประสิทธิภาพ
- กราฟิกที่สวยงามขึ้น
- การปรับปรุงประสิทธิภาพ
- รองรับหลายแพลตฟอร์ม

## เคล็ดลับสำหรับมือใหม่

1. **เลือกอาวุธที่ใช่** - ลองเล่นทุกอาวุธเพื่อหาสไตล์ที่ชอบ
2. **ศึกษามอนสเตอร์** - แต่ละมอนสเตอร์มีพฤติกรรมที่แตกต่างกัน
3. **เตรียมพร้อมเสมอ** - พกไอเทมที่จำเป็นติดตัวไปด้วย
4. **เล่นกับเพื่อน** - การล่ากับเพื่อนสนุกกว่าเยอะ!

เตรียมตัวให้พร้อม แล้วไปล่ามอนสเตอร์ด้วยกันนะครับ! 🏹⚔️`,
      tags: ['guide', 'beginner', 'tips', 'monster-hunter-wilds'],
      category: 'Guide',
      game: 'MonsterHunterWilds',
      author_name: 'Test Author',
      slug: `monster-hunter-wilds-beginner-guide-${Date.now()}`,
      imageurls: []
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(testPost)
      .select()
      .single();

    if (error) {
      console.error('Error creating test post:', error);
      return;
    }

    console.log('✅ Test post created successfully!');
    console.log(`Title: ${data.title}`);
    console.log(`Game: ${data.game}`);
    console.log(`Category: ${data.category}`);
    console.log(`Tags: ${data.tags.join(', ')}`);
    console.log(`Slug: ${data.slug}`);

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createTestPost();