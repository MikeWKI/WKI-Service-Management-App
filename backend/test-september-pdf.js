const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const fs = require('fs');
const path = require('path');

async function analyzePDF() {
  try {
    const pdfPath = path.join('C:', 'Users', 'michaela', 'Downloads', 'W370 Service Scorecard September 2025.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    console.log('📄 Analyzing September 2025 PDF...\n');
    
    const pdfDoc = await pdfjsLib.getDocument(new Uint8Array(pdfBuffer)).promise;
    console.log(`Total pages: ${pdfDoc.numPages}\n`);
    
    // Extract text from first page (Individual Dealer Metrics)
    for (let pageNum = 1; pageNum <= Math.min(2, pdfDoc.numPages); pageNum++) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`PAGE ${pageNum}`);
      console.log('='.repeat(80));
      
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Get items with their positions
      const items = textContent.items.map((item, index) => ({
        index,
        text: item.str,
        x: Math.round(item.transform[4]),
        y: Math.round(item.transform[5])
      }));
      
      // Sort by Y position (top to bottom), then X position (left to right)
      items.sort((a, b) => {
        const yDiff = b.y - a.y; // Higher Y = top of page
        if (Math.abs(yDiff) > 5) return yDiff; // Different lines
        return a.x - b.x; // Same line, sort left to right
      });
      
      // Group items by line (similar Y coordinates)
      let currentY = null;
      let currentLine = [];
      const lines = [];
      
      items.forEach(item => {
        if (currentY === null || Math.abs(item.y - currentY) <= 5) {
          currentLine.push(item);
          currentY = item.y;
        } else {
          if (currentLine.length > 0) {
            lines.push(currentLine);
          }
          currentLine = [item];
          currentY = item.y;
        }
      });
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      
      // Print ALL text items with coordinates to understand PDF structure
      console.log('\n📊 ALL TEXT ITEMS (sorted by position):\n');
      
      items.forEach((item, idx) => {
        const text = item.text.trim();
        if (text && text !== '') {
          console.log(`${idx.toString().padStart(4)}: X=${item.x.toString().padStart(4)}, Y=${item.y.toString().padStart(4)}, Text="${text}"`);
        }
      });
      
      // Look for rows with numeric data (likely metrics)
      console.log('\n\n🔢 LINES WITH NUMERIC DATA:\n');
      lines.forEach((line, lineIndex) => {
        const lineText = line.map(item => item.text).join(' ').trim();
        // Look for lines with percentages and numbers
        if (/\d+%|\d+\.\d+/.test(lineText)) {
          const nums = lineText.match(/\d+(?:\.\d+)?%?/g) || [];
          if (nums.length >= 3) {  // At least 3 numeric values
            console.log(`\nLine ${lineIndex}: "${lineText}"`);
            console.log(`  Values found: [${nums.join(', ')}] (count: ${nums.length})`);
            console.log(`  Y position: ${line[0].y}`);
          }
        }
      });
      
      // Look specifically for location names and their Y positions
      console.log('\n\n📍 LOCATION POSITIONS:\n');
      const locationNames = ['Wichita Kenworth', 'Dodge City Kenworth', 'Liberal Kenworth', 'Emporia Kenworth'];
      
      locationNames.forEach(locationName => {
        items.forEach((item, idx) => {
          if (item.text.includes(locationName)) {
            console.log(`${locationName}: Y=${item.y}, X=${item.x}`);
            
            // Find items on the same row (similar Y coordinate, within 10 pixels)
            const sameRow = items.filter(other => 
              Math.abs(other.y - item.y) <= 10 && other.x > item.x
            ).sort((a, b) => a.x - b.x);
            
            if (sameRow.length > 0) {
              console.log(`  Same row values: [${sameRow.map(i => i.text).join(', ')}]`);
            }
            
            // Find items in the row below (Y - 40 to Y - 60 range for typical row height)
            const rowBelow = items.filter(other => 
              other.y >= (item.y - 60) && other.y < item.y && other.x > item.x
            ).sort((a, b) => a.x - b.x);
            
            if (rowBelow.length > 0) {
              console.log(`  Row below values: [${rowBelow.map(i => i.text).join(', ')}]`);
            }
          }
        });
      });
    }
    
    console.log('\n\n✅ Analysis complete!\n');
    
  } catch (error) {
    console.error('❌ Error analyzing PDF:', error);
    console.error(error.stack);
  }
}

analyzePDF();
