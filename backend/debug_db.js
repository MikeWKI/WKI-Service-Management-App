const mongoose = require('mongoose');
const LocationMetric = require('./src/models/LocationMetric');

// Debug script to check what's in the database
async function debugDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mwill12345:Stinker68!@wkiservicemanagementapp.gykn5.mongodb.net/wki-service-management?retryWrites=true&w=majority&appName=WKIServiceManagementApp');
    
    console.log('Connected to MongoDB');
    
    // Get all records
    const allRecords = await LocationMetric.find().lean();
    console.log(`\nTotal records in database: ${allRecords.length}`);
    
    // Show structure of each record
    allRecords.forEach((record, index) => {
      console.log(`\n=== Record ${index + 1} ===`);
      console.log('ID:', record._id);
      console.log('Metrics structure:', {
        month: record.metrics?.month,
        year: record.metrics?.year,
        fileName: record.metrics?.fileName,
        locationsCount: record.metrics?.locations?.length,
        dealershipData: !!record.metrics?.dealership
      });
      
      if (record.metrics?.locations) {
        console.log('Locations:');
        record.metrics.locations.forEach(loc => {
          console.log(`  - ${loc.name} (${loc.locationId})`);
        });
      }
    });
    
    // Test specific queries
    console.log('\n=== Testing Queries ===');
    
    // Test month query
    const julyRecord = await LocationMetric.findOne({
      'metrics.month': 'July',
      'metrics.year': 2025
    });
    console.log('July 2025 record found:', !!julyRecord);
    
    // Test sorting
    const sorted = await LocationMetric.find()
      .sort({ 'metrics.year': -1, 'metrics.month': -1 })
      .limit(1);
    console.log('Latest record:', sorted[0]?.metrics?.month, sorted[0]?.metrics?.year);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugDatabase();
