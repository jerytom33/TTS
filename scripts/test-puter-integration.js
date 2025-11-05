#!/usr/bin/env node

/**
 * Puter.js Integration Test Suite
 * Tests all implemented Puter.js features and fallback mechanisms
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class PuterIntegrationTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    this.testResults.push({ timestamp, type, message });
  }

  async testApiEndpoint(endpoint, data = {}) {
    try {
      this.log(`Testing API endpoint: ${endpoint}`);
      const response = await axios.post(`${this.baseUrl}/api${endpoint}`, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      this.log(`✅ ${endpoint} responded with status ${response.status}`, 'success');
      return { success: true, data: response.data };
    } catch (error) {
      this.log(`❌ ${endpoint} failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testFallbackData() {
    try {
      this.log('Testing fallback data file...');
      const fallbackPath = path.join(__dirname, '../src/data/fallback-answers.json');
      
      if (!fs.existsSync(fallbackPath)) {
        throw new Error('Fallback data file not found');
      }

      const data = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      
      // Validate structure
      const requiredSections = ['aiResponses', 'resourceTools', 'systemConfig'];
      for (const section of requiredSections) {
        if (!data[section]) {
          throw new Error(`Missing section: ${section}`);
        }
      }

      // Check AI responses
      if (!data.aiResponses.malayalam || !data.aiResponses.english) {
        throw new Error('Missing language sections in AI responses');
      }

      // Check resource tools
      if (!data.resourceTools.ttsVoices || !data.resourceTools.videoTemplates) {
        throw new Error('Missing TTS or video templates');
      }

      this.log('✅ Fallback data structure is valid', 'success');
      return { success: true, data };
    } catch (error) {
      this.log(`❌ Fallback data validation failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testEnhancedTTSAPI() {
    const testCases = [
      {
        text: 'Hello, this is a test of the enhanced TTS system.',
        language: 'en-US',
        voice: 'Joanna'
      },
      {
        text: 'നമസ്കാരം! ഇത് മലയാളം ടെക്സ്റ്റ്-ടു-സ്പീച്ച് പരീക്ഷണമാണ്.',
        language: 'ml-IN',
        voice: 'Raveena'
      },
      {
        text: 'Testing fallback mechanism with invalid parameters',
        language: 'invalid',
        voice: 'nonexistent'
      }
    ];

    for (const testCase of testCases) {
      const result = await this.testApiEndpoint('/tts/generate-enhanced', testCase);
      if (result.success) {
        this.log(`✅ TTS test passed for language: ${testCase.language}`, 'success');
      } else {
        this.log(`⚠️  TTS test handled gracefully for: ${testCase.language}`, 'warning');
      }
    }
  }

  async testHealthCheck() {
    return await this.testApiEndpoint('/health');
  }

  async testComponentFiles() {
    const criticalFiles = [
      '../src/contexts/puter-context.tsx',
      '../src/lib/puter-config.ts',
      '../src/components/puter-demo.tsx',
      '../src/data/fallback-answers.json'
    ];

    for (const file of criticalFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        this.log(`✅ Critical file exists: ${file}`, 'success');
      } else {
        this.log(`❌ Missing critical file: ${file}`, 'error');
      }
    }
  }

  async runFullTestSuite() {
    this.log('🚀 Starting Puter.js Integration Test Suite');
    this.log('================================================');

    // Test 1: Component Files
    this.log('\n📁 Testing Critical Files...');
    await this.testComponentFiles();

    // Test 2: Fallback Data
    this.log('\n📊 Testing Fallback Data...');
    await this.testFallbackData();

    // Test 3: Health Check
    this.log('\n🏥 Testing Health Endpoint...');
    await this.testHealthCheck();

    // Test 4: Enhanced TTS API
    this.log('\n🎵 Testing Enhanced TTS API...');
    await this.testEnhancedTTSAPI();

    // Test 5: Demo Page Accessibility
    this.log('\n🖥️  Testing Demo Page...');
    try {
      const response = await axios.get(`${this.baseUrl}/demo`, { timeout: 5000 });
      if (response.status === 200) {
        this.log('✅ Demo page is accessible', 'success');
      } else {
        this.log(`⚠️  Demo page returned status: ${response.status}`, 'warning');
      }
    } catch (error) {
      this.log(`❌ Demo page failed: ${error.message}`, 'error');
    }

    // Generate Report
    this.generateReport();
  }

  generateReport() {
    this.log('\n📋 Test Suite Summary');
    this.log('===================');

    const successCount = this.testResults.filter(r => r.type === 'success').length;
    const errorCount = this.testResults.filter(r => r.type === 'error').length;
    const warningCount = this.testResults.filter(r => r.type === 'warning').length;

    this.log(`✅ Successful tests: ${successCount}`);
    this.log(`⚠️  Warnings: ${warningCount}`);
    this.log(`❌ Errors: ${errorCount}`);

    const totalTests = successCount + errorCount + warningCount;
    const successRate = totalTests > 0 ? ((successCount / totalTests) * 100).toFixed(1) : 0;
    
    this.log(`📊 Success rate: ${successRate}%`);

    // Save detailed report
    const reportPath = path.join(__dirname, '../test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { successCount, errorCount, warningCount, successRate },
      details: this.testResults
    }, null, 2));

    this.log(`📄 Detailed report saved to: ${reportPath}`);

    if (errorCount === 0) {
      this.log('\n🎉 All critical tests passed! Puter.js integration is ready.', 'success');
    } else {
      this.log('\n⚠️  Some tests failed. Please review the errors above.', 'warning');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new PuterIntegrationTester();
  tester.runFullTestSuite().catch(console.error);
}

module.exports = PuterIntegrationTester;