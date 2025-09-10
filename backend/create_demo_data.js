// File-based demo data system for testing trends without MongoDB
const fs = require('fs');
const path = require('path');

const DEMO_DATA_DIR = path.join(__dirname, 'demo_data');

// Ensure demo data directory exists
if (!fs.existsSync(DEMO_DATA_DIR)) {
  fs.mkdirSync(DEMO_DATA_DIR);
}

// Generate realistic historical data with trends
function generateDemoData() {
  const months = [
    { name: 'April', year: 2025 },
    { name: 'May', year: 2025 },
    { name: 'June', year: 2025 },
    { name: 'July', year: 2025 }
  ];

  const demoData = [];

  months.forEach((month, index) => {
    // Create trend variations (each month shows improvement)
    const trendFactor = index * 0.02; // 2% improvement per month
    
    const monthData = {
      month: month.name,
      year: month.year,
      fileName: `Demo_${month.name}_${month.year}.pdf`,
      uploadedAt: new Date().toISOString(),
      extractedAt: new Date().toISOString(),
      dealership: {
        vscCaseRequirements: `${(88 + index * 2)}%`, // 88%, 90%, 92%, 94%
        vscClosedCorrectly: `${(85 + index * 2)}%`,
        ttActivation: `${(90 + index * 1)}%`,
        campaignCompletionRates: {} // Simplified for demo
      },
      locations: [
        {
          name: 'Wichita Kenworth',
          locationId: 'wichita',
          vscCaseRequirements: `${94 + index * 1}%`, // Shows upward trend: 94%, 95%, 96%, 97%
          vscClosedCorrectly: `${90 + index * 1}%`,   // 90%, 91%, 92%, 93%
          ttActivation: `${97 + index * 0.5}%`,       // 97%, 97.5%, 98%, 98.5%
          smMonthlyDwellAvg: `${2.9 - index * 0.1}`,  // Improving: 2.9, 2.8, 2.7, 2.6
          smYtdDwellAvgDays: `${2.1 - index * 0.1}`,  // 2.1, 2.0, 1.9, 1.8
          triagePercentLess4Hours: `${85.5 + index * 1.5}%`, // 85.5%, 87%, 88.5%, 90%
          triageHours: `${2.1 - index * 0.1}`,        // Improving: 2.1, 2.0, 1.9, 1.8
          etrPercentCases: `${1.5 - index * 0.1}%`,   // Improving: 1.5%, 1.4%, 1.3%, 1.2%
          percentCasesWith3Notes: `${12.3 - index * 0.8}%`, // 12.3%, 11.5%, 10.7%, 9.9%
          rdsMonthlyAvgDays: `${6.1 - index * 0.2}`,  // 6.1, 5.9, 5.7, 5.5
          rdsYtdDwellAvgDays: `${5.9 - index * 0.2}`  // 5.9, 5.7, 5.5, 5.3
        },
        {
          name: 'Dodge City Kenworth',
          locationId: 'dodge-city',
          vscCaseRequirements: `${65 + index * 1}%`, // 65%, 66%, 67%, 68%
          vscClosedCorrectly: `${81 + index * 1}%`,
          ttActivation: `${83 + index * 1}%`,
          smMonthlyDwellAvg: `${2.0 - index * 0.05}`,
          smYtdDwellAvgDays: `${2.4 - index * 0.1}`,
          triagePercentLess4Hours: `${17.5 + index * 1}%`,
          triageHours: `${4.5 - index * 0.1}`,
          etrPercentCases: `${0.2 - index * 0.05}%`,
          percentCasesWith3Notes: `${1.0 - index * 0.2}%`,
          rdsMonthlyAvgDays: `${6.3 - index * 0.1}`,
          rdsYtdDwellAvgDays: `${5.9 - index * 0.1}`
        },
        {
          name: 'Liberal Kenworth',
          locationId: 'liberal',
          vscCaseRequirements: '100%', // Consistently perfect
          vscClosedCorrectly: '100%',
          ttActivation: '100%',
          smMonthlyDwellAvg: `${2.2 - index * 0.08}`,
          smYtdDwellAvgDays: `${2.8 - index * 0.1}`,
          triagePercentLess4Hours: `${87.1 + index * 1.2}%`,
          triageHours: `${3.3 - index * 0.1}`,
          etrPercentCases: `${0.2 - index * 0.05}%`,
          percentCasesWith3Notes: `${2.8 - index * 0.3}%`,
          rdsMonthlyAvgDays: `${5.8 - index * 0.1}`,
          rdsYtdDwellAvgDays: `${5.9 - index * 0.1}`
        },
        {
          name: 'Emporia Kenworth',
          locationId: 'emporia',
          vscCaseRequirements: 'N/A',
          vscClosedCorrectly: 'N/A',
          ttActivation: 'N/A',
          smMonthlyDwellAvg: `${1.4 - index * 0.05}`,
          smYtdDwellAvgDays: `${1.0 - index * 0.05}`,
          triagePercentLess4Hours: `${36.5 + index * 1.5}%`,
          triageHours: `${9.8 - index * 0.2}`,
          etrPercentCases: `${1.2 - index * 0.1}%`,
          percentCasesWith3Notes: `${16.1 - index * 0.4}%`,
          rdsMonthlyAvgDays: `${3.5 - index * 0.1}`,
          rdsYtdDwellAvgDays: `${4.5 - index * 0.1}`
        }
      ]
    };

    demoData.push(monthData);
    
    // Save individual month file
    const filePath = path.join(DEMO_DATA_DIR, `${month.name}_${month.year}.json`);
    fs.writeFileSync(filePath, JSON.stringify(monthData, null, 2));
  });

  // Save combined data
  const combinedPath = path.join(DEMO_DATA_DIR, 'all_months.json');
  fs.writeFileSync(combinedPath, JSON.stringify(demoData, null, 2));

  console.log('✅ Demo data generated successfully!');
  console.log(`📁 Files created in: ${DEMO_DATA_DIR}`);
  console.log('📊 Data includes realistic trends:');
  console.log('   - Wichita: Improving performance over 4 months');
  console.log('   - Dodge City: Steady improvement');
  console.log('   - Liberal: Perfect VSC scores, other metrics improving');
  console.log('   - Emporia: VSC N/A, other metrics showing progress');
  
  return demoData;
}

// Generate the demo data
const demoData = generateDemoData();

console.log('\n🎯 NEXT STEPS:');
console.log('1. I can modify the backend to use this file-based data');
console.log('2. This will make trends work immediately');
console.log('3. You can see how the trend analysis works');
console.log('4. Later, you can set up MongoDB for production');

console.log('\n📈 SAMPLE TREND DATA:');
demoData.forEach((month, index) => {
  const wichita = month.locations[0];
  console.log(`${month.month}: VSC ${wichita.vscCaseRequirements}, Triage Hours ${wichita.triageHours}`);
});

console.log('\nWould you like me to modify the backend to use this demo data?');
