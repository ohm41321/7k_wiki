// Test script to check current posts in database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPosts() {
  try {
    console.log('Fetching all posts...');
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*');

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }

    console.log(`Found ${posts.length} posts:`);
    posts.forEach(post => {
      console.log(`- ${post.title} (game: ${post.game}, slug: ${post.slug})`);
    });

    // Check unique game values
    const games = [...new Set(posts.map(p => p.game).filter(Boolean))];
    console.log('\nUnique game values:', games);

    // Check if MonsterHunterWilds exists
    const monsterHunterPosts = posts.filter(p => p.game === 'MonsterHunterWilds');
    console.log(`\nMonsterHunterWilds posts: ${monsterHunterPosts.length}`);
    monsterHunterPosts.forEach(post => {
      console.log(`- ${post.title} (ID: ${post.id}, slug: ${post.slug})`);
      console.log(`  Content length: ${post.content ? post.content.length : 0}`);
      console.log(`  Category: ${post.category || 'none'}`);
      console.log(`  Tags: ${post.tags ? post.tags.join(', ') : 'none'}`);
      console.log(`  Image URLs: ${post.imageurls ? post.imageurls.length : 0}`);
      console.log(`  Author: ${post.author_name}`);
      console.log(`  Created: ${post.created_at}`);
    });

    // Also check for undefined game posts that might be MH Wilds
    const undefinedGamePosts = posts.filter(p => p.game === undefined || p.game === null);
    console.log(`\nPosts with undefined/null game: ${undefinedGamePosts.length}`);
    undefinedGamePosts.forEach(post => {
      if (post.title.toLowerCase().includes('mh') || post.title.toLowerCase().includes('monster hunter')) {
        console.log(`- ${post.title} (might be MH Wilds)`);
      }
    });

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkPosts();