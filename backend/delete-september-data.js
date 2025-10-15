// Delete September 2025 data from database so it can be re-uploaded with fixed extraction
// Run this with: node delete-september-data.js

require('dotenv').config();
const mongoose = require('mongoose');
const LocationMetric = require('./src/models/LocationMetric');

async function deleteSeptemberData() {
  try {
    console.log('🗑️  Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/service-management';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to MongoDB\n');
    
    // Find September 2025 record
    const septemberRecord = await LocationMetric.findOne({
      'metrics.month': 'September',
      'metrics.year': 2025
    });
    
    if (!septemberRecord) {
      console.log('❌ No September 2025 data found in database');
      console.log('   You can proceed to upload the September PDF');
      await mongoose.disconnect();
      return;
    }
    
    console.log('📋 Found September 2025 record:');
    console.log(`   ID: ${septemberRecord._id}`);
    console.log(`   File: ${septemberRecord.metrics.fileName}`);
    console.log(`   Uploaded: ${septemberRecord.metrics.uploadedAt}`);
    console.log(`   Locations: ${septemberRecord.metrics.locations?.length || 0}`);
    
    // Show current (incorrect) Wichita data
    const wichita = septemberRecord.metrics.locations?.find(loc => loc.name === 'Wichita Kenworth');
    if (wichita) {
      console.log('\n❌ Current (INCORRECT) Wichita data:');
      console.log(`   VSC Case Requirements: ${wichita.vscCaseRequirements}`);
      console.log(`   VSC Closed Correctly: ${wichita.vscClosedCorrectly}`);
      console.log(`   TT+ Activation: ${wichita.ttActivation}`);
      console.log(`   SM Monthly Dwell: ${wichita.smMonthlyDwellAvg}`);
      console.log(`   SM YTD Dwell: ${wichita.smYtdDwellAvgDays}`);
      console.log(`   Triage %: ${wichita.triagePercentLess4Hours}`);
      console.log(`   Triage Hours: ${wichita.triageHours}`);
      console.log(`   ETR %: ${wichita.etrPercentCases}`);
      console.log(`   % 3+ Notes: ${wichita.percentCasesWith3Notes}`);
      console.log(`   RDS Monthly: ${wichita.rdsMonthlyAvgDays}`);
      console.log(`   RDS YTD: ${wichita.rdsYtdDwellAvgDays}`);
    }
    
    console.log('\n⚠️  DELETING September 2025 record...');
    await LocationMetric.deleteOne({ _id: septemberRecord._id });
    
    console.log('✅ September 2025 data deleted successfully!\n');
    console.log('📤 Next steps:');
    console.log('   1. Go to your WKI Service Management App');
    console.log('   2. Upload the "W370 Service Scorecard September 2025.pdf" again');
    console.log('   3. The new extraction logic will process it correctly');
    console.log('   4. Verify Wichita metrics show correct values\n');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

deleteSeptemberData();
