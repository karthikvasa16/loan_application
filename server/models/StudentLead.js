const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentLead = sequelize.define('StudentLead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 120]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  studyCountry: {
    type: DataTypes.STRING,
    allowNull: false
  },
  admissionStatus: {
    type: DataTypes.ENUM('not_applied', 'applied', 'confirmed'),
    allowNull: false,
    defaultValue: 'not_applied'
  },
  intake: {
    type: DataTypes.STRING,
    allowNull: false
  },
  universityPreference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  loanRange: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('new', 'contacted', 'in_progress', 'verification_sent', 'converted', 'closed'),
    allowNull: false,
    defaultValue: 'new'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastContactedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verificationSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verificationSentBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  convertedUserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  convertedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'student_leads',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['studyCountry']
    }
  ]
});

module.exports = StudentLead;

