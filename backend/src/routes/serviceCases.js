const express = require('express');
const router = express.Router();

// GET /api/service-cases - Get all service cases
router.get('/', async (req, res) => {
  try {
    const { status, role, page = 1, limit = 10 } = req.query;
    
    // Mock data for now - replace with database queries
    const mockCases = [
      {
        id: 'CASE-001',
        truckId: 'TRK-12345',
        status: 'case-created',
        currentStep: 'case-created',
        createdAt: new Date().toISOString(),
        customerName: 'ABC Transportation',
        complaint: 'Engine overheating',
        estimatedRepairTime: '2024-12-25T10:00:00Z',
        assignedTechnician: 'John Smith',
        serviceAdvisor: 'Jane Doe'
      },
      {
        id: 'CASE-002', 
        truckId: 'TRK-67890',
        status: 'repair-process',
        currentStep: 'repair-process',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        customerName: 'XYZ Logistics',
        complaint: 'Brake system issue',
        estimatedRepairTime: '2024-12-24T14:00:00Z',
        assignedTechnician: 'Mike Johnson',
        serviceAdvisor: 'Bob Wilson'
      }
    ];

    res.json({
      success: true,
      data: mockCases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockCases.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/service-cases - Create new service case
router.post('/', async (req, res) => {
  try {
    const { truckId, customerName, complaint, serviceAdvisor } = req.body;
    
    if (!truckId || !customerName || !complaint) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: truckId, customerName, complaint'
      });
    }

    const newCase = {
      id: `CASE-${Date.now()}`,
      truckId,
      customerName,
      complaint,
      serviceAdvisor,
      status: 'case-created',
      currentStep: 'case-created',
      createdAt: new Date().toISOString(),
      estimatedRepairTime: null
    };

    res.status(201).json({
      success: true,
      data: newCase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/service-cases/:id/step - Update case step
router.put('/:id/step', async (req, res) => {
  try {
    const { id } = req.params;
    const { step, notes } = req.body;

    if (!step) {
      return res.status(400).json({
        success: false,
        error: 'Step is required'
      });
    }

    // Mock update - replace with database update
    res.json({
      success: true,
      data: {
        id,
        currentStep: step,
        updatedAt: new Date().toISOString(),
        notes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
