const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const LocationMetric = require('../models/LocationMetric');

const upload = multer(); // Store file in memory

// Helper: Extract dealership and location metrics from PDF
async function extractServiceMetrics(buffer) {
  try {
    // FIX: Convert Buffer to Uint8Array for pdfjs-dist compatibility
    const pdfDoc = await pdfjsLib.getDocument(new Uint8Array(buffer)).promise;
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    // Location names to search for
    const locationNames = [
      'Wichita Kenworth',
      'Dodge City Kenworth', 
      'Liberal Kenworth',
      'Emporia Kenworth'
    ];
    
    // Extract dealership summary (top portion)
    const dealershipMetrics = extractDealershipMetrics(fullText);
    console.log('Extracted dealership metrics:', dealershipMetrics);
    
    // Extract individual location metrics
    const locationMetrics = [];
    locationNames.forEach(locationName => {
      const locationData = extractLocationMetrics(fullText, locationName, locationNames);
      if (locationData) {
        console.log(`Extracted metrics for ${locationName}:`, locationData);
        locationMetrics.push(locationData);
      } else {
        console.warn(`No metrics found for ${locationName}`);
      }
    });
    
    console.log(`Total locations processed: ${locationMetrics.length}`);
    
    return {
      dealership: dealershipMetrics,
      locations: locationMetrics,
      extractedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    // FIX: Throw the error instead of returning malformed data
    throw new Error(`PDF processing failed: ${error.message}`);
  }
}

function extractDealershipMetrics(text) {
  // Extract W370 dealership-wide metrics from the top section
  const metrics = {};
  
  // Look for the dealership summary table (usually appears before individual locations)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Find lines that might contain dealership totals/averages
  // Look for patterns that appear before the "Individual Dealer Metrics" section
  const dealershipSection = lines.slice(0, lines.findIndex(line => 
    line.toLowerCase().includes('individual') || 
    line.toLowerCase().includes('dealer metrics')
  ));
  
  // Extract dealership metrics from the summary section
  const dealershipData = dealershipSection.join(' ');
  
  // Extract key dealership metrics using patterns
  const patterns = {
    vscCaseRequirements: /vsc.*?case.*?requirements.*?(\d+(?:\.\d+)?%?)/i,
    vscClosedCorrectly: /vsc.*?closed.*?correctly.*?(\d+(?:\.\d+)?%?)/i,
    ttActivation: /tt.*?activation.*?(\d+(?:\.\d+)?%?)/i,
    smMonthlyDwellAvg: /sm.*?monthly.*?dwell.*?(\d+(?:\.\d+)?)/i,
    triageHours: /triage.*?hours.*?(\d+(?:\.\d+)?)/i,
    triagePercentLess4Hours: /triage.*?4.*?hours.*?(\d+(?:\.\d+)?%?)/i,
    etrPercentCases: /etr.*?percent.*?cases.*?(\d+(?:\.\d+)?%?)/i,
    percentCasesWith3Notes: /3.*?notes.*?(\d+(?:\.\d+)?%?)/i,
    rdsMonthlyAvgDays: /rds.*?monthly.*?(\d+(?:\.\d+)?)/i,
    smYtdDwellAvgDays: /sm.*?ytd.*?dwell.*?(\d+(?:\.\d+)?)/i,
    rdsYtdDwellAvgDays: /rds.*?ytd.*?dwell.*?(\d+(?:\.\d+)?)/i
  };
  
  Object.keys(patterns).forEach(key => {
    const match = dealershipData.match(patterns[key]);
    if (match) {
      metrics[key] = match[1];
    }
  });
  
  return metrics;
}

function extractLocationMetrics(text, locationName, locationNames) {
  // Find the "Individual Dealer Metrics" table section
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // First, find the table header to establish the column structure
  const headerIndex = lines.findIndex(line => 
    line.toLowerCase().includes('vsc case requirements') ||
    line.toLowerCase().includes('individual dealer metrics')
  );
  
  console.log(`Looking for ${locationName}...`);
  
  // Find the line containing this location name - search after the header
  const startSearchIndex = headerIndex > -1 ? headerIndex : 0;
  const locationLineIndex = lines.findIndex((line, index) => 
    index >= startSearchIndex && line.toLowerCase().includes(locationName.toLowerCase())
  );
  
  if (locationLineIndex === -1) {
    console.warn(`Location ${locationName} not found in PDF text`);
    return null;
  }
  
  console.log(`Found ${locationName} at line ${locationLineIndex}: "${lines[locationLineIndex]}"`);
  
  // Get the line with the location data and potentially the next few lines
  let combinedData = lines[locationLineIndex];
  
  // Sometimes data spans multiple lines, so combine nearby lines
  for (let i = locationLineIndex + 1; i < Math.min(locationLineIndex + 3, lines.length); i++) {
    const nextLine = lines[i];
    // Stop if we hit another location name or table header
    if (locationNames.some(loc => nextLine.toLowerCase().includes(loc.toLowerCase())) ||
        nextLine.toLowerCase().includes('total') ||
        nextLine.toLowerCase().includes('average')) {
      break;
    }
    combinedData += ' ' + nextLine;
  }
  
  console.log(`Combined data for ${locationName}: "${combinedData}"`);
  
  // Extract all numeric values, percentages, and N/A from the combined data
  // More specific regex to avoid picking up years/irrelevant numbers
  const values = combinedData.match(/(\b\d{1,2}(?:\.\d+)?%|\bN\/A\b|\b\d{1,2}\.\d+\b)/g) || [];
  
  console.log(`Extracted values for ${locationName}:`, values);
  
  // Map location names to IDs for frontend consistency
  const locationIds = {
    'Wichita Kenworth': 'wichita',
    'Dodge City Kenworth': 'dodge-city', 
    'Liberal Kenworth': 'liberal',
    'Emporia Kenworth': 'emporia'
  };
  
  // W370 Service Scorecard has 11 columns based on your data:
  const metrics = {
    name: locationName,
    locationId: locationIds[locationName] || locationName.toLowerCase().replace(/\s+/g, '-'),
    vscCaseRequirements: values[0] || 'N/A',
    vscClosedCorrectly: values[1] || 'N/A',
    ttActivation: values[2] || 'N/A',
    smMonthlyDwellAvg: values[3] || 'N/A',
    triageHours: values[4] || 'N/A',
    triagePercentLess4Hours: values[5] || 'N/A',
    etrPercentCases: values[6] || 'N/A',
    percentCasesWith3Notes: values[7] || 'N/A',
    rdsMonthlyAvgDays: values[8] || 'N/A',
    smYtdDwellAvgDays: values[9] || 'N/A',
    rdsYtdDwellAvgDays: values[10] || 'N/A'
  };
  
  console.log(`Final metrics for ${locationName}:`, metrics);
  return metrics;
}

// POST /api/location-metrics/upload - Upload PDF and update metrics
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      month: req.body.month,
      year: req.body.year
    });

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ 
        success: false, 
        error: 'No PDF file uploaded' 
      });
    }

    if (!req.body.month || !req.body.year) {
      console.error('Missing month or year');
      return res.status(400).json({ 
        success: false, 
        error: 'Month and year are required' 
      });
    }

    console.log('Starting PDF extraction...');
    
    // Extract dealership and location metrics using pdfjs-dist
    const metrics = await extractServiceMetrics(req.file.buffer);
    
    console.log('PDF extraction successful:', {
      dealershipMetrics: Object.keys(metrics.dealership || {}).length,
      locationCount: metrics.locations?.length || 0
    });

    // Remove all previous metrics (keep only latest)
    await LocationMetric.deleteMany({});
    console.log('Cleared previous metrics');
    
    // Save new metrics with additional metadata
    const newMetrics = new LocationMetric({ 
      metrics: {
        ...metrics,
        month: req.body.month,
        year: parseInt(req.body.year),
        fileName: req.file.originalname,
        uploadedAt: new Date()
      }
    });
    
    await newMetrics.save();
    console.log('New metrics saved to database');
    
    // FIX: Always return the exact structure the frontend expects
    const response = {
      dealership: metrics.dealership,
      locations: metrics.locations,
      extractedAt: metrics.extractedAt
    };

    console.log('Sending response:', {
      hasDealership: !!response.dealership,
      hasLocations: !!response.locations,
      locationCount: response.locations?.length
    });
    
    res.json(response);
    
  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      stack: error.stack,
      fileName: req.file?.originalname
    });
    
    // FIX: Return proper error response
    res.status(500).json({ 
      success: false, 
      error: `Failed to process PDF: ${error.message}`,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/location-metrics - Get latest metrics
router.get('/', async (req, res) => {
  try {
    const latest = await LocationMetric.findOne().sort({ uploadedAt: -1 });
    if (!latest) {
      return res.status(404).json({ 
        success: false, 
        error: 'No metrics found' 
      });
    }
    res.json({ 
      success: true, 
      data: latest.metrics 
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;