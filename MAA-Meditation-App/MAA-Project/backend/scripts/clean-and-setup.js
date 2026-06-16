/**
 * Clean Database and Setup Helper
 */
const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL in environment variables.');
  process.exit(1);
}

async function run() {
  console.log('🔄 Connecting to PostgreSQL to clean database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase connections from external networks
  });

  try {
    await client.connect();
    console.log('✅ Connected to database.');

    console.log('🧹 Wiping schema public (cleaning database)...');
    await client.query('DROP SCHEMA public CASCADE;');
    await client.query('CREATE SCHEMA public;');
    await client.query('GRANT ALL ON SCHEMA public TO postgres;');
    await client.query('GRANT ALL ON SCHEMA public TO public;');
    await client.query('GRANT ALL ON SCHEMA public TO anon;');
    await client.query('GRANT ALL ON SCHEMA public TO authenticated;');
    await client.query('GRANT ALL ON SCHEMA public TO service_role;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;');
    console.log('✅ Database cleaned successfully and privileges granted.');

    console.log('🛠️ Creating exec_sql helper function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log('✅ exec_sql function created successfully.');

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
