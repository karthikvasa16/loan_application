const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'loan_applications',
      key: 'id'
    }
  },
  documentType: {
    type: DataTypes.ENUM(
      'photo', 
      'identity', 
      'address', 
      'income', 
      'academic', 
      'admission', 
      'bank', 
      'collateral'
    ),
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verifiedAt: {
    type: DataTypes.DATE
  },
  verifiedBy: {
    type: DataTypes.STRING
  },
  rejectionReason: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'documents',
  timestamps: true
});

module.exports = Document;