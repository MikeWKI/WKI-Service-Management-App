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
    
    // Extract individual location metrics
    const locationMetrics = [];
    locationNames.forEach(locationName => {
      const locationData = extractLocationMetrics(fullText, locationName);
      if (locationData) {
        locationMetrics.push(locationData);
      }
    });
    
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
  // Extract key metrics from the top dealership section
  const metrics = {};
  
  // Common patterns for service metrics
  const patterns = {
    dwellTime: /dwell.*?time.*?(\d+\.?\d*)/i,
    triageTime: /triage.*?time.*?(\d+\.?\d*)/i,
    customerSatisfaction: /customer.*?satisfaction.*?(\d+\.?\d*)%?/i,
    serviceEfficiency: /service.*?efficiency.*?(\d+\.?\d*)%?/i,
    totalCases: /total.*?cases.*?(\d+)/i,
    completedCases: /completed.*?cases.*?(\d+)/i
  };
  
  Object.keys(patterns).forEach(key => {
    const match = text.match(patterns[key]);
    if (match) {
      metrics[key] = match[1];
    }
  });
  
  return metrics;
}

function extractLocationMetrics(text, locationName) {
  // Find the section for this location
  const locationIndex = text.toLowerCase().indexOf(locationName.toLowerCase());
  if (locationIndex === -1) return null;
  
  // Extract text around this location (next 500 characters)
  const locationSection = text.substring(locationIndex, locationIndex + 500);
  
  const metrics = { name: locationName };
  
  // Extract numbers that appear after the location name
  const numbers = locationSection.match(/\d+\.?\d*/g);
  if (numbers && numbers.length > 0) {
    // Map common positions to metric names
    metrics.dwellTime = numbers[0] || null;
    metrics.triageTime = numbers[1] || null;
    metrics.cases = numbers[2] || null;
    metrics.satisfaction = numbers[3] || null;
  }
  
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