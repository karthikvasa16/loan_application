const sequelize = require('../config/database');
const User = require('./User');
const PasswordResetToken = require('./PasswordResetToken');
const EmailVerificationToken = require('./EmailVerificationToken');
const AccountActivityLog = require('./AccountActivityLog');
const StudentLead = require('./StudentLead');
const LoanApplication = require('./LoanApplication');
const Document = require('./Document');

// Define associations
LoanApplication.hasMany(Document, { foreignKey: 'applicationId', as: 'documents' });
Document.belongsTo(LoanApplication, { foreignKey: 'applicationId' });

// Export models
module.exports = {
  sequelize,
  User,
  PasswordResetToken,
  EmailVerificationToken,
  AccountActivityLog,
  StudentLead,
  LoanApplication,
  Document
};
