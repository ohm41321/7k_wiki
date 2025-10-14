const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createMoreAnnouncements() {
  try {
    console.log('Creating more test announcements...');

    const announcements = [
      {
        title: '🎮 อัพเดทเกมใหม่ประจำสัปดาห์',
        content: 'สัปดาห์นี้มีเกมใหม่น่าสนใจมากมายที่กำลังจะเปิดให้บริการ รวมถึงการอัพเดทเนื้อหาใหม่ของเกมยอดนิยม',
        type: 'info',
        priority: 3,
        published: true,
        published_at: new Date().toISOString(),
        active: true,
        action_text: 'ดูรายละเอียด'
      },
      {
        title: '⚠️ แจ้งเตือนการปรับปรุงเซิร์ฟเวอร์',
        content: 'เราจะทำการปรับปรุงเซิร์ฟเวอร์ในวันที่ 15 ตุลาคม 2567 เวลา 02:00-06:00 น. โดยจะไม่สามารถเข้าใช้งานได้ชั่วคราว',
        type: 'warning',
        priority: 4,
        published: true,
        published_at: new Date().toISOString(),
        active: true,
        action_text: 'ดูรายละเอียดการปรับปรุง'
      },
      {
        title: '🌟 กิจกรรมพิเศษ: ล็อกอินรับไอเทมฟรี!',
        content: 'ล็อกอินทุกวันรับไอเทมฟรี! กิจกรรมพิเศษสำหรับสมาชิกทุกท่าน ตั้งแต่วันนี้จนถึงสิ้นเดือนตุลาคม',
        type: 'success',
        priority: 2,
        published: true,
        published_at: new Date().toISOString(),
        active: true,
        action_text: 'เข้าร่วมกิจกรรม'
      }
    ];

    for (const announcement of announcements) {
      const { data, error } = await supabase
        .from('announcements')
        .insert(announcement)
        .select()
        .single();

      if (error) {
        console.error('Error creating announcement:', error);
      } else {
        console.log('✅ Created:', data.title);
      }
    }

    console.log('\n🎉 All test announcements created successfully!');
    console.log('🔄 Please refresh your browser to see all announcements!');

  } catch (error) {
    console.error('Failed to create announcements:', error);
  }
}

createMoreAnnouncements();