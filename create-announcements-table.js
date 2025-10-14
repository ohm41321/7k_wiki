const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAnnouncementsTable() {
  try {
    console.log('Creating announcements table...');

    // Read the SQL file
    const sql = fs.readFileSync('create_announcements_table.sql', 'utf8');

    // Split the SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec', { query: statement.trim() + ';' });

        if (error) {
          console.error('Error executing statement:', statement.trim().substring(0, 50) + '...');
          console.error('Error details:', error);
        } else {
          console.log('✓ Statement executed successfully');
        }
      }
    }

    console.log('Announcements table creation completed!');
  } catch (err) {
    console.error('Failed to create table:', err);
  }
}

createAnnouncementsTable();