const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAnnouncements() {
  try {
    console.log('Testing announcements API...');

    // Test GET request
    const response = await fetch(`${supabaseUrl.replace('/rest/v1', '')}/api/announcements?limit=20`);
    console.log('API Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Announcements found:', data.announcements?.length || 0);

      if (data.announcements && data.announcements.length > 0) {
        console.log('\nAnnouncement details:');
        data.announcements.forEach((announcement, index) => {
          console.log(`${index + 1}. ${announcement.title}`);
          console.log(`   - Priority: ${announcement.priority}`);
          console.log(`   - Type: ${announcement.type}`);
          console.log(`   - Published: ${announcement.published}`);
          console.log(`   - Active: ${announcement.active}`);
          console.log(`   - Published at: ${announcement.published_at}`);
          console.log(`   - Expires at: ${announcement.expires_at}`);
          console.log('');
        });

        // Check if any have priority >= 3
        const highPriority = data.announcements.filter(a => a.priority >= 3);
        console.log(`High priority announcements (>= 3): ${highPriority.length}`);

        if (highPriority.length === 0) {
          console.log('\n⚠️  No announcements have priority >= 3');
          console.log('The AnnouncementModal only shows announcements with priority >= 3');
          console.log('You need to either:');
          console.log('1. Update existing announcements to have priority >= 3');
          console.log('2. Or lower the maxPriority in AnnouncementModal component');
        }
      } else {
        console.log('No announcements found in database');
        console.log('You need to create some announcements first');
      }
    } else {
      console.error('API request failed');
    }

  } catch (error) {
    console.error('Error testing announcements:', error);
  }
}

testAnnouncements();