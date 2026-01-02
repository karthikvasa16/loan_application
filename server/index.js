require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { students, applications, universities, activities, stats } = require('./data/mockData');
const { User, PasswordResetToken, EmailVerificationToken, AccountActivityLog, StudentLead, LoanApplication, Document } = require('./models');
const sequelize = require('./config/database');
const initDatabase = require('./config/initDatabase');
const emailService = require('./services/emailService');
const { logAccountActivity } = require('./services/auditService');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const loanApplicationRoutes = require('./routes/loanApplications');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Use loan application routes
app.use('/api/loans', loanApplicationRoutes);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.sendStatus(403);

    try {
      const user = await User.findByPk(decoded.id);
      if (!user) return res.sendStatus(403);

      // Single session check
      if (decoded.sessionToken && user.sessionToken && decoded.sessionToken !== user.sessionToken) {
        return res.status(403).json({ error: 'Session expired. You have logged in from another device.' });
      }

      // If token didn't have sessionToken (legacy), maybe allow or force logout? 
      // For smooth transition, valid signature is enough, but for strict single session, we should require it.
      // Let's require it if user has one.

      req.user = decoded; // Keep compatible with existing usage
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.sendStatus(500);
    }
  });
};

const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden: Super admin access required' });
  }
  next();
};

const requireAdminOrSuper = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const requestingUser = await User.findByPk(req.user.id);

    if (!requestingUser || (requestingUser.role !== 'admin' && requestingUser.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    req.authenticatedUser = requestingUser;
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({ error: 'Failed to verify permissions' });
  }
};

// Routes

// Check if email exists endpoint
app.post('/api/auth/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    res.json({ exists: !!existingUser });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ error: 'Failed to check email' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Public lead capture endpoint
app.post('/api/leads', async (req, res) => {
  try {
    console.log('📥 Lead submission received:', {
      body: req.body,
      timestamp: new Date().toISOString()
    });

    // First verify database connection
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection verified');
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError);
      return res.status(500).json({ error: 'Database connection failed. Please try again later.' });
    }

    // Ensure StudentLead table exists
    try {
      await StudentLead.sync({ alter: false });
      console.log('✅ StudentLead table verified');
    } catch (syncError) {
      console.error('❌ Table sync error:', syncError);
      // Try to create the table if it doesn't exist
      try {
        await StudentLead.sync({ force: false });
        console.log('✅ StudentLead table created');
      } catch (createError) {
        console.error('❌ Failed to create table:', createError);
        return res.status(500).json({
          error: 'Database table error. Please contact support.',
          details: process.env.NODE_ENV !== 'production' ? createError.message : undefined
        });
      }
    }

    const {
      fullName,
      email,
      phone,
      studyCountry,
      admissionStatus,
      intake,
      universityPreference,
      loanRange,
      city
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!fullName || !fullName.trim()) missingFields.push('fullName');
    if (!email || !email.trim()) missingFields.push('email');
    if (!studyCountry) missingFields.push('studyCountry');
    if (!admissionStatus) missingFields.push('admissionStatus');
    if (!intake) missingFields.push('intake');
    if (!loanRange) missingFields.push('loanRange');

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const allowedAdmissionStatuses = ['not_applied', 'applied', 'confirmed'];
    const normalizedAdmissionStatus = allowedAdmissionStatuses.includes(admissionStatus)
      ? admissionStatus
      : 'not_applied';

    // Validate fullName length before saving
    const trimmedFullName = fullName.trim();
    if (trimmedFullName.length < 2) {
      return res.status(400).json({
        error: 'Full name must be at least 2 characters long'
      });
    }
    if (trimmedFullName.length > 120) {
      return res.status(400).json({
        error: 'Full name must be less than 120 characters'
      });
    }

    const defaults = {
      fullName: trimmedFullName,
      email: normalizedEmail,
      phone: (phone && phone.trim()) || null,
      studyCountry,
      admissionStatus: normalizedAdmissionStatus,
      intake,
      universityPreference: (universityPreference && universityPreference.trim()) || null,
      loanRange,
      city: (city && city.trim()) || null
    };

    console.log('💾 Attempting to save lead:', {
      email: normalizedEmail,
      defaults: {
        ...defaults,
        phone: defaults.phone || 'null',
        city: defaults.city || 'null',
        universityPreference: defaults.universityPreference || 'null'
      }
    });

    let lead, created;
    try {
      [lead, created] = await StudentLead.findOrCreate({
        where: { email: normalizedEmail },
        defaults
      });
      console.log(`✅ Lead ${created ? 'created' : 'updated'}:`, {
        id: lead.id,
        email: lead.email,
        fullName: lead.fullName
      });
    } catch (dbError) {
      console.error('❌ Database save error:', dbError);
      console.error('Error name:', dbError.name);
      console.error('Error message:', dbError.message);
      if (dbError.errors) {
        console.error('Validation errors:', dbError.errors.map(e => ({
          field: e.path,
          message: e.message,
          value: e.value
        })));
      }
      throw dbError; // Re-throw to be caught by outer catch
    }

    if (!created) {
      lead.fullName = trimmedFullName;
      lead.phone = (phone && phone.trim()) || lead.phone;
      lead.studyCountry = studyCountry;
      lead.admissionStatus = normalizedAdmissionStatus;
      lead.intake = intake;
      lead.universityPreference = (universityPreference && universityPreference.trim()) || lead.universityPreference;
      lead.loanRange = loanRange;
      lead.city = (city && city.trim()) || lead.city;
      if (lead.status === 'closed') {
        lead.status = 'in_progress';
      }
      await lead.save();
    } else {
      // Log activity, but don't fail if logging fails
      try {
        await logAccountActivity('student_lead_created', {
          email: normalizedEmail,
          metadata: {
            studyCountry,
            admissionStatus: normalizedAdmissionStatus,
            intake,
            loanRange
          }
        });
      } catch (logError) {
        console.error('Failed to log account activity (non-critical):', logError);
        // Continue even if logging fails
      }
    }

    // Send confirmation email to student (non-blocking)
    if (created) {
      try {
        await emailService.sendEnquiryConfirmationEmail(
          normalizedEmail,
          trimmedFullName,
          {
            studyCountry,
            intake,
            loanRange
          }
        );
        console.log('✅ Enquiry confirmation email sent to:', normalizedEmail);
      } catch (emailError) {
        // Don't fail the request if email sending fails
        console.error('⚠️ Failed to send enquiry confirmation email (non-critical):', emailError.message);
      }
    }

    const responseData = {
      success: true,
      created,
      lead: {
        id: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        studyCountry: lead.studyCountry,
        admissionStatus: lead.admissionStatus,
        intake: lead.intake,
        universityPreference: lead.universityPreference,
        loanRange: lead.loanRange,
        city: lead.city,
        status: lead.status,
        createdAt: lead.createdAt
      }
    };

    console.log('✅ Sending success response:', responseData);
    res.status(created ? 201 : 200).json(responseData);
  } catch (error) {
    console.error('❌ Lead capture error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500) // Limit stack trace length
    });

    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('Duplicate email error');
      return res.status(409).json({ error: 'A lead with this email already exists.' });
    }

    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors?.map(e => {
        const field = e.path || 'unknown';
        const message = e.message || 'Invalid value';
        const value = e.value !== undefined ? ` (value: "${e.value}")` : '';
        return `${field}: ${message}${value}`;
      }).join(', ') || 'Validation failed';
      console.error('Validation error:', validationErrors);
      console.error('All validation errors:', JSON.stringify(error.errors, null, 2));
      return res.status(400).json({
        error: `Validation error: ${validationErrors}`,
        details: error.errors
      });
    }

    if (error.name === 'SequelizeDatabaseError') {
      console.error('Database error:', error.original?.message || error.message);
      return res.status(500).json({
        error: 'Database error. Please check server logs.',
        details: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }

    // Return more detailed error (always show details for debugging)
    const errorMessage = `Failed to submit enquiry: ${error.message || 'Unknown error'}`;

    console.error('Sending 500 error response:', errorMessage);
    console.error('Full error for debugging:', {
      name: error.name,
      message: error.message,
      type: error.constructor?.name,
      errors: error.errors
    });

    return res.status(500).json({
      error: errorMessage,
      details: {
        name: error.name,
        message: error.message,
        type: error.constructor?.name
      }
    });
  }
});

// Admin: list leads
app.get('/api/leads', authenticateToken, requireAdminOrSuper, async (req, res) => {
  try {
    const { status, studyCountry, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status && ['new', 'contacted', 'in_progress', 'verification_sent', 'converted', 'closed'].includes(status)) {
      where.status = status;
    }

    if (studyCountry) {
      where.studyCountry = studyCountry;
    }

    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { universityPreference: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNumber - 1) * limitNumber;

    const { rows, count } = await StudentLead.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: limitNumber
    });

    res.json({
      leads: rows,
      total: count,
      page: pageNumber,
      limit: limitNumber
    });
  } catch (error) {
    console.error('Fetch leads error:', error);
    res.status(500).json({ error: 'Failed to load leads' });
  }
});

// Admin: update lead
app.patch('/api/leads/:id', authenticateToken, requireAdminOrSuper, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      notes,
      markContacted = false,
      lastContactedAt,
      fullName,
      phone,
      city,
      universityPreference,
      loanRange,
      studyCountry,
      admissionStatus,
      intake
    } = req.body;

    const lead = await StudentLead.findByPk(id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    if (status && ['new', 'contacted', 'in_progress', 'verification_sent', 'converted', 'closed'].includes(status)) {
      lead.status = status;
    }

    if (typeof notes === 'string') {
      lead.notes = notes.trim();
    }

    if (markContacted) {
      lead.lastContactedAt = new Date();
    } else if (lastContactedAt) {
      lead.lastContactedAt = new Date(lastContactedAt);
    }

    if (fullName) lead.fullName = fullName.trim();
    if (phone) lead.phone = phone;
    if (city) lead.city = city;
    if (universityPreference) lead.universityPreference = universityPreference;
    if (loanRange) lead.loanRange = loanRange;
    if (studyCountry) lead.studyCountry = studyCountry;
    if (admissionStatus && ['not_applied', 'applied', 'confirmed'].includes(admissionStatus)) {
      lead.admissionStatus = admissionStatus;
    }
    if (intake) lead.intake = intake;

    await lead.save();

    await logAccountActivity('student_lead_updated', {
      email: lead.email,
      metadata: {
        leadId: lead.id,
        updatedBy: req.authenticatedUser.email,
        status: lead.status
      }
    });

    res.json({ success: true, lead });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Admin: send verification email to lead
app.post('/api/leads/:id/send-verification', authenticateToken, requireAdminOrSuper, async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await StudentLead.findByPk(id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    let user = await User.findOne({ where: { email: lead.email.toLowerCase() } });

    if (user && user.emailVerified) {
      lead.status = 'converted';
      lead.convertedUserId = user.id;
      lead.convertedAt = new Date();
      await lead.save();

      return res.json({
        success: true,
        alreadyVerified: true,
        message: 'User already verified. No email sent.',
        lead
      });
    }

    if (!user) {
      user = await User.create({
        name: lead.fullName,
        email: lead.email.toLowerCase(),
        password: null,
        phone: lead.phone || null,
        country: lead.studyCountry || null,
        role: 'student',
        emailVerified: false
      });
    } else {
      user.name = lead.fullName || user.name;
      user.phone = lead.phone || user.phone;
      user.country = lead.studyCountry || user.country;
      if (!user.role || user.role === 'student') {
        user.role = 'student';
      }
      await user.save();
    }

    // Remove existing tokens for this email
    await EmailVerificationToken.destroy({ where: { email: user.email.toLowerCase() } });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await EmailVerificationToken.create({
      token: verificationToken,
      email: user.email.toLowerCase(),
      expiresAt,
      used: false
    });

    try {
      // Send verification email with login link included
      await emailService.sendVerificationEmail(user.email, user.name || user.email, verificationToken, true);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({ error: 'Failed to send verification email. Please check email configuration.' });
    }

    lead.status = 'verification_sent';
    lead.verificationSentAt = new Date();
    lead.verificationSentBy = req.authenticatedUser.email;
    lead.convertedUserId = user.id;
    await lead.save();

    await logAccountActivity('student_lead_verification_sent', {
      userId: user.id,
      email: user.email,
      metadata: {
        leadId: lead.id,
        sentBy: req.authenticatedUser.email
      }
    });

    res.json({
      success: true,
      message: 'Verification email sent successfully.',
      lead
    });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ error: 'Failed to send verification link' });
  }
});



// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Account not found. Please create an account first.',
        accountNotFound: true
      });
    }

    // Check if user has a password
    // If user has googleId but no password, they need to set a password first or use Google Sign-In
    if (!user.password) {
      if (user.googleId) {
        return res.status(401).json({
          error: 'This account was created with Google. Please use Google Sign-In or set a password first.',
          isGoogleUser: true
        });
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    if (user.isBlocked) {
      return res.status(403).json({
        error: 'This account has been blocked by the super admin. Contact support for assistance.',
        blocked: true
      });
    }

    const validPassword = await user.checkPassword(password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Please verify your email address before logging in. Check your inbox for the verification link.',
        requiresVerification: true
      });
    }

    const { rememberMe } = req.body;
    // Single session: Generate new session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    user.sessionToken = sessionToken;
    await user.save();

    const expiresIn = rememberMe ? '7d' : '24h';

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || 'student',
        sessionToken: sessionToken
      },
      JWT_SECRET,
      { expiresIn }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'student',
        picture: user.picture || null,
        isGoogleUser: !!user.googleId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, country } = req.body;

    console.log('🔵 Registration request received:', {
      name,
      email,
      hasPhone: !!phone,
      phoneLength: phone?.length,
      country
    });

    // Validation
    if (!name || !email) {
      console.error('❌ Missing required fields:', { hasName: !!name, hasEmail: !!email });
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists BEFORE creating user or sending email
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() }
    });
    if (existingUser) {
      return res.status(400).json({
        error: 'We already have a user with this email. Please use a different email address or try logging in.',
        duplicateEmail: true
      });
    }

    // Create new user without password (password will be set after email verification)
    console.log('Creating new user...');
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: null, // Password will be set after email verification
      phone: phone || null,
      country: country || null,
      role: 'student', // Registration is for students only
      emailVerified: false
    });
    console.log('✅ User created:', { id: newUser.id, email: newUser.email });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('Creating verification token...');
    // Store verification token
    const createdToken = await EmailVerificationToken.create({
      token: verificationToken,
      email: newUser.email.toLowerCase(),
      expiresAt,
      used: false
    });
    console.log('✅ Verification token created:', {
      id: createdToken.id,
      email: createdToken.email,
      tokenLength: createdToken.token.length
    });

    // Send verification email
    let emailSent = false;
    let emailError = null;
    try {
      await emailService.sendVerificationEmail(newUser.email, newUser.name, verificationToken);
      emailSent = true;
    } catch (emailErrorObj) {
      console.error('Failed to send verification email:', emailErrorObj);
      emailError = emailErrorObj;
      // Check if it's an email validation error
      if (emailErrorObj.code === 'EAUTH' || emailErrorObj.message?.includes('Invalid login') || emailErrorObj.message?.includes('Application-specific password')) {
        // This is a Gmail/SMTP configuration error, not an invalid email
        // Still return success but log the error
        emailSent = true; // Consider it "sent" since the issue is with SMTP config, not the email itself
      } else if (emailErrorObj.message?.includes('not found') || emailErrorObj.message?.includes('invalid email')) {
        // Invalid email address
        return res.status(400).json({
          success: false,
          error: 'Invalid email address. Please check your email and try again with a valid email address.',
          emailError: true
        });
      }
    }

    if (!emailSent && emailError) {
      // Email sending failed - return error asking user to check email
      return res.status(400).json({
        success: false,
        error: 'Failed to send verification email. Please check your email address and try again with a valid email address.',
        emailError: true
      });
    }

    await logAccountActivity('user_registered', {
      userId: newUser.id,
      email: newUser.email,
      metadata: {
        method: 'manual',
        country: country || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification email sent successfully. Please check your email to verify your account.',
      requiresVerification: true,
      emailSent: emailSent,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: 'student',
        emailVerified: false
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'We already have a user with this email. Please use a different email address or try logging in.',
        duplicateEmail: true
      });
    }

    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message).join(', ');
      return res.status(400).json({ error: `Validation error: ${messages}` });
    }

    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionRefusedError') {
      console.error('Database connection error! Please check your database connection.');
      return res.status(500).json({ error: 'Database connection failed. Please check server configuration.' });
    }

    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
});

app.post('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    // Get full user info including role
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ valid: false, error: 'User not found' });
    }
    if (user.isBlocked) {
      return res.json({ valid: false, error: 'Account is blocked by the super admin.' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'student',
        name: user.name || ''
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ valid: false, error: 'Server error' });
  }
});

// Google OAuth registration endpoint (requires verification)
app.post('/api/auth/google/register', async (req, res) => {
  try {
    const { googleToken, name, email, picture } = req.body;

    console.log('🔵 Google registration request received:', {
      email,
      name,
      hasToken: !!googleToken,
      tokenLength: googleToken?.length
    });

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'We already have a user with this email. Please use a different email address or try logging in.',
        duplicateEmail: true
      });
    }

    // Create new student user from Google (not verified yet)
    const newUser = await User.create({
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password: null, // Google users don't have password
      role: 'student',
      googleId: googleToken,
      picture: picture || null,
      emailVerified: false // Require verification
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('🔵 Creating verification token for Google registration:', {
      email: newUser.email.toLowerCase(),
      tokenLength: verificationToken.length,
      tokenFirst30: verificationToken.substring(0, 30),
      expiresAt: expiresAt
    });

    // Store verification token
    const createdToken = await EmailVerificationToken.create({
      token: verificationToken,
      email: newUser.email.toLowerCase(),
      expiresAt,
      used: false
    });

    console.log('✅ Verification token stored in database:', {
      id: createdToken.id,
      email: createdToken.email,
      tokenLength: createdToken.token.length,
      tokenFirst30: createdToken.token.substring(0, 30),
      storedToken: createdToken.token, // Full token for comparison
      expiresAt: createdToken.expiresAt
    });

    // Send verification email
    let emailSent = false;
    let emailError = null;
    try {
      await emailService.sendVerificationEmail(newUser.email, newUser.name, verificationToken);
      emailSent = true;
    } catch (emailErrorObj) {
      console.error('Failed to send verification email:', emailErrorObj);
      emailError = emailErrorObj;
      // Check if it's an email validation error
      if (emailErrorObj.code === 'EAUTH' || emailErrorObj.message?.includes('Invalid login') || emailErrorObj.message?.includes('Application-specific password')) {
        // This is a Gmail/SMTP configuration error, not an invalid email
        emailSent = true; // Consider it "sent" since the issue is with SMTP config
      } else if (emailErrorObj.message?.includes('not found') || emailErrorObj.message?.includes('invalid email')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email address. Please check your email and try again with a valid email address.',
          emailError: true
        });
      }
    }

    if (!emailSent && emailError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email. Please try again later or contact support.',
        emailError: true
      });
    }

    await logAccountActivity('user_registered', {
      userId: newUser.id,
      email: newUser.email,
      metadata: {
        method: 'google',
        hasPicture: !!picture
      }
    });

    // Return success but don't log in - user needs to verify email first
    res.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      requiresVerification: true
    });
  } catch (error) {
    console.error('Google registration error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'We already have a user with this email. Please use a different email address or try logging in.',
        duplicateEmail: true
      });
    }

    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message).join(', ');
      return res.status(400).json({ error: `Validation error: ${messages}` });
    }

    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionRefusedError') {
      console.error('Database connection error! Please check your database connection.');
      return res.status(500).json({ error: 'Database connection failed. Please check server configuration.' });
    }

    res.status(500).json({
      error: 'Server error during Google registration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/superadmin/overview', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalSuperAdmins,
      totalStudents,
      verifiedUsers,
      unverifiedUsers,
      googleUsers,
      deletedAccounts
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'admin' } }),
      User.count({ where: { role: 'super_admin' } }),
      User.count({ where: { role: 'student' } }),
      User.count({ where: { emailVerified: true } }),
      User.count({ where: { emailVerified: false } }),
      User.count({ where: { googleId: { [Op.ne]: null } } }),
      AccountActivityLog.count({ where: { action: 'user_deleted' } })
    ]);

    const localUsers = totalUsers - googleUsers;

    const [recentActivity, recentRegistrations, recentDeletions] = await Promise.all([
      AccountActivityLog.findAll({
        order: [['createdAt', 'DESC']],
        limit: 20
      }),
      AccountActivityLog.findAll({
        where: { action: 'user_registered' },
        order: [['createdAt', 'DESC']],
        limit: 5
      }),
      AccountActivityLog.findAll({
        where: { action: 'user_deleted' },
        order: [['createdAt', 'DESC']],
        limit: 5
      })
    ]);

    const rangeStart = new Date();
    rangeStart.setHours(0, 0, 0, 0);
    rangeStart.setDate(rangeStart.getDate() - 29);

    const timelineLogs = await AccountActivityLog.findAll({
      where: {
        action: { [Op.in]: ['user_registered', 'user_deleted'] },
        createdAt: { [Op.gte]: rangeStart }
      },
      order: [['createdAt', 'ASC']]
    });

    const timelineMap = {};
    for (let i = 0; i < 30; i++) {
      const day = new Date(rangeStart);
      day.setDate(rangeStart.getDate() + i);
      const key = day.toISOString().substring(0, 10);
      timelineMap[key] = { date: key, registrations: 0, deletions: 0 };
    }

    timelineLogs.forEach((log) => {
      const key = log.createdAt.toISOString().substring(0, 10);
      if (!timelineMap[key]) {
        timelineMap[key] = { date: key, registrations: 0, deletions: 0 };
      }
      if (log.action === 'user_registered') {
        timelineMap[key].registrations += 1;
      } else if (log.action === 'user_deleted') {
        timelineMap[key].deletions += 1;
      }
    });

    const formatLog = (log) => ({
      id: log.id,
      action: log.action,
      email: log.email,
      metadata: log.metadata || {},
      createdAt: log.createdAt
    });

    res.json({
      metrics: {
        totalUsers,
        totalAdmins,
        totalSuperAdmins,
        totalStudents,
        verifiedUsers,
        unverifiedUsers,
        googleUsers,
        localUsers,
        deletedAccounts
      },
      timeline: Object.values(timelineMap),
      recentActivity: recentActivity.map(formatLog),
      recentRegistrations: recentRegistrations.map(formatLog),
      recentDeletions: recentDeletions.map(formatLog)
    });
  } catch (error) {
    console.error('Super admin overview error:', error);
    res.status(500).json({ error: 'Failed to load super admin overview data' });
  }
});

app.get('/api/superadmin/users', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const where = {};

    if (role && ['admin', 'student', 'super_admin'].includes(role)) {
      where.role = role;
    }

    if (status === 'blocked') {
      where.isBlocked = true;
    } else if (status === 'active') {
      where.isBlocked = false;
    }

    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { name: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'email', 'role', 'emailVerified', 'isBlocked', 'createdAt', 'updatedAt']
    });

    res.json({ users });
  } catch (error) {
    console.error('Super admin fetch users error:', error);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

app.post('/api/superadmin/users', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, role = 'admin', emailVerified = true } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!['admin', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Super admin can create admin or student accounts.' });
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const hashedPassword = await User.hashPassword(password);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      emailVerified: !!emailVerified,
      emailVerifiedAt: emailVerified ? new Date() : null,
      isBlocked: false
    });

    await logAccountActivity('user_created_superadmin', {
      userId: newUser.id,
      email: newUser.email,
      metadata: {
        createdBy: req.user.email,
        role
      }
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        emailVerified: newUser.emailVerified,
        isBlocked: newUser.isBlocked,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      }
    });
  } catch (error) {
    console.error('Super admin create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.patch('/api/superadmin/users/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, emailVerified, isBlocked } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Super admin account cannot be modified via this endpoint.' });
    }

    const updates = {};
    if (typeof name === 'string' && name.trim()) {
      updates.name = name.trim();
    }

    if (role) {
      if (!['admin', 'student'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role update requested.' });
      }
      updates.role = role;
    }

    if (typeof emailVerified === 'boolean') {
      updates.emailVerified = emailVerified;
      updates.emailVerifiedAt = emailVerified ? new Date() : null;
    }

    let blockedChanged = false;
    if (typeof isBlocked === 'boolean') {
      if (user.isBlocked !== isBlocked) {
        blockedChanged = true;
      }
      updates.isBlocked = isBlocked;
    }

    await user.update(updates);

    if (blockedChanged) {
      await logAccountActivity(isBlocked ? 'user_blocked' : 'user_unblocked', {
        userId: user.id,
        email: user.email,
        metadata: {
          updatedBy: req.user.email
        }
      });
    } else {
      await logAccountActivity('user_updated_superadmin', {
        userId: user.id,
        email: user.email,
        metadata: {
          updatedBy: req.user.email,
          updates
        }
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Super admin update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/superadmin/users/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Super admin accounts cannot be deleted.' });
    }

    await logAccountActivity('user_deleted_superadmin', {
      userId: user.id,
      email: user.email,
      metadata: {
        deletedBy: req.user.email
      }
    });

    await PasswordResetToken.destroy({ where: { email: user.email.toLowerCase() } });
    await EmailVerificationToken.destroy({ where: { email: user.email.toLowerCase() } });
    await user.destroy();

    res.json({ success: true });
  } catch (error) {
    console.error('Super admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Google OAuth login endpoint (for existing users)
app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleToken, name, email, picture } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    let user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Account not found. Please sign up first.',
        requiresRegistration: true
      });
    }

    // Update user if they log in with Google (update googleId and picture if needed)
    if (!user.googleId) {
      user.googleId = googleToken;
    }
    if (picture && !user.picture) {
      user.picture = picture;
    }
    if (!user.role) {
      user.role = 'student';
    }
    await user.save();

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        error: 'Please verify your email address before logging in. Check your inbox for the verification link.',
        requiresVerification: true
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture || picture
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Server error during Google authentication' });
  }
});

// Dashboard Routes
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  res.json(stats);
});

app.get('/api/dashboard/trends', authenticateToken, (req, res) => {
  const trends = [
    { month: 'Jan', applications: 120, approved: 95 },
    { month: 'Feb', applications: 145, approved: 112 },
    { month: 'Mar', applications: 180, approved: 140 },
    { month: 'Apr', applications: 165, approved: 130 },
    { month: 'May', applications: 200, approved: 165 },
    { month: 'Jun', applications: 225, approved: 180 }
  ];
  res.json(trends);
});

app.get('/api/dashboard/activities', authenticateToken, (req, res) => {
  res.json(activities.slice(0, 10));
});

// Students Routes
app.get('/api/students', authenticateToken, (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  let filtered = [...students];

  if (search) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toString().includes(search)
    );
  }

  if (status) {
    filtered = filtered.filter(s => s.status === status);
  }

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);

  res.json({
    students: filtered.slice(start, end),
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

app.get('/api/students/:id', authenticateToken, (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  res.json(student);
});

app.post('/api/students', authenticateToken, (req, res) => {
  const newStudent = {
    id: students.length + 1,
    ...req.body,
    status: req.body.status || 'Active',
    createdAt: new Date().toISOString()
  };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', authenticateToken, (req, res) => {
  const index = students.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }
  students[index] = { ...students[index], ...req.body };
  res.json(students[index]);
});

// Applications Routes
app.get('/api/applications', authenticateToken, async (req, res) => {
  const { status, university, page = 1, limit = 12 } = req.query;
  let filtered = [...applications];

  // If user is a student, only show their applications
  const user = await User.findByPk(req.user.id);
  if (user && user.role === 'student') {
    filtered = filtered.filter(a => a.studentId === req.user.id);
  }

  if (status) {
    filtered = filtered.filter(a => a.status === status);
  }

  if (university) {
    filtered = filtered.filter(a =>
      a.university.toLowerCase().includes(university.toLowerCase())
    );
  }

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);

  res.json({
    applications: filtered.slice(start, end),
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

app.get('/api/applications/:id', authenticateToken, (req, res) => {
  const application = applications.find(a => a.id === parseInt(req.params.id));
  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }
  res.json(application);
});

app.put('/api/applications/:id/approve', authenticateToken, async (req, res) => {
  // Only admin can approve applications
  const user = await User.findByPk(req.user.id);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can approve applications' });
  }

  const index = applications.findIndex(a => a.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }
  applications[index].status = 'Approved';
  applications[index].approvedAt = new Date().toISOString();
  res.json(applications[index]);
});

// Loan Application Routes
let loanApplications = [];

app.post('/api/loans/apply', authenticateToken, async (req, res) => {
  try {
    const { amount, purpose, duration, cibilScore, pan } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user || user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can apply for loans' });
    }

    if (!amount || !purpose || !cibilScore || !pan) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newLoan = {
      id: loanApplications.length + 1,
      userId: req.user.id,
      studentName: user.name,
      studentEmail: user.email,
      amount: parseInt(amount),
      purpose,
      duration: parseInt(duration),
      cibilScore: parseInt(cibilScore),
      pan: pan.toUpperCase(),
      status: 'Pending',
      appliedDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    loanApplications.push(newLoan);

    res.status(201).json({
      success: true,
      loan: newLoan
    });
  } catch (error) {
    console.error('Loan application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/loans/my-applications', authenticateToken, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (user && user.role === 'student') {
    const myLoans = loanApplications.filter(l => l.userId === req.user.id);
    res.json({ applications: myLoans });
  } else {
    res.json({ applications: [] });
  }
});

app.get('/api/loans/all', authenticateToken, async (req, res) => {
  // Only admin can see all loans
  const user = await User.findByPk(req.user.id);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can view all loans' });
  }

  const { status, page = 1, limit = 20 } = req.query;
  let filtered = [...loanApplications];

  if (status) {
    filtered = filtered.filter(l => l.status === status);
  }

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);

  res.json({
    loans: filtered.slice(start, end),
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

app.put('/api/loans/:id/approve', authenticateToken, async (req, res) => {
  // Only admin can approve loans
  const user = await User.findByPk(req.user.id);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can approve loans' });
  }

  const index = loanApplications.findIndex(l => l.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Loan application not found' });
  }
  loanApplications[index].status = 'Approved';
  loanApplications[index].approvedAt = new Date().toISOString();
  res.json(loanApplications[index]);
});

// CIBIL Score Check Endpoint
app.post('/api/cibil/check', authenticateToken, async (req, res) => {
  try {
    const { pan } = req.body;

    if (!pan) {
      return res.status(400).json({ error: 'PAN number is required' });
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid PAN format' });
    }

    // TODO: For production, integrate with real CIBIL API here
    // Example:
    // const cibilResponse = await axios.post('https://api.cibil.com/score', {
    //   pan: pan.toUpperCase(),
    //   apiKey: process.env.CIBIL_API_KEY
    // });

    // For now: Generate a deterministic score based on PAN for demo
    // This ensures same PAN always returns same score (for demo consistency)
    const panHash = pan.toUpperCase().split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    // Generate score between 550-850 based on PAN hash (deterministic)
    const score = 550 + (panHash % 300);

    // Categorize score
    let status, eligibility;
    if (score >= 750) {
      status = 'Excellent';
      eligibility = true;
    } else if (score >= 650) {
      status = 'Good';
      eligibility = true;
    } else if (score >= 550) {
      status = 'Fair';
      eligibility = false;
    } else {
      status = 'Poor';
      eligibility = false;
    }

    res.json({
      success: true,
      score,
      pan: pan.toUpperCase(),
      status,
      eligibility,
      message: 'CIBIL score fetched successfully'
    });
  } catch (error) {
    console.error('CIBIL check error:', error);
    res.status(500).json({ error: 'Failed to fetch CIBIL score' });
  }
});

// Universities Routes
app.get('/api/universities', authenticateToken, (req, res) => {
  const { search } = req.query;
  let filtered = [...universities];

  if (search) {
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.location.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json(filtered);
});

app.get('/api/universities/:id', authenticateToken, (req, res) => {
  const university = universities.find(u => u.id === parseInt(req.params.id));
  if (!university) {
    return res.status(404).json({ error: 'University not found' });
  }
  res.json(university);
});

// Reports Routes
app.get('/api/reports/analytics', authenticateToken, (req, res) => {
  const analytics = {
    byStatus: [
      { name: 'Approved', value: stats.approved, color: '#10b981' },
      { name: 'Pending', value: stats.pending, color: '#f59e0b' },
      { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
    ],
    byUniversity: universities.slice(0, 5).map(u => ({
      name: u.name,
      applications: u.applications || Math.floor(Math.random() * 50) + 10
    })),
    performance: {
      approvalRate: ((stats.approved / stats.applications) * 100).toFixed(1),
      averageProcessingTime: '2.5 days',
      topPerformingMonth: 'June'
    }
  };
  res.json(analytics);
});

// Settings Routes
app.get('/api/settings', authenticateToken, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    profile: {
      name: user.name,
      email: user.email
    },
    preferences: {
      notifications: true,
      emailAlerts: true,
      darkMode: false
    }
  });
});

app.put('/api/settings', authenticateToken, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (req.body.profile) {
    user.name = req.body.profile.name || user.name;
    await user.save();
  }
  res.json({ success: true });
});

// Set initial password for Google users (no current password required)
app.post('/api/auth/set-password', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Super admin password cannot be modified.' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Validate password strength with all requirements
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[^a-zA-Z\d]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: errors[0], // Return first error
        allErrors: errors // Return all errors for detailed feedback
      });
    }

    // Allow setting/updating password for Google users
    // If password already exists, we'll update it (useful if user wants to change it)
    if (user.password) {
      console.log('⚠️ User already has a password, updating it...');
    }

    // Set/update the password
    user.password = await User.hashPassword(password);
    await user.save();

    console.log('✅ Password set/updated successfully for user:', user.email);

    if (!user.welcomeEmailSent) {
      try {
        await emailService.sendWelcomeEmail(user.email, user.name);
        user.welcomeEmailSent = true;
        await user.save();
        console.log('🎉 Welcome email sent to new user:', user.email);
      } catch (welcomeEmailError) {
        console.error('Failed to send welcome email:', welcomeEmailError);
      }
    }

    res.json({
      success: true,
      message: 'Password set successfully! You can now login with your email and password.'
    });
  } catch (error) {
    console.error('Set password error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Failed to set password',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/settings/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.role === 'super_admin') {
    return res.status(403).json({ error: 'Super admin password cannot be changed programmatically.' });
  }

  if (!user.password) {
    return res.status(400).json({ error: 'This account does not have a password set' });
  }

  const validPassword = await user.checkPassword(currentPassword);
  if (!validPassword) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  user.password = await User.hashPassword(newPassword);
  await user.save();
  res.json({ success: true });
});

// Forgot Password - Generate reset token
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    // Check if email exists - if not, return error asking user to create account
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'No account found with this email address. Please create an account first.',
        emailNotFound: true
      });
    }

    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Super admin password cannot be reset. Contact the system owner.' });
    }

    // Check if user has a password (Google users don't have passwords)
    if (!user.password) {
      return res.status(400).json({
        error: 'This account was created with Google. Please use Google Sign-In.'
      });
    }

    // User exists and has a password - proceed with password reset
    // Delete any existing reset tokens for this email
    await PasswordResetToken.destroy({
      where: { email: user.email.toLowerCase() }
    });

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in database
    await PasswordResetToken.create({
      token,
      email: user.email.toLowerCase(),
      expiresAt,
      used: false
    });

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, user.name, token);
      console.log('✅ Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue - still return success for security (don't reveal if email failed)
    }

    res.json({
      success: true,
      message: 'Password reset link has been sent to your email.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Verify Reset Token
app.post('/api/auth/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required', valid: false });
    }

    const tokenData = await PasswordResetToken.findOne({
      where: { token }
    });

    if (!tokenData) {
      return res.json({ valid: false, error: 'Invalid or expired reset token' });
    }

    if (tokenData.used) {
      return res.json({ valid: false, error: 'Reset token has already been used' });
    }

    if (new Date() > tokenData.expiresAt) {
      await tokenData.destroy();
      return res.json({ valid: false, error: 'Reset token has expired' });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Failed to verify token', valid: false });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const tokenData = await PasswordResetToken.findOne({
      where: { token }
    });

    if (!tokenData) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (tokenData.used) {
      return res.status(400).json({ error: 'Reset token has already been used' });
    }

    if (new Date() > tokenData.expiresAt) {
      await tokenData.destroy();
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Find user and update password
    const user = await User.findOne({
      where: { email: tokenData.email.toLowerCase() }
    });

    if (!user) {
      await tokenData.destroy();
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Super admin password cannot be reset.' });
    }

    // Hash and update password
    user.password = await User.hashPassword(password);

    // Automatically verify email since user has proven email ownership by clicking reset link
    if (!user.emailVerified) {
      user.emailVerified = true;
      user.emailVerifiedAt = new Date();
      console.log('✅ Email automatically verified during password reset for:', user.email);
    }

    await user.save();

    // Mark token as used and delete it
    await tokenData.destroy();

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Email Verification - Verify email token
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    console.log('🔵 Email verification request received');
    console.log('Token received:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

    if (!token) {
      console.error('❌ No token provided in request');
      return res.status(400).json({ error: 'Verification token is required', valid: false });
    }

    // The token from the URL should already be decoded by the browser
    // But let's try multiple approaches to be safe
    console.log('Looking for token in database...');
    console.log('Token received length:', token?.length);
    console.log('Token first 40 chars:', token ? token.substring(0, 40) : 'NO TOKEN');

    // Try 1: Use token as-is (most likely - browser already decoded it)
    let tokenData = await EmailVerificationToken.findOne({
      where: { token }
    });

    console.log('Token search attempt 1 (as-is):', tokenData ? 'FOUND' : 'NOT FOUND');

    // Try 2: Decode it (in case it's still encoded)
    let decodedToken = token;
    if (!tokenData) {
      try {
        decodedToken = decodeURIComponent(token);
        console.log('Decoded token (first 30):', decodedToken ? `${decodedToken.substring(0, 30)}...` : 'NO TOKEN');
        console.log('Decoded token length:', decodedToken?.length);
        if (decodedToken !== token) {
          console.log('Token was encoded, trying with decoded token...');
          tokenData = await EmailVerificationToken.findOne({
            where: { token: decodedToken }
          });
          console.log('Token search attempt 2 (decoded):', tokenData ? 'FOUND' : 'NOT FOUND');
        }
      } catch (e) {
        console.log('Decoding failed:', e.message);
        decodedToken = token; // Use original if decoding fails
      }
    }

    // Try 3: Try double decoding (in case it was encoded twice)
    if (!tokenData) {
      try {
        const doubleDecoded = decodeURIComponent(decodedToken);
        if (doubleDecoded !== token && doubleDecoded !== decodedToken) {
          console.log('Trying with double-decoded token...');
          tokenData = await EmailVerificationToken.findOne({
            where: { token: doubleDecoded }
          });
          console.log('Token search attempt 3 (double-decoded):', tokenData ? 'FOUND' : 'NOT FOUND');
        }
      } catch (e) {
        console.log('Double decoding failed:', e.message);
        // Ignore decoding errors
      }
    }

    // Try 4: Case-insensitive search (using Sequelize.where)
    if (!tokenData) {
      try {
        const Sequelize = require('sequelize');
        console.log('Trying case-insensitive search...');
        tokenData = await EmailVerificationToken.findOne({
          where: Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('token')),
            Sequelize.fn('LOWER', token)
          )
        });
      } catch (e) {
        console.error('Case-insensitive search error:', e);
      }
    }

    // Debug: List all tokens (only in development)
    if (!tokenData && process.env.NODE_ENV === 'development') {
      try {
        const allTokens = await EmailVerificationToken.findAll({
          where: { used: false },
          limit: 10,
          order: [['createdAt', 'DESC']]
        });
        console.log('Recent unused tokens in database:');
        allTokens.forEach((t, idx) => {
          console.log(`  ${idx + 1}. Email: ${t.email}, Token: ${t.token.substring(0, 30)}..., Used: ${t.used}, Expires: ${t.expiresAt}`);
        });

        // Also try to find by email if we can extract it from the token somehow
        // Or search for tokens that match the beginning
        if (decodedToken && decodedToken.length > 10) {
          const Sequelize = require('sequelize');
          const partialMatch = await EmailVerificationToken.findAll({
            where: {
              token: {
                [Sequelize.Op.like]: `${decodedToken.substring(0, 20)}%`
              }
            },
            limit: 5
          });
          if (partialMatch.length > 0) {
            console.log('Found tokens with partial match:');
            partialMatch.forEach((t, idx) => {
              console.log(`  ${idx + 1}. Full token: ${t.token}, Email: ${t.email}`);
            });
          }
        }
      } catch (dbError) {
        console.error('Error querying tokens:', dbError);
      }
    }

    if (!tokenData) {
      console.error('❌ Token not found in database after all attempts');
      console.error('Original token received:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
      console.error('Decoded token:', decodedToken ? `${decodedToken.substring(0, 30)}...` : 'NO TOKEN');
      console.error('Original token length:', token?.length);
      console.error('Decoded token length:', decodedToken?.length);
      console.error('Tokens match?', token === decodedToken);

      // Try to find by email if we can extract it from the request or check recent tokens
      if (process.env.NODE_ENV === 'development') {
        try {
          const recentTokens = await EmailVerificationToken.findAll({
            where: { used: false },
            limit: 10,
            order: [['createdAt', 'DESC']]
          });
          console.error('Recent unused tokens in database:');
          recentTokens.forEach((t, idx) => {
            console.error(`  ${idx + 1}. Email: ${t.email}, Token: ${t.token.substring(0, 30)}..., Token length: ${t.token.length}, Created: ${t.createdAt}`);
            // Compare first 30 chars
            if (decodedToken && decodedToken.length > 30) {
              const matches = t.token.substring(0, 30) === decodedToken.substring(0, 30);
              console.error(`    First 30 chars match? ${matches}`);
            }
          });

          // Also try exact match with the stored token
          if (decodedToken) {
            const exactMatch = recentTokens.find(t => t.token === decodedToken);
            if (exactMatch) {
              console.error('✅ Found exact match in recent tokens!');
              tokenData = exactMatch;
            }
          }
        } catch (dbError) {
          console.error('Error querying recent tokens:', dbError);
        }
      }

      if (!tokenData) {
        return res.json({ valid: false, error: 'Invalid or expired verification token' });
      }
    }

    console.log('✅ Token found in database');

    if (tokenData.used) {
      console.error('❌ Token has already been used');
      return res.json({ valid: false, error: 'This verification link has already been used' });
    }

    const now = new Date();
    const expiresAt = new Date(tokenData.expiresAt);
    console.log('Token expires at:', expiresAt);
    console.log('Current time:', now);

    if (now > expiresAt) {
      console.error('❌ Token has expired');
      await tokenData.destroy();
      return res.json({ valid: false, error: 'Verification token has expired. Please request a new one.' });
    }

    // Find user and mark email as verified
    console.log('Looking for user with email:', tokenData.email);
    const user = await User.findOne({
      where: { email: tokenData.email.toLowerCase() }
    });

    if (!user) {
      console.error('❌ User not found for email:', tokenData.email);
      await tokenData.destroy();
      return res.json({ valid: false, error: 'User not found' });
    }

    console.log('✅ User found:', user.email);

    // Update user
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();
    console.log('✅ User email verified');

    try {
      const leadRecord = await StudentLead.findOne({ where: { email: user.email.toLowerCase() } });
      if (leadRecord) {
        leadRecord.status = 'converted';
        leadRecord.convertedUserId = user.id;
        leadRecord.convertedAt = new Date();
        await leadRecord.save();
      }
    } catch (leadUpdateError) {
      console.error('⚠️ Failed to update lead status after verification:', leadUpdateError);
    }

    // Mark token as used
    await tokenData.destroy();
    console.log('✅ Token marked as used and deleted');

    // Generate JWT token for auto-login
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      valid: true,
      success: true,
      message: 'Email verified successfully!',
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: true,
        hasPassword: !!user.password, // Indicate if user has a password set
        isGoogleUser: !!user.googleId // Indicate if this is a Google user
      }
    });
  } catch (error) {
    console.error('❌ Verify email error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Failed to verify email',
      valid: false,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Resend verification email
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // For security, don't reveal if email exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Delete old tokens
    await EmailVerificationToken.destroy({
      where: { email: user.email.toLowerCase() }
    });

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await EmailVerificationToken.create({
      token: verificationToken,
      email: user.email.toLowerCase(),
      expiresAt,
      used: false
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// Get current user info with status
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        emailVerified: user.emailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
        profileVerified: user.profileVerified || false,
        documentsSubmitted: user.documentsSubmitted || false,
        hasPassword: !!user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

// Mark verification message as seen
app.post('/api/auth/mark-verification-seen', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user) {
      // For now, we'll just return success
      // In future, you can add a hasSeenVerificationMessage field to User model
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Mark verification seen error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed'));
    }
  }
});

app.post('/api/documents/upload', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { documentId, category } = req.body;

    // Here you would typically save document metadata to database
    // For now, we'll just return success with file info

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: documentId,
        fileName: req.file.originalname,
        filePath: `/uploads/documents/${req.file.filename}`,
        fileSize: req.file.size,
        category: category,
        uploadedAt: new Date()
      },
      url: `/uploads/documents/${req.file.filename}`
    });
  } catch (error) {
    console.error('Document upload error:', error);
  }
});

// Configure Multer for profile pictures
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename: user-id-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

app.post('/api/auth/upload-profile-picture', authenticateToken, profileUpload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create URL path for the file (assuming we serve uploads statically)
    // We already have: app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    // So if file is in ../uploads/profiles/foo.jpg, url is /uploads/profiles/foo.jpg
    const profilePictureUrl = `/uploads/profiles/${req.file.filename}`;

    user.picture = profilePictureUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      picture: profilePictureUrl
    });

  } catch (error) {
    console.error('Profile upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Delete account endpoint
app.delete('/api/auth/delete-account', authenticateToken, async (req, res) => {
  try {
    const { email, confirmationText } = req.body;

    // Find user first to get their email
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate confirmation text format: {user_email}-delete
    const expectedText = `${user.email}-delete`;
    if (confirmationText !== expectedText) {
      return res.status(400).json({
        error: `Confirmation text does not match. Please type "${expectedText}" exactly.`
      });
    }

    // Verify email matches
    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ error: 'Email does not match your account email' });
    }

    // Delete related tokens first
    await PasswordResetToken.destroy({ where: { email: user.email.toLowerCase() } });
    await EmailVerificationToken.destroy({ where: { email: user.email.toLowerCase() } });

    await logAccountActivity('user_deleted', {
      userId: user.id,
      email: user.email,
      metadata: {
        initiatedBy: 'self_service'
      }
    });

    // Delete user account
    await user.destroy();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account. Please try again.' });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔄 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Database connected and ready`);
      console.log(`✅ Ready to accept registration requests`);
      console.log(`\n📝 Test registration endpoint: POST http://localhost:${PORT}/api/auth/register`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('\n💡 Common issues:');
    console.error('   1. PostgreSQL not running');
    console.error('   2. Database "kubera_db" does not exist');
    console.error('   3. Wrong database credentials in .env file');
    console.error('   4. Database port 5432 is blocked\n');
    process.exit(1);
  }
}

startServer();
