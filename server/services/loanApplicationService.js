const LoanApplication = require('../models/LoanApplication');
const Document = require('../models/Document');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class LoanApplicationService {
  constructor() {
    this.setupMulter();
  }

  setupMulter() {
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/documents');
        try {
          await fs.mkdir(uploadDir, { recursive: true });
          cb(null, uploadDir);
        } catch (error) {
          cb(error);
        }
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    const fileFilter = (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'));
      }
    };

    this.upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024
      }
    });
  }

  async createApplication(applicationData) {
    try {
      const flatData = this.flattenFormData(applicationData);
      const application = await LoanApplication.create(flatData);
      
      return {
        success: true,
        data: {
          id: application.id,
          applicationNumber: application.applicationNumber,
          status: application.status
        }
      };
    } catch (error) {
      console.error('Error creating application:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateApplication(applicationId, applicationData) {
    try {
      const flatData = this.flattenFormData(applicationData);
      
      const [updatedRows] = await LoanApplication.update(flatData, {
        where: { id: applicationId }
      });

      if (updatedRows === 0) {
        return {
          success: false,
          error: 'Application not found'
        };
      }

      const application = await LoanApplication.findByPk(applicationId);
      
      return {
        success: true,
        data: {
          id: application.id,
          applicationNumber: application.applicationNumber,
          status: application.status
        }
      };
    } catch (error) {
      console.error('Error updating application:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async submitApplication(applicationId) {
    try {
      const application = await LoanApplication.findByPk(applicationId);
      
      if (!application) {
        return {
          success: false,
          error: 'Application not found'
        };
      }

      await application.update({
        status: 'submitted',
        submittedAt: new Date()
      });

      return {
        success: true,
        data: {
          id: application.id,
          applicationNumber: application.applicationNumber,
          status: 'submitted',
          submittedAt: application.submittedAt
        }
      };
    } catch (error) {
      console.error('Error submitting application:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async uploadDocument(applicationId, documentType, file) {
    try {
      const application = await LoanApplication.findByPk(applicationId);
      if (!application) {
        return {
          success: false,
          error: 'Application not found'
        };
      }

      const existingDoc = await Document.findOne({
        where: { applicationId, documentType }
      });

      if (existingDoc) {
        try {
          await fs.unlink(existingDoc.filePath);
        } catch (error) {
          console.warn('Could not delete old file:', error.message);
        }
        await existingDoc.destroy();
      }

      const document = await Document.create({
        applicationId,
        documentType,
        fileName: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype
      });

      return {
        success: true,
        data: {
          id: document.id,
          documentType: document.documentType,
          fileName: document.fileName,
          originalName: document.originalName,
          fileSize: document.fileSize,
          uploadedAt: document.uploadedAt
        }
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getApplication(applicationId) {
    try {
      const application = await LoanApplication.findByPk(applicationId);
      
      if (!application) {
        return {
          success: false,
          error: 'Application not found'
        };
      }

      const documents = await Document.findAll({
        where: { applicationId },
        attributes: ['id', 'documentType', 'originalName', 'fileSize', 'uploadedAt', 'verified']
      });

      return {
        success: true,
        data: {
          application: application.toJSON(),
          documents
        }
      };
    } catch (error) {
      console.error('Error fetching application:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getApplications(filters = {}) {
    try {
      const where = {};
      
      if (filters.status) {
        where.status = filters.status;
      }
      
      if (filters.email) {
        where.email = filters.email;
      }

      const applications = await LoanApplication.findAll({
        where,
        attributes: [
          'id', 'applicationNumber', 'status', 'firstName', 'lastName', 
          'email', 'loanType', 'loanAmount', 'createdAt', 'submittedAt'
        ],
        order: [['createdAt', 'DESC']]
      });

      return {
        success: true,
        data: applications
      };
    } catch (error) {
      console.error('Error fetching applications:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  flattenFormData(formData) {
    const flattened = {};
    
    Object.keys(formData).forEach(section => {
      if (typeof formData[section] === 'object' && formData[section] !== null) {
        Object.keys(formData[section]).forEach(field => {
          flattened[field] = formData[section][field];
        });
      } else {
        flattened[section] = formData[section];
      }
    });

    // Set default values for required fields if missing
    const defaults = {
      loanType: flattened.loanType || 'abroad',
      loanAmount: flattened.loanAmount || '0',
      firstName: flattened.firstName || '',
      lastName: flattened.lastName || '',
      dateOfBirth: flattened.dateOfBirth || '1990-01-01',
      gender: flattened.gender || 'Male',
      email: flattened.email || 'temp@example.com',
      phone: flattened.phone || '',
      currentQualification: flattened.currentQualification || 'bachelor',
      targetCountry: flattened.targetCountry || 'usa',
      targetUniversity: flattened.targetUniversity || '',
      courseLevel: flattened.courseLevel || 'postgraduate',
      employmentStatus: flattened.employmentStatus || 'student',
      annualIncome: flattened.annualIncome || '0',
      fatherName: flattened.fatherName || '',
      motherName: flattened.motherName || '',
      currentAddress: flattened.currentAddress || '',
      city: flattened.city || '',
      state: flattened.state || 'maharashtra',
      pincode: flattened.pincode || '000000'
    };

    Object.keys(defaults).forEach(key => {
      if (!flattened[key]) {
        flattened[key] = defaults[key];
      }
    });

    ['propertyOwned', 'coApplicantRequired', 'sameAddress', 'termsAccepted'].forEach(field => {
      if (flattened[field] === 'Yes' || flattened[field] === 'true') {
        flattened[field] = true;
      } else if (flattened[field] === 'No' || flattened[field] === 'false') {
        flattened[field] = false;
      }
    });

    return flattened;
  }

  getUploadMiddleware() {
    return this.upload.single('document');
  }
}

module.exports = new LoanApplicationService();