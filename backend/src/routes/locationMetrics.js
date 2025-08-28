const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const LocationMetric = require('../models/LocationMetric');

const upload = multer(); // Store file in memory

// Helper: Extract all tables from PDF text (simple row/column split)
function extractTablesFromText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  // Find header row (first row with multiple columns)
  let headerIdx = lines.findIndex(l => l.split(/\s{2,}/).length > 2);
  if (headerIdx === -1) return { rawText: text };
  const headers = lines[headerIdx].split(/\s{2,}/).map(h => h.trim());
  const dataRows = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = lines[i].split(/\s{2,}/);
    if (cols.length === headers.length) {
      const row = {};
      headers.forEach((h, idx) => row[h] = cols[idx].trim());
      dataRows.push(row);
    }
  }
  return { headers, data: dataRows };
}

// POST /api/location-metrics/upload - Upload PDF and update metrics
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file uploaded' });
    }
    // Parse PDF
    const data = await pdfParse(req.file.buffer);
    // Extract all tabular data
    const metrics = extractTablesFromText(data.text);
    // Remove all previous metrics (keep only latest)
    await LocationMetric.deleteMany({});
    // Save new metrics
    const newMetrics = new LocationMetric({ metrics });
    await newMetrics.save();
    res.json({ success: true, message: 'Metrics updated', data: newMetrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/location-metrics - Get latest metrics
router.get('/', async (req, res) => {
  try {
    const latest = await LocationMetric.findOne().sort({ uploadedAt: -1 });
    if (!latest) {
      return res.status(404).json({ success: false, error: 'No metrics found' });
    }
    res.json({ success: true, data: latest.metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
