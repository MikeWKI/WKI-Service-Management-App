const mongoose = require('mongoose');

// Simple debug script to check database contents
async function debugDatabase() {
  try {
    // Try connecting to local MongoDB first
    console.log('Attempting to connect to MongoDB...');
    
    // Try different connection strings
    const connectionStrings = [
      'mongodb://localhost:27017/service-management',
      'mongodb://127.0.0.1:27017/service-management',
      process.env.MONGO_URI,
      process.env.MONGODB_URI
    ];
    
    let connected = false;
    for (const uri of connectionStrings) {
      if (!uri) continue;
      
      try {
        console.log(`Trying connection: ${uri}`);
        await mongoose.connect(uri, { 
          useNewUrlParser: true, 
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000 // 5 second timeout
        });
        console.log(`✅ Connected successfully to: ${uri}`);
        connected = true;
        break;
      } catch (err) {
        console.log(`❌ Failed to connect to: ${uri}`);
        console.log(`   Error: ${err.message}`);
      }
    }
    
    if (!connected) {
      console.log('\n🚨 NO DATABASE CONNECTION AVAILABLE');
      console.log('This explains why trends are flat - no database means no historical data!');
      console.log('\nOptions:');
      console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
      console.log('2. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
      console.log('3. Use the demo data endpoint to simulate data');
      return;
    }
    
    // Define the schema
    const LocationMetricSchema = new mongoose.Schema({
      metrics: {
        type: Object,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    });
    
    const LocationMetric = mongoose.model('LocationMetric', LocationMetricSchema);
    
    // Get all records
    console.log('\n📊 QUERYING DATABASE...');
    const allRecords = await LocationMetric.find().lean();
    
    console.log(`\n📈 DATABASE DEBUG RESULTS:`);
    console.log(`Total records: ${allRecords.length}`);
    
    if (allRecords.length === 0) {
      console.log('\n🚨 NO DATA FOUND IN DATABASE');
      console.log('This explains the flat trends - no historical data exists!');
      console.log('\nTo fix this, you need to:');
      console.log('1. Upload PDF scorecards using the frontend');
      console.log('2. Or create demo data using: POST /api/location-metrics/demo-data');
      return;
    }
    
    // Analyze the data
    console.log('\n📋 RECORDS FOUND:');
    allRecords.forEach((record, index) => {
      console.log(`\n--- Record ${index + 1} ---`);
      console.log(`Month: ${record.metrics?.month || 'N/A'}`);
      console.log(`Year: ${record.metrics?.year || 'N/A'}`);
      console.log(`File: ${record.metrics?.fileName || 'N/A'}`);
      console.log(`Locations: ${record.metrics?.locations?.length || 0}`);
      
      if (record.metrics?.locations?.[0]) {
        const wichita = record.metrics.locations.find(loc => loc.name === 'Wichita Kenworth');
        if (wichita) {
          console.log(`Wichita VSC Requirements: ${wichita.vscCaseRequirements || 'N/A'}`);
        }
      }
    });
    
    // Check for data variation
    console.log('\n🔍 TREND ANALYSIS:');
    const wichitaValues = [];
    allRecords.forEach(record => {
      const wichita = record.metrics?.locations?.find(loc => loc.name === 'Wichita Kenworth');
      if (wichita?.vscCaseRequirements) {
        wichitaValues.push(wichita.vscCaseRequirements);
      }
    });
    
    console.log(`Wichita VSC Values across months: [${wichitaValues.join(', ')}]`);
    
    const uniqueValues = [...new Set(wichitaValues)];
    if (uniqueValues.length === 1) {
      console.log('🚨 PROBLEM FOUND: All values are identical!');
      console.log('This is why trends show flat lines - no variation over time.');
      console.log('Solution: Upload different PDF scorecards for different months.');
    } else {
      console.log('✅ Values vary - trends should work properly.');
    }
    
    // Check unique months
    const uniqueMonths = [...new Set(allRecords.map(r => `${r.metrics?.month} ${r.metrics?.year}`))];
    console.log(`\nUnique months in database: [${uniqueMonths.join(', ')}]`);
    
    if (uniqueMonths.length < 2) {
      console.log('🚨 INSUFFICIENT DATA: Need at least 2 months for trends.');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Database debug complete');
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.log('\nThis indicates a connection or configuration issue.');
  }
}

debugDatabase();
