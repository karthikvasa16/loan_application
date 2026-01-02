const { AccountActivityLog } = require('../models');

exports.logAccountActivity = async (action, { userId = null, email = null, metadata = null } = {}) => {
  try {
    await AccountActivityLog.create({
      userId,
      email: email ? email.toLowerCase() : null,
      action,
      metadata
    });
  } catch (error) {
    console.error('⚠️ Failed to log account activity:', error.message);
  }
};

module.exports = exports;








