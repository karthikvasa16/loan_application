const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING,
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
  tableName: 'password_reset_tokens',
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

module.exports = PasswordResetToken;





