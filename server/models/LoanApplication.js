const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LoanApplication = sequelize.define('LoanApplication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  applicationNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected'),
    defaultValue: 'draft'
  },
  
  // Loan Type Data
  loanType: {
    type: DataTypes.ENUM('abroad', 'domestic', 'skill'),
    allowNull: false
  },
  loanAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  tenure: {
    type: DataTypes.INTEGER
  },
  
  // Personal Details
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Must be a valid email address'
      },
      notEmpty: {
        msg: 'Email cannot be empty'
      }
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nationality: {
    type: DataTypes.STRING,
    defaultValue: 'Indian'
  },
  maritalStatus: {
    type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed')
  },
  
  // Academic Details
  currentQualification: {
    type: DataTypes.STRING,
    allowNull: false
  },
  currentInstitution: {
    type: DataTypes.STRING
  },
  percentage: {
    type: DataTypes.STRING
  },
  yearOfPassing: {
    type: DataTypes.INTEGER
  },
  targetCountry: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetUniversity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  courseLevel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  courseName: {
    type: DataTypes.STRING
  },
  courseDuration: {
    type: DataTypes.STRING
  },
  intakeSession: {
    type: DataTypes.STRING
  },
  tuitionFee: {
    type: DataTypes.DECIMAL(15, 2)
  },
  
  // Financial Details
  employmentStatus: {
    type: DataTypes.ENUM('employed', 'self-employed', 'business', 'student', 'unemployed'),
    allowNull: false
  },
  annualIncome: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  employerName: {
    type: DataTypes.STRING
  },
  workExperience: {
    type: DataTypes.STRING
  },
  existingEMI: {
    type: DataTypes.DECIMAL(15, 2)
  },
  creditCardOutstanding: {
    type: DataTypes.DECIMAL(15, 2)
  },
  bankBalance: {
    type: DataTypes.DECIMAL(15, 2)
  },
  investments: {
    type: DataTypes.DECIMAL(15, 2)
  },
  propertyOwned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  propertyValue: {
    type: DataTypes.DECIMAL(15, 2)
  },
  
  // Family Details
  fatherName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  motherName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fatherOccupation: {
    type: DataTypes.STRING
  },
  motherOccupation: {
    type: DataTypes.STRING
  },
  fatherIncome: {
    type: DataTypes.DECIMAL(15, 2)
  },
  motherIncome: {
    type: DataTypes.DECIMAL(15, 2)
  },
  fatherPhone: {
    type: DataTypes.STRING
  },
  motherPhone: {
    type: DataTypes.STRING
  },
  dependents: {
    type: DataTypes.STRING
  },
  coApplicantRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  coApplicantName: {
    type: DataTypes.STRING
  },
  coApplicantRelation: {
    type: DataTypes.STRING
  },
  coApplicantIncome: {
    type: DataTypes.DECIMAL(15, 2)
  },
  coApplicantPhone: {
    type: DataTypes.STRING
  },
  
  // Address Details
  currentAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  currentAddress2: {
    type: DataTypes.STRING
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'India'
  },
  residenceType: {
    type: DataTypes.ENUM('Owned', 'Rented', 'Family Owned')
  },
  sameAddress: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  permanentAddress: {
    type: DataTypes.TEXT
  },
  permanentAddress2: {
    type: DataTypes.STRING
  },
  permanentCity: {
    type: DataTypes.STRING
  },
  permanentState: {
    type: DataTypes.STRING
  },
  permanentPincode: {
    type: DataTypes.STRING
  },
  permanentCountry: {
    type: DataTypes.STRING
  },
  
  // Application Meta
  termsAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  submittedAt: {
    type: DataTypes.DATE
  },
  reviewedAt: {
    type: DataTypes.DATE
  },
  approvedAt: {
    type: DataTypes.DATE
  },
  rejectedAt: {
    type: DataTypes.DATE
  },
  rejectionReason: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'loan_applications',
  timestamps: true
});

// Generate application number before creating
LoanApplication.beforeCreate(async (application) => {
  const count = await LoanApplication.count();
  const applicationNumber = `KUB${new Date().getFullYear()}${String(count + 1).padStart(6, '0')}`;
  application.applicationNumber = applicationNumber;
});

module.exports = LoanApplication;