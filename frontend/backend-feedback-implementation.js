// Backend implementation suggestion for email feedback
// Add this to your backend server (e.g., Express.js)

// 1. Install required dependencies:
// npm install nodemailer express-rate-limit express-validator

const express = require('express');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Rate limiting for feedback endpoint
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 feedback submissions per windowMs
  message: {
    success: false,
    error: 'Too many feedback submissions. Please try again later.'
  }
});

// Email configuration (use environment variables)
const transporter = nodemailer.createTransporter({
  // Option 1: Gmail SMTP (recommended for hosted apps)
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (not regular password)
  }
  
  // Option 2: Outlook/Hotmail SMTP
  // service: 'hotmail',
  // auth: {
  //   user: process.env.OUTLOOK_USER,
  //   pass: process.env.OUTLOOK_PASSWORD
  // }
  
  // Option 3: Custom SMTP (for business email)
  // host: process.env.SMTP_HOST,
  // port: 587,
  // secure: false,
  // auth: {
  //   user: process.env.SMTP_USER,
  //   pass: process.env.SMTP_PASSWORD
  // }
});

// Validation middleware
const validateFeedback = [
  body('name').trim().isLength({ min: 1, max: 100 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('subject').optional().trim().isLength({ max: 200 }).escape(),
  body('message').trim().isLength({ min: 10, max: 2000 }).escape(),
  body('category').isIn(['bug', 'feature', 'improvement', 'question', 'other'])
];

// Feedback endpoint
app.post('/api/feedback', feedbackLimiter, validateFeedback, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, subject, message, category } = req.body;
    
    // Category emojis
    const categoryEmojis = {
      bug: '🐛',
      feature: '✨',
      improvement: '📈',
      question: '❓',
      other: '💬'
    };

    // Prepare email content
    const emailSubject = `[WKI App Feedback] ${categoryEmojis[category]} ${subject || category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    const emailBody = `
<h2>New Feedback from WKI Service Management App</h2>

<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Category:</strong> ${categoryEmojis[category]} ${category.charAt(0).toUpperCase() + category.slice(1)}</p>
<p><strong>Subject:</strong> ${subject || 'No subject provided'}</p>

<h3>Message:</h3>
<div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;">
${message.replace(/\n/g, '<br>')}
</div>

<hr>
<p style="color: #666; font-size: 12px;">
<strong>Sent from:</strong> WKI Service Management App<br>
<strong>Time:</strong> ${new Date().toISOString()}<br>
<strong>IP Address:</strong> ${req.ip}<br>
<strong>User Agent:</strong> ${req.headers['user-agent']}
</p>
    `;

    // Send email
    const mailOptions = {
      from: process.env.GMAIL_USER || 'noreply@wichitakenworth.com',
      to: 'MikeA@WichitaKenworth.com',
      subject: emailSubject,
      html: emailBody,
      replyTo: email // Allow Mike to reply directly to the user
    };

    await transporter.sendMail(mailOptions);

    // Log feedback for analytics (optional)
    console.log(`Feedback submitted: ${category} from ${name} (${email})`);

    res.json({
      success: true,
      message: 'Feedback sent successfully'
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send feedback. Please try again later.'
    });
  }
});

// Environment Variables needed in Render:
/*
Add these environment variables in your Render dashboard:

GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

To get Gmail App Password:
1. Go to your Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate a new app password for "Mail"
4. Use that 16-character password (not your regular Gmail password)
*/
