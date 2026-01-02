const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccountActivityLog = sequelize.define('AccountActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'account_activity_logs',
  timestamps: true,
  indexes: [
    { fields: ['action'] },
    { fields: ['email'] }
  ],
  hooks: {
    beforeUpdate: (log) => {
      log.updatedAt = new Date();
    }
  }
});

module.exports = AccountActivityLog;








