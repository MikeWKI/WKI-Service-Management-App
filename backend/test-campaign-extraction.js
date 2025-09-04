// Test the new campaign extraction with your example data
const exampleText = `
Campaign Completion Close rate National Goal
Wichita Kenworth
24KWL Bendix EC80 ABS ECU Incorrect Signal Processing 59% 56% 100%
25KWB T180/T280/T380/T480 Exterior LightingProgramming 100% 57% 100%
E311 PACCAR EPA17 MX-13 Prognostic Repair-Camshaft 25% 46% 100%
E316 PACCAR MX-13 EPA21 Main Bearing Cap Bolts 84% 75% 100%
E327 PACCAR MX-11 AND MX-13 OBD Software Update 52% 60% 100%
Dodge City Kenworth
24KWL Bendix EC80 ABS ECU Incorrect Signal Processing 71% 56% 100%
E311 PACCAR EPA17 MX-13 Prognostic Repair-Camshaft 100% 46% 100%
E316 PACCAR MX-13 EPA21 Main Bearing Cap Bolts 93% 75% 100%
E327 PACCAR MX-11 AND MX-13 OBD Software Update 40% 60% 100%
Liberal Kenworth
24KWL Bendix EC80 ABS ECU Incorrect Signal Processing 39% 56% 100%
E311 PACCAR EPA17 MX-13 Prognostic Repair-Camshaft 0% 46% 100%
E316 PACCAR MX-13 EPA21 Main Bearing Cap Bolts 83% 75% 100%
E327 PACCAR MX-11 AND MX-13 OBD Software Update 50% 60% 100%
`;

function extractCampaignLine(line) {
  const percentagePattern = /(\d+)%\s*(\d+)%\s*(\d+)%/;
  const match = line.match(percentagePattern);
  
  if (!match) return null;
  
  const [, closeRate, nationalRate, goal] = match;
  
  const campaignName = line.replace(percentagePattern, '').trim();
  
  const cleanCampaignName = campaignName
    .replace(/^(24KWL|25KWB|E\d+)\s*/, '')
    .trim();
  
  return {
    campaignName: cleanCampaignName || campaignName,
    closeRate: `${closeRate}%`,
    nationalRate: `${nationalRate}%`,
    goal: `${goal}%`
  };
}

function testCampaignExtraction() {
  console.log('=== TESTING CAMPAIGN EXTRACTION WITH EXAMPLE DATA ===');
  
  const lines = exampleText.split('\n').map(l => l.trim()).filter(Boolean);
  const locations = ['Wichita Kenworth', 'Dodge City Kenworth', 'Liberal Kenworth'];
  
  let currentLocation = null;
  const campaignData = { locations: {}, campaigns: {} };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line is a location header
    const foundLocation = locations.find(loc => line.includes(loc));
    if (foundLocation) {
      currentLocation = foundLocation;
      campaignData.locations[currentLocation] = {};
      console.log(`\nProcessing campaigns for: ${currentLocation}`);
      continue;
    }
    
    // If we have a current location and this line contains campaign data
    if (currentLocation && line.includes('%')) {
      const campaignMatch = extractCampaignLine(line);
      if (campaignMatch) {
        const { campaignName, closeRate, nationalRate, goal } = campaignMatch;
        
        campaignData.locations[currentLocation][campaignName] = {
          closeRate: closeRate,
          nationalRate: nationalRate,
          goal: goal
        };
        
        console.log(`  ${campaignName}: Close ${closeRate}, National ${nationalRate}, Goal ${goal}`);
      }
    }
  }
  
  console.log('\n=== FINAL EXTRACTED DATA ===');
  console.log(JSON.stringify(campaignData, null, 2));
}

testCampaignExtraction();
