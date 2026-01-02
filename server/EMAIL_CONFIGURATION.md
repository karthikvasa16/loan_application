# Email Configuration Guide

## Development Mode (Current Setup) ✅

**You DON'T need email credentials for development!**

The email service is configured to **log emails to the console** instead of sending them. This is perfect for testing.

### How it works:
- Emails are printed to your server terminal
- Verification/reset links are shown in the console
- You can copy the links and test them
- **No SMTP setup required**

### Example Console Output:
```
📧 ========== EMAIL SENT ==========
To: user@example.com
Subject: Verify Your Email Address - Adventus
Body: [HTML email with verification link]
Link: http://localhost:3000/verify-email?token=abc123...
=====================================
```

## Production Mode (Real Emails)

**Only enable this when you want to send real emails!**

### Option 1: Gmail (Easiest)

1. **Enable 2-Factor Authentication** on your Gmail account

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Add to `server/.env`:**
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=noreply@yourdomain.com
```

### Option 2: Other Email Services

#### Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

#### AWS SES:
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-smtp-username
SMTP_PASS=your-aws-smtp-password
```

## Current Status

**Right now, you're in development mode - NO credentials needed!**

Emails are automatically logged to your server console. Just:
1. Start your server
2. Register a user
3. Check the server terminal for the email with verification link
4. Copy and paste the link to test

## When to Add Credentials

Only add SMTP credentials when:
- ✅ You want to send real emails to actual users
- ✅ You're deploying to production
- ✅ You want to test with your real email address

**For now, you can keep testing without any email setup!**

## Testing Without Credentials

To test the email verification flow:

1. **Register a new user**
2. **Check server console** - you'll see:
   ```
   📧 ========== EMAIL SENT ==========
   To: user@example.com
   Subject: Verify Your Email Address - Adventus
   Body: [Email content]
   Verification Link: http://localhost:3000/verify-email?token=xyz...
   =====================================
   ```
3. **Copy the verification link** from console
4. **Open it in browser** - email will be verified
5. **User auto-logged in** and redirected to dashboard

## Quick Reference

| Mode | Credentials Needed? | Where Emails Go |
|------|---------------------|-----------------|
| Development | ❌ No | Server Console |
| Production | ✅ Yes | Real Email Addresses |

You're all set for development testing! 🚀





