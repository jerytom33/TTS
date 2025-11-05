#!/usr/bin/env node

/**
 * Neon Database Initialization Script
 * Initializes PostgreSQL database with proper schema and seed data
 */

// Load environment variables from .env file
require('dotenv').config();

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class NeonDatabaseInitializer {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logMessage);
  }

  async checkEnvironment() {
    this.log('🔍 Checking environment configuration...');
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'DIRECT_DATABASE_URL'
    ];

    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      this.log(`❌ Missing environment variables: ${missing.join(', ')}`, 'error');
      this.log('Please ensure your .env file contains the Neon database URLs', 'error');
      process.exit(1);
    }

    this.log('✅ Environment configuration is valid');
  }

  async testConnection() {
    try {
      this.log('🔗 Testing Neon database connection...');
      
      // Test connection using Prisma client directly
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as version`;
      await prisma.$disconnect();
      
      this.log(`✅ Connected to Neon PostgreSQL database successfully`);
      this.log(`   Database time: ${result[0].current_time}`);
      
    } catch (error) {
      this.log(`❌ Database connection failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async generatePrismaClient() {
    try {
      this.log('📦 Generating Prisma client for PostgreSQL...');
      execSync('npx prisma generate', { 
        stdio: 'inherit', 
        cwd: this.projectRoot 
      });
      this.log('✅ Prisma client generated successfully');
    } catch (error) {
      this.log(`❌ Failed to generate Prisma client: ${error.message}`, 'error');
      throw error;
    }
  }

  async runMigrations() {
    try {
      this.log('🔄 Running database migrations...');
      execSync('npx prisma db push', { 
        stdio: 'inherit', 
        cwd: this.projectRoot 
      });
      this.log('✅ Database migrations completed');
    } catch (error) {
      this.log(`❌ Migration failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async seedDatabase() {
    try {
      this.log('🌱 Seeding database with initial data...');
      execSync('npx tsx prisma/seed.ts', { 
        stdio: 'inherit', 
        cwd: this.projectRoot 
      });
      this.log('✅ Database seeded successfully');
    } catch (error) {
      this.log(`❌ Database seeding failed: ${error.message}`, 'error');
      // Don't throw error for seeding - it might already be seeded
      this.log('⚠️ Continuing with initialization...', 'warning');
    }
  }

  async verifySetup() {
    try {
      this.log('🔍 Verifying database setup...');
      
      // Test basic queries
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const userCount = await prisma.user.count();
      const voiceCount = await prisma.voice.count();
      const translationCount = await prisma.translation.count();
      
      this.log(`✅ Database verification complete:`);
      this.log(`   - Users: ${userCount}`);
      this.log(`   - Voices: ${voiceCount}`);
      this.log(`   - Translations: ${translationCount}`);
      
      await prisma.$disconnect();
      
    } catch (error) {
      this.log(`❌ Database verification failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async initializeDatabase() {
    this.log('🚀 Starting Neon Database Initialization');
    this.log('==========================================');

    try {
      await this.checkEnvironment();
      await this.testConnection();
      await this.generatePrismaClient();
      await this.runMigrations();
      await this.seedDatabase();
      await this.verifySetup();

      this.log('🎉 Neon database initialization completed successfully!');
      this.log('Your VoiceVideo AI platform is ready to use.');
      
    } catch (error) {
      this.log(`💥 Initialization failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async resetDatabase() {
    this.log('🔄 Resetting Neon database...');
    
    try {
      execSync('npx prisma migrate reset --force', { 
        stdio: 'inherit', 
        cwd: this.projectRoot 
      });
      this.log('✅ Database reset completed');
    } catch (error) {
      this.log(`❌ Database reset failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async createBackup() {
    try {
      this.log('💾 Creating database backup...');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `backup-${timestamp}.sql`;
      
      // Note: This requires pg_dump to be installed
      const dbUrl = process.env.DIRECT_DATABASE_URL;
      execSync(`pg_dump "${dbUrl}" > ${backupFile}`, { 
        stdio: 'inherit', 
        cwd: this.projectRoot 
      });
      
      this.log(`✅ Backup created: ${backupFile}`);
    } catch (error) {
      this.log(`⚠️ Backup failed: ${error.message}`, 'warning');
      this.log('pg_dump not available - install PostgreSQL client tools for backups');
    }
  }
}

// Command line interface
if (require.main === module) {
  const initializer = new NeonDatabaseInitializer();
  const command = process.argv[2];

  switch (command) {
    case 'reset':
      initializer.resetDatabase().catch(console.error);
      break;
    case 'backup':
      initializer.createBackup().catch(console.error);
      break;
    case 'verify':
      initializer.verifySetup().catch(console.error);
      break;
    case 'test':
      initializer.testConnection().catch(console.error);
      break;
    default:
      initializer.initializeDatabase().catch(console.error);
  }
}

module.exports = NeonDatabaseInitializer;