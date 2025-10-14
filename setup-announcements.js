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

async function setupAnnouncementsTable() {
  try {
    console.log('Setting up announcements table...');

    // Read and execute the SQL file
    const sql = fs.readFileSync('create_announcements_table.sql', 'utf8');

    // For Supabase, we need to use direct SQL execution
    // Let's try using the REST API to execute raw SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ sql })
    });

    if (response.ok) {
      console.log('✓ Announcements table created successfully!');
    } else {
      const error = await response.text();
      console.error('Error creating table:', error);

      // If the RPC function doesn't exist, let's try creating it first
      console.log('Trying to create the exec_sql function...');
      await createExecSqlFunction();
      console.log('Please run this script again to create the table.');
    }

  } catch (err) {
    console.error('Failed to setup table:', err);
  }
}

async function createExecSqlFunction() {
  try {
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ sql: createFunctionSQL })
    });

    if (response.ok) {
      console.log('✓ exec_sql function created successfully!');
    } else {
      console.error('Could not create exec_sql function. You may need to run the SQL manually in the Supabase dashboard.');
      console.log('\nPlease copy and paste this SQL into your Supabase SQL editor:');
      console.log('----------------------------------------');
      const sql = fs.readFileSync('create_announcements_table.sql', 'utf8');
      console.log(sql);
    }
  } catch (err) {
    console.error('Error creating function:', err);
  }
}

setupAnnouncementsTable();