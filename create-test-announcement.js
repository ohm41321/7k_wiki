const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestAnnouncement() {
  try {
    console.log('Creating test announcement...');

    const testAnnouncement = {
      title: '🎉 ทดสอบการแจ้งเตือน!',
      content: 'นี่คือการทดสอบระบบการแจ้งเตือนของ Fonzu Wiki การแจ้งเตือนนี้จะแสดงขึ้นเมื่อคุณโหลดหน้าเว็บ',
      type: 'success',
      version: '1.0.0',
      priority: 4, // High priority to ensure it shows
      target_audience: 'all',
      published: true,
      published_at: new Date().toISOString(),
      active: true,
      action_text: 'เริ่มใช้งาน'
    };

    const { data, error } = await supabase
      .from('announcements')
      .insert(testAnnouncement)
      .select()
      .single();

    if (error) {
      console.error('Error creating test announcement:', error);
      return;
    }

    console.log('✅ Test announcement created successfully!');
    console.log('ID:', data.id);
    console.log('Title:', data.title);
    console.log('Priority:', data.priority);
    console.log('\n🔄 Please refresh your browser to see the announcement modal!');

  } catch (error) {
    console.error('Failed to create test announcement:', error);
  }
}

createTestAnnouncement();