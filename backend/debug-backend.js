#!/usr/bin/env node

/**
 * Backend Health Check Script
 * Tests if the backend service is responding properly
 */

const https = require('https');

const BACKEND_URL = 'https://wki-service-management-app.onrender.com';

async function testEndpoint(path, description) {
  console.log(`\n🔍 Testing ${description}...`);
  console.log(`   URL: ${BACKEND_URL}${path}`);
  
  return new Promise((resolve) => {
    const req = https.get(`${BACKEND_URL}${path}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   ✅ Status: ${res.statusCode}`);
        console.log(`   🕒 Response time: ${Date.now() - startTime}ms`);
        console.log(`   📄 Response length: ${data.length} bytes`);
        
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            console.log(`   📊 Response: ${JSON.stringify(parsed, null, 2).substring(0, 200)}...`);
          } catch (e) {
            console.log(`   📊 Response: ${data.substring(0, 200)}...`);
          }
        } else {
          console.log(`   ❌ Error response: ${data.substring(0, 200)}`);
        }
        
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          responseTime: Date.now() - startTime,
          responseLength: data.length
        });
      });
    });
    
    const startTime = Date.now();
    
    req.on('error', (error) => {
      console.log(`   ❌ Request failed: ${error.message}`);
      resolve({
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      });
    });
    
    req.setTimeout(10000, () => {
      console.log(`   ⏰ Request timeout after 10 seconds`);
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout',
        responseTime: 10000
      });
    });
  });
}

async function runHealthCheck() {
  console.log(`🏥 Backend Health Check`);
  console.log(`🎯 Target: ${BACKEND_URL}`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  
  const tests = [
    { path: '/health', description: 'Main Health Check' },
    { path: '/live', description: 'Liveness Check' },
    { path: '/ready', description: 'Readiness Check' },
    { path: '/api/health', description: 'Legacy Health Check' },
    { path: '/metrics', description: 'Metrics Endpoint' },
    { path: '/api/locationMetrics/campaigns', description: 'Campaign Metrics' },
    { path: '/api/locationMetrics/debug', description: 'Debug Endpoint' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.path, test.description);
    results.push({ ...test, ...result });
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📋 SUMMARY`);
  console.log(`========================================`);
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`✅ Successful: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);
  
  if (successCount === 0) {
    console.log(`\n🚨 CRITICAL: All endpoints failed!`);
    console.log(`   This indicates the backend service is completely down.`);
    console.log(`   Check Render logs and restart the service.`);
  } else if (successCount < totalCount) {
    console.log(`\n⚠️  WARNING: Some endpoints failed.`);
    console.log(`   The service is partially working but may have issues.`);
  } else {
    console.log(`\n🎉 SUCCESS: All endpoints are working!`);
    console.log(`   The backend service appears to be healthy.`);
  }
  
  console.log(`\n🔧 Next steps:`);
  if (successCount === 0) {
    console.log(`   1. Check Render dashboard for service status`);
    console.log(`   2. Review Render logs for error messages`);
    console.log(`   3. Try restarting the service`);
    console.log(`   4. Check MongoDB connection status`);
  } else {
    console.log(`   1. Review failed endpoints if any`);
    console.log(`   2. Check CORS configuration for frontend`);
    console.log(`   3. Verify database connectivity`);
  }
}

// Run the health check
runHealthCheck().catch(console.error);