const express = require('express');
const router = express.Router();
const loanApplicationService = require('../services/loanApplicationService');

// Create new loan application
router.post('/applications', async (req, res) => {
  try {
    const result = await loanApplicationService.createApplication(req.body);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Application created successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error in POST /applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update existing loan application
router.put('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await loanApplicationService.updateApplication(id, req.body);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Application updated successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error in PUT /applications/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Submit loan application
router.post('/applications/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await loanApplicationService.submitApplication(id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Application submitted successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error in POST /applications/:id/submit:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload document
router.post('/applications/:id/documents/:type', 
  loanApplicationService.getUploadMiddleware(),
  async (req, res) => {
    try {
      const { id, type } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const result = await loanApplicationService.uploadDocument(id, type, req.file);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Document uploaded successfully',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      console.error('Error in POST /applications/:id/documents/:type:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// Get single application
router.get('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await loanApplicationService.getApplication(id);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error in GET /applications/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all applications with filters
router.get('/applications', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      email: req.query.email
    };
    
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    const result = await loanApplicationService.getApplications(filters);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error in GET /applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Save draft
router.post('/applications/:id/save-draft', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await loanApplicationService.updateApplication(id, req.body);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Draft saved successfully',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error in POST /applications/:id/save-draft:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
