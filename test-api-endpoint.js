// Test script to check if API endpoint returns posts correctly
require('dotenv').config({ path: '.env.local' });

async function testAPIEndpoint() {
  try {
    console.log('Testing API endpoint /api/posts...');

    const response = await fetch('http://localhost:3000/api/posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`API returned ${response.status}: ${response.statusText}`);
      return;
    }

    const posts = await response.json();
    console.log(`API returned ${posts.length} posts`);

    // Filter for MonsterHunterWilds posts
    const monsterHunterPosts = posts.filter(post => post.game === 'MonsterHunterWilds');
    console.log(`MonsterHunterWilds posts from API: ${monsterHunterPosts.length}`);

    monsterHunterPosts.forEach(post => {
      console.log(`- ${post.title} (ID: ${post.id})`);
    });

    // Also check if there are any posts with undefined/null game that might be MH Wilds
    const undefinedGamePosts = posts.filter(post => !post.game);
    console.log(`Posts with undefined/null game: ${undefinedGamePosts.length}`);

    if (monsterHunterPosts.length === 0) {
      console.log('\n❌ No MonsterHunterWilds posts returned from API');
      console.log('This explains why the webpage shows no posts');
    } else {
      console.log('\n✅ MonsterHunterWilds posts are returned from API');
      console.log('Issue might be with real-time subscriptions or client-side filtering');
    }

  } catch (error) {
    console.error('Error testing API endpoint:', error.message);
  }
}

testAPIEndpoint();