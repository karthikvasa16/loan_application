const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailVerificationToken = sequelize.define('EmailVerificationToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.TEXT, // Use TEXT instead of STRING to handle long tokens
    allowNull: false,
    unique: true,
    indexes: [{ unique: true, fields: ['token'] }]
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'email_verification_tokens',
  timestamps: false,
  indexes: [
    {
      fields: ['token'],
      unique: true
    },
    {
      fields: ['email']
    },
    {
      fields: ['expiresAt']
    }
  ]
});

module.exports = EmailVerificationToken;





