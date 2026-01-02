const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
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
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Null for Google OAuth users
    validate: {
      len: [0, 255]
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'student', 'super_admin'),
    defaultValue: 'student',
    allowNull: false
  },
  googleId: {
    type: DataTypes.TEXT,
    allowNull: true,
    unique: false // Remove unique constraint as JWT tokens are long and may vary
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  emailVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  welcomeEmailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  profileVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  profileVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  documentsSubmitted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  documentsSubmittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sessionToken: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['role']
    }
  ],
  hooks: {
    beforeUpdate: (user) => {
      user.updatedAt = new Date();
    }
  }
});

// Instance method to check password
User.prototype.checkPassword = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// Static method to hash password
User.hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

module.exports = User;
