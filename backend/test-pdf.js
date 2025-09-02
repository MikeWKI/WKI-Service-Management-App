const fs = require('fs');
const pdfParse = require('pdf-parse');

async function testPDF() {
  try {
    const pdfPath = 'c:\\Users\\michaela\\Downloads\\W370 Service Scorecard July 2025 (1).pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(pdfBuffer);
    
    console.log('=== SEARCHING FOR INDIVIDUAL DEALER METRICS TABLE ===');
    const lines = data.text.split('\n').map(l => l.trim()).filter(Boolean);
    
    let foundTable = false;
    let tableStartIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for table header
      if (line.toLowerCase().includes('individual dealer metrics') || 
          (line.toLowerCase().includes('individual') && line.toLowerCase().includes('dealer'))) {
        console.log(`Found table header at line ${i}: "${line}"`);
        foundTable = true;
        tableStartIndex = i;
        continue;
      }
      
      // If we found the table, look for location rows
      if (foundTable && i > tableStartIndex && i < tableStartIndex + 30) {
        console.log(`Line ${i}: "${line}"`);
        
        // Check for specific locations
        if (line.toLowerCase().includes('wichita')) {
          console.log(`\n*** WICHITA ROW FOUND ***`);
          console.log(`Location line: "${line}"`);
          
          // The values are likely on the next line(s)
          const nextLine = lines[i + 1] || '';
          const nextLine2 = lines[i + 2] || '';
          const nextLine3 = lines[i + 3] || '';
          
          console.log(`Next line: "${nextLine}"`);
          console.log(`Next line 2: "${nextLine2}"`);
          console.log(`Next line 3: "${nextLine3}"`);
          
          // Combine lines to get all values
          const combinedValues = `${nextLine} ${nextLine2} ${nextLine3}`;
          console.log(`Combined: "${combinedValues}"`);
          
          const values = combinedValues.match(/(\d+%|\d+\.\d+|\d+|N\/A)/gi) || [];
          console.log(`Extracted values: [${values.join(', ')}]`);
          console.log(`Value count: ${values.length}`);
          
          if (values.length >= 11) {
            console.log('\n*** CORRECT COLUMN MAPPING FROM PDF ***');
            console.log(`1. VSC Case Requirements: ${values[0]}`);
            console.log(`2. VSC Closed Correctly: ${values[1]}`);
            console.log(`3. TT Activation: ${values[2]}`);
            console.log(`4. SM Monthly Dwell Avg: ${values[3]}`);
            console.log(`5. SM Average Triage Hours: ${values[4]}`);
            console.log(`6. SM % Triage < 4 Hours: ${values[5]}`);
            console.log(`7. ETR % of Cases: ${values[6]}`);
            console.log(`8. % Cases with 3+ Notes: ${values[7]}`);
            console.log(`9. RDS Monthly Avg Days: ${values[8]}`);
            console.log(`10. SM YTD Dwell Avg Days: ${values[9]}`);
            console.log(`11. RDS YTD Dwell Avg Days: ${values[10]}`);
          } else {
            console.log('Not enough values found, trying different extraction...');
            // Try extracting from each line separately
            for (let j = i + 1; j <= i + 5; j++) {
              if (lines[j]) {
                const lineVals = lines[j].match(/(\d+%|\d+\.\d+|\d+|N\/A)/gi) || [];
                console.log(`Line ${j}: "${lines[j]}" -> [${lineVals.join(', ')}]`);
              }
            }
          }
          console.log(`*** END WICHITA ROW ***\n`);
        }
      }
    }
    
    if (!foundTable) {
      console.log('Table not found. Showing first 50 lines:');
      lines.slice(0, 50).forEach((line, i) => {
        console.log(`${i}: ${line}`);
      });
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testPDF();
