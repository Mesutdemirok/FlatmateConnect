#!/usr/bin/env tsx

import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

// Enable WebSocket for Neon
neonConfig.webSocketConstructor = ws;

async function testConnection() {
  console.log('========================================');
  console.log('🔍 Database Connection Test');
  console.log('========================================');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not set in environment variables');
    return;
  }
  
  // Mask the password in logs
  const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
  console.log(`📝 Testing connection to: ${maskedUrl}`);
  
  // Parse the connection string
  const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)(\?.*)?/);
  if (!urlParts) {
    console.error('❌ Invalid DATABASE_URL format');
    return;
  }
  
  const [, user, , host, database, params] = urlParts;
  console.log(`👤 User: ${user}`);
  console.log(`🏠 Host: ${host}`);
  console.log(`📦 Database: ${database}`);
  console.log(`⚙️ Params: ${params || 'none'}`);
  
  // Check if using pooler endpoint
  const isPooler = host.includes('-pooler.');
  console.log(`🔌 Connection type: ${isPooler ? 'Pooler' : 'Direct'}`);
  
  // Test 1: Try with the exact DATABASE_URL as-is
  console.log('\n📊 Test 1: Using DATABASE_URL as-is...');
  try {
    const pool1 = new Pool({ connectionString: dbUrl });
    const result1 = await pool1.query('SELECT NOW()');
    console.log('✅ Connection successful!');
    console.log(`⏰ Server time: ${result1.rows[0].now}`);
    await pool1.end();
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
  }
  
  // Test 2: Try without channel_binding if present
  if (dbUrl.includes('channel_binding')) {
    console.log('\n📊 Test 2: Removing channel_binding parameter...');
    const urlWithoutChannelBinding = dbUrl.replace(/[&?]channel_binding=[^&]*/g, '');
    try {
      const pool2 = new Pool({ connectionString: urlWithoutChannelBinding });
      const result2 = await pool2.query('SELECT NOW()');
      console.log('✅ Connection successful without channel_binding!');
      console.log(`⏰ Server time: ${result2.rows[0].now}`);
      await pool2.end();
      
      console.log('\n💡 SOLUTION: Remove channel_binding from DATABASE_URL');
      console.log('Updated URL:', urlWithoutChannelBinding.replace(/:([^@]+)@/, ':****@'));
    } catch (error: any) {
      console.error('❌ Connection still failed:', error.message);
    }
  }
  
  // Test 3: Try switching between pooler and direct connection
  if (isPooler) {
    console.log('\n📊 Test 3: Trying direct connection (without pooler)...');
    const directUrl = dbUrl.replace('-pooler.', '.');
    const maskedDirectUrl = directUrl.replace(/:([^@]+)@/, ':****@');
    console.log(`Testing: ${maskedDirectUrl}`);
    
    try {
      const pool3 = new Pool({ connectionString: directUrl });
      const result3 = await pool3.query('SELECT NOW()');
      console.log('✅ Direct connection successful!');
      console.log(`⏰ Server time: ${result3.rows[0].now}`);
      await pool3.end();
      
      console.log('\n💡 SOLUTION: Use direct connection URL instead of pooler');
      console.log('Updated URL:', maskedDirectUrl);
    } catch (error: any) {
      console.error('❌ Direct connection failed:', error.message);
    }
  } else {
    console.log('\n📊 Test 3: Trying pooler connection...');
    const poolerUrl = dbUrl.replace(/ep-([^.]+)\./, 'ep-$1-pooler.');
    const maskedPoolerUrl = poolerUrl.replace(/:([^@]+)@/, ':****@');
    console.log(`Testing: ${maskedPoolerUrl}`);
    
    try {
      const pool3 = new Pool({ connectionString: poolerUrl });
      const result3 = await pool3.query('SELECT NOW()');
      console.log('✅ Pooler connection successful!');
      console.log(`⏰ Server time: ${result3.rows[0].now}`);
      await pool3.end();
      
      console.log('\n💡 SOLUTION: Use pooler connection URL instead of direct');
      console.log('Updated URL:', maskedPoolerUrl);
    } catch (error: any) {
      console.error('❌ Pooler connection failed:', error.message);
    }
  }
  
  console.log('\n========================================');
  console.log('Test completed');
  console.log('========================================');
}

// Run the test
testConnection().catch(console.error);