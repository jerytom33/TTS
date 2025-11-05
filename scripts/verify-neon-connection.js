#!/usr/bin/env node

/**
 * Neon Database Connection Verification
 * Tests the connection and displays database information
 */

require('dotenv').config();

async function verifyNeonConnection() {
  console.log('🔍 Verifying Neon Database Connection...');
  console.log('========================================');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      log: ['info', 'warn', 'error'],
    });

    console.log('📡 Testing database connection...');
    
    // Test basic connection
    const result = await prisma.$queryRaw`
      SELECT 
        NOW() as current_time,
        VERSION() as database_version,
        current_database() as database_name,
        current_user as database_user
    `;
    
    console.log('✅ Database connection successful!');
    console.log(`   Time: ${result[0].current_time}`);
    console.log(`   Database: ${result[0].database_name}`);
    console.log(`   User: ${result[0].database_user}`);
    console.log(`   Version: ${result[0].database_version.split(' ')[0]}`);
    
    // Get database statistics
    console.log('\n📊 Database Statistics:');
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const voiceCount = await prisma.voice.count();
    const translationCount = await prisma.translation.count();
    const videoCount = await prisma.generatedVideo.count();
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Projects: ${projectCount}`);
    console.log(`   Voices: ${voiceCount}`);
    console.log(`   Translations: ${translationCount}`);
    console.log(`   Generated Videos: ${videoCount}`);
    
    // Test a sample query
    console.log('\n🎯 Testing sample queries...');
    const sampleUser = await prisma.user.findFirst({
      select: {
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    if (sampleUser) {
      console.log(`   Sample User: ${sampleUser.email} (${sampleUser.role})`);
      console.log(`   Created: ${sampleUser.createdAt.toISOString()}`);
    }
    
    // Connection details from environment
    const dbUrl = new URL(process.env.DATABASE_URL);
    console.log('\n🔗 Connection Details:');
    console.log(`   Host: ${dbUrl.hostname}`);
    console.log(`   Port: ${dbUrl.port || '5432'}`);
    console.log(`   Database: ${dbUrl.pathname.slice(1)}`);
    console.log(`   SSL Mode: ${dbUrl.searchParams.get('sslmode')}`);
    console.log(`   Channel Binding: ${dbUrl.searchParams.get('channel_binding')}`);
    
    await prisma.$disconnect();
    console.log('\n🎉 Neon database verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    
    if (error.code === 'P1001') {
      console.error('   → Connection timeout. Check your network connection.');
    } else if (error.code === 'P1000') {
      console.error('   → Authentication failed. Check your credentials.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('   → DNS resolution failed. Check your database hostname.');
    }
    
    process.exit(1);
  }
}

verifyNeonConnection();