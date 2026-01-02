const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // For development without SMTP config, use console logging
  // If SMTP_HOST is set, always send real emails (even in development)
  if (!process.env.SMTP_HOST) {
    return {
      sendMail: async (options) => {
        console.log('\n📧 ========== EMAIL SENT ==========');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        
        // Extract and display verification/reset links from HTML
        const html = options.html || '';
        const linkMatch = html.match(/href="([^"]+)"/g);
        if (linkMatch && linkMatch.length > 0) {
          const links = linkMatch.map(match => match.replace('href="', '').replace('"', ''));
          console.log('\n🔗 VERIFICATION/RESET LINK(S):');
          links.forEach((link, index) => {
            console.log(`   ${index + 1}. ${link}`);
          });
        }
        
        // Also show the full body for reference
        console.log('\n📄 Full Email Body (HTML):');
        console.log('────────────────────────────────────────');
        const textBody = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        console.log(textBody.substring(0, 500) + (textBody.length > 500 ? '...' : ''));
        console.log('────────────────────────────────────────\n');
        return { messageId: `dev-${Date.now()}` };
      }
    };
  }

  // Production email configuration
  const transporterConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    // Add connection timeout and debug options
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
    debug: process.env.NODE_ENV === 'development', // Enable debug logging in development
    logger: process.env.NODE_ENV === 'development' // Enable logger in development
  };

  console.log('📧 SMTP Configuration:', {
    host: transporterConfig.host,
    port: transporterConfig.port,
    secure: transporterConfig.secure,
    user: transporterConfig.auth.user,
    hasPassword: !!transporterConfig.auth.pass
  });

  return nodemailer.createTransport(transporterConfig);
};

const transporter = createTransporter();

/**
 * Send email verification email with login link
 */
exports.sendVerificationEmail = async (email, name, verificationToken, includeLoginLink = false) => {
  // URL encode the token to handle special characters
  const encodedToken = encodeURIComponent(verificationToken);
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${encodedToken}`;
  
  // Dedicated login URL (not included as a button in this email)
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
  
  // Log the verification link clearly for development
  console.log('\n🔗 ========== VERIFICATION LINK ==========');
  console.log(`Email: ${email}`);
  console.log(`Token (raw): ${verificationToken.substring(0, 30)}...`);
  console.log(`Token (encoded): ${encodedToken.substring(0, 30)}...`);
  console.log(`Verification Link: ${verificationUrl}`);
  // We still log the login URL for reference in dev, but only one button is shown in email
  console.log(`Login Link (for reference): ${loginUrl}`);
  console.log('===========================================\n');

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@kubera.io',
    to: email,
    subject: 'Verify Your Email Address - Kubera',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #86efac 0%, #34d399 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Kubera!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for registering with Kubera! Please verify your email address to complete your registration and access your dashboard.</p>
            <p style="text-align: center;">
              <a
                href="${verificationUrl}"
                class="button"
                style="
                  display:inline-block;
                  padding:12px 30px;
                  background:#16a34a;
                  color:#ffffff !important;
                  text-decoration:none;
                  border-radius:6px;
                  font-weight:600;
                  font-family: Arial, sans-serif;
                "
              >Verify Email Address</a>
            </p>
            <!-- Single-button email: only verification CTA is shown -->
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #16a34a;">${verificationUrl}</p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with Kubera, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Kubera. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${name},
      
      Thank you for registering with Kubera! Please verify your email address by clicking the link below:
      
      ${verificationUrl}
      
      This verification link will expire in 24 hours.
      
      If you didn't create an account with Kubera, please ignore this email.
      
      © ${new Date().getFullYear()} Kubera. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId || 'dev mode');
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  // Log the reset link clearly for development
  console.log('\n🔗 ========== PASSWORD RESET LINK ==========');
  console.log(`Email: ${email}`);
  console.log(`Link: ${resetUrl}`);
  console.log('===========================================\n');

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@kubera.io',
    to: email,
    subject: 'Reset Your Password - Kubera',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0; color: #991b1b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </div>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Kubera. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${name},
      
      You requested to reset your password. Click the link below to create a new password:
      
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email and your password will remain unchanged.
      
      © ${new Date().getFullYear()} Kubera. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId || 'dev mode');
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send welcome email after successful onboarding
 */
exports.sendWelcomeEmail = async (email, name) => {
  console.log('\n🎉 ========== WELCOME EMAIL ==========');
  console.log(`To: ${email}`);
  console.log('Subject: Welcome to Kubera');
  console.log('===========================================\n');

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@kubera.io',
    to: email,
    subject: 'Welcome to Kubera!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #86efac 0%, #34d399 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Kubera, ${name || 'there'}!</h1>
          </div>
          <div class="content">
            <p>Hi ${name || 'there'},</p>
            <p>We’re thrilled to have you join the Kubera community. Your account has been set up successfully, and you’re all set to explore everything we’ve built to support your journey.</p>
            <p>Here’s what you can do right away:</p>
            <ul>
              <li>Log in to your account: <a href="${(process.env.FRONTEND_URL || 'http://localhost:3000') + '/login'}">${(process.env.FRONTEND_URL || 'http://localhost:3000') + '/login'}</a></li>
              <li>Track your progress and manage your profile with ease</li>
              <li>Reach out to our team if you need a hand—we’re happy to help!</li>
            </ul>
            <div style="text-align:center;">
              <a
                href="${(process.env.FRONTEND_URL || 'http://localhost:3000') + '/login'}"
                class="button"
                style="
                  display:inline-block;
                  padding:12px 30px;
                  background:#16a34a;
                  color:#ffffff !important;
                  text-decoration:none;
                  border-radius:6px;
                  font-weight:600;
                  font-family: Arial, sans-serif;
                "
              >Go to Login</a>
            </div>
            <p>If you have any questions, just reply to this email. We’re always here for you.</p>
            <p>Cheers,<br/>The Kubera Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Kubera. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${name || 'there'},

      Welcome to Kubera! Your account has been set up successfully and you’re ready to get started.

      Log in at ${(process.env.FRONTEND_URL || 'http://localhost:3000') + '/login'} to explore your account.

      If you ever need support, just reply to this email—we’re here to help.

      Cheers,
      The Kubera Team

      © ${new Date().getFullYear()} Kubera. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId || 'dev mode');
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
};

/**
 * Send enquiry confirmation email to student
 */
exports.sendEnquiryConfirmationEmail = async (email, name, leadDetails = {}) => {
  console.log('\n📧 ========== ENQUIRY CONFIRMATION EMAIL ==========');
  console.log(`To: ${email}`);
  console.log('Subject: Thank You for Your Enquiry - Kubera');
  console.log('===========================================\n');

  const { studyCountry, intake, loanRange } = leadDetails;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@kubera.io',
    to: email,
    subject: 'Thank You for Your Enquiry - Kubera',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
          .details-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .detail-item { margin: 10px 0; }
          .detail-label { font-weight: bold; color: #15803d; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .cta-button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Enquiry!</h1>
          </div>
          <div class="content">
            <p>Hi ${name || 'there'},</p>
            <p>We've received your education loan enquiry and are excited to help you fund your study abroad dreams!</p>
            
            ${studyCountry || intake || loanRange ? `
            <div class="details-box">
              <h3 style="margin-top: 0; color: #15803d;">Your Enquiry Details:</h3>
              ${studyCountry ? `<div class="detail-item"><span class="detail-label">Study Country:</span> ${studyCountry}</div>` : ''}
              ${intake ? `<div class="detail-item"><span class="detail-label">Intake:</span> ${intake}</div>` : ''}
              ${loanRange ? `<div class="detail-item"><span class="detail-label">Loan Range:</span> ${loanRange}</div>` : ''}
            </div>
            ` : ''}
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our team will review your enquiry within 24 hours</li>
              <li>You'll receive personalized loan options tailored to your needs</li>
              <li>We'll guide you through the entire application process</li>
            </ul>
            
            <p>In the meantime, feel free to explore our platform and learn more about our loan offerings.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="cta-button">Visit Our Website</a>
            </div>
            
            <p>If you have any questions or need immediate assistance, please don't hesitate to contact us. We're here to help you every step of the way!</p>
            
            <p>Best regards,<br/><strong>The Kubera Team</strong></p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            <p style="font-size: 12px; color: #666;">This is an automated confirmation email. Please do not reply to this message.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Kubera. All rights reserved.</p>
            <p>Follow us: <a href="#">Instagram</a> | <a href="#">LinkedIn</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Thank You for Your Enquiry - Kubera

      Hi ${name || 'there'},

      We've received your education loan enquiry and are excited to help you fund your study abroad dreams!

      ${studyCountry || intake || loanRange ? `
      Your Enquiry Details:
      ${studyCountry ? `Study Country: ${studyCountry}` : ''}
      ${intake ? `Intake: ${intake}` : ''}
      ${loanRange ? `Loan Range: ${loanRange}` : ''}
      ` : ''}

      What happens next?
      - Our team will review your enquiry within 24 hours
      - You'll receive personalized loan options tailored to your needs
      - We'll guide you through the entire application process

      In the meantime, feel free to explore our platform at ${process.env.FRONTEND_URL || 'http://localhost:3000'}

      If you have any questions or need immediate assistance, please don't hesitate to contact us. We're here to help you every step of the way!

      Best regards,
      The Kubera Team

      © ${new Date().getFullYear()} Kubera. All rights reserved.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Enquiry confirmation email sent:', info.messageId || 'dev mode');
    console.log('   Response:', info.response || 'Email queued');
    return true;
  } catch (error) {
    console.error('❌ Error sending enquiry confirmation email:');
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    if (error.response) {
      console.error('   SMTP Response:', error.response);
    }
    if (error.responseCode) {
      console.error('   Response Code:', error.responseCode);
    }
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      console.error('   💡 Tip: Check your SMTP_USER and SMTP_PASS in .env file');
      console.error('   For Gmail: Use App Password, not your regular password');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('   💡 Tip: Check your internet connection and SMTP server settings');
    }
    throw error;
  }
};

module.exports = exports;
