# Email Verification Setup Guide

## ✅ Implementation Complete!

Email verification and password reset emails are now fully implemented!

## Features Implemented

### 1. **Email Verification on Registration**
- ✅ User registers → Verification email sent automatically
- ✅ User clicks link in email → Email verified → Auto-login → Redirect to dashboard
- ✅ Login blocked until email is verified

### 2. **Password Reset Email**
- ✅ User clicks "Forgot Password" → Reset email sent
- ✅ User clicks link in email → Reset password page opens

### 3. **User Dashboard**
- ✅ StudentDashboard exists at `/dashboard` (user dashboard)
- ✅ After email verification, users are redirected here

## Email Configuration

### Development Mode (Current)
In development, emails are **logged to console** instead of being sent. Check your server terminal for email content and verification links.

Example output:
```
📧 ========== EMAIL SENT ==========
To: user@example.com
Subject: Verify Your Email Address - Adventus
Body: [HTML email content with verification link]
=====================================
```

### Production Mode (Real Emails)

To send real emails, add these to `server/.env`:

```env
# Email Configuration
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# SMTP Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@adventus.io
```

#### Gmail Setup:
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `SMTP_PASS`

#### Other Email Providers:
- **SendGrid**: Use their SMTP settings
- **Mailgun**: Use their SMTP settings
- **AWS SES**: Use their SMTP settings
- **Outlook**: `smtp-mail.outlook.com` port 587

## Flow Overview

### Registration Flow:
```
1. User fills registration form
2. Clicks "Create Account"
3. Backend creates user (emailVerified = false)
4. Verification email sent automatically
5. User sees success message with email icon
6. Redirected to login page
7. User checks email and clicks verification link
8. Email verified → Auto-login → Dashboard
```

### Password Reset Flow:
```
1. User clicks "Forgot Password"
2. Enters email address
3. Backend generates reset token
4. Reset email sent automatically
5. User checks email and clicks reset link
6. Reset password page opens
7. User creates new password
8. Password updated → Can login
```

### Login Flow (Updated):
```
1. User enters credentials
2. Backend checks password
3. Backend checks if emailVerified = true
4. If not verified → Error: "Please verify your email..."
5. If verified → Login successful → Dashboard
```

## API Endpoints

### New Endpoints:
- `POST /api/auth/verify-email` - Verify email token
- `POST /api/auth/resend-verification` - Resend verification email

### Updated Endpoints:
- `POST /api/auth/register` - Now sends verification email
- `POST /api/auth/forgot-password` - Now sends reset email
- `POST /api/auth/login` - Now checks email verification

## Database Changes

### New Table:
- `email_verification_tokens` - Stores verification tokens

### User Model Updates:
- `emailVerified` (BOOLEAN) - Email verification status
- `emailVerifiedAt` (DATE) - When email was verified

## Testing

### Test Registration:
1. Go to `/register`
2. Fill form and submit
3. Check server console for email content
4. Copy verification link from console
5. Open link in browser
6. Should redirect to dashboard

### Test Password Reset:
1. Go to `/forgot-password`
2. Enter email
3. Check server console for reset link
4. Open link in browser
5. Reset password

## Frontend Pages

- ✅ `/register` - Registration with email verification
- ✅ `/verify-email` - Email verification page
- ✅ `/login` - Login (requires verified email)
- ✅ `/forgot-password` - Password reset request
- ✅ `/reset-password` - Reset password page
- ✅ `/dashboard` - User dashboard (StudentDashboard)

## Troubleshooting

### Email not being sent?
- Check server console - emails are logged in development
- Check `.env` has correct SMTP settings (for production)
- Check email service credentials

### Verification link not working?
- Links expire after 24 hours
- Check server console for the actual link
- Token can only be used once

### Login blocked?
- User must verify email first
- Check email inbox (or server console in dev mode)
- Can resend verification email if needed

## Next Steps

For production:
1. Configure real SMTP settings in `.env`
2. Set `NODE_ENV=production`
3. Update `FRONTEND_URL` to your domain
4. Test with real email addresses

Everything is ready! 🎉





