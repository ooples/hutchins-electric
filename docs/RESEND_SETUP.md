# Resend Email Service Setup Guide for Hutchins Electric

This comprehensive guide will walk you through setting up Resend email service for the Hutchins Electric website, from creating an account to implementing best practices for transactional emails.

## Table of Contents

1. [Creating a Free Resend Account](#1-creating-a-free-resend-account)
2. [Getting and Securing the API Key](#2-getting-and-securing-the-api-key)
3. [Adding and Verifying a Custom Domain](#3-adding-and-verifying-a-custom-domain)
4. [Setting Up Email Templates](#4-setting-up-email-templates)
5. [Testing Email Sending](#5-testing-email-sending)
6. [Understanding Free Tier Limits](#6-understanding-free-tier-limits)
7. [Monitoring Email Delivery](#7-monitoring-email-delivery)
8. [Setting Up Email Analytics](#8-setting-up-email-analytics)
9. [Handling Bounces and Complaints](#9-handling-bounces-and-complaints)
10. [Best Practices for Transactional Emails](#10-best-practices-for-transactional-emails)

---

## 1. Creating a Free Resend Account

### Step 1: Visit Resend
1. Go to [resend.com](https://resend.com)
2. Click "Get Started" or "Sign Up"

### Step 2: Sign Up
1. Enter your email address
2. Create a secure password
3. Verify your email address through the confirmation email

### Step 3: Complete Profile Setup
1. Add your company name: "Hutchins Electric"
2. Select your use case: "Transactional emails"
3. Complete any additional onboarding steps

---

## 2. Getting and Securing the API Key

### Step 1: Generate API Key
1. Navigate to the **API Keys** section in your Resend dashboard
2. Click **Create API Key**
3. Name it appropriately (e.g., "Hutchins Electric Production" or "Hutchins Electric Development")
4. Select the appropriate permissions:
   - **Send emails**: Required for sending emails
   - **Read domains**: If you plan to manage domains programmatically
   - **Read emails**: For email analytics and monitoring

### Step 2: Secure Your API Key
1. **Copy the API key immediately** - it won't be shown again
2. Store it securely in your environment variables

### Step 3: Add to Environment Variables
Create or update your `.env.local` file in your project root:

```bash
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@hutchinselectric.com
```

**Important Security Notes:**
- Never commit API keys to version control
- Add `.env.local` to your `.gitignore` file
- Use different API keys for development and production
- Regularly rotate API keys for security

---

## 3. Adding and Verifying a Custom Domain

### Option A: Using a Custom Domain (Recommended)

#### Step 1: Add Domain in Resend
1. Go to **Domains** in your Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `hutchinselectric.com`)

#### Step 2: Configure DNS Records
Add the following DNS records to your domain provider:

```
Type: TXT
Name: @ (or your root domain)
Value: [Resend will provide this value]

Type: CNAME
Name: resend._domainkey
Value: [Resend will provide this value]

Type: MX
Name: @ (or your root domain)
Value: feedback-smtp.resend.com
Priority: 10
```

#### Step 3: Verify Domain
1. After adding DNS records, click **Verify** in Resend dashboard
2. Verification may take up to 24 hours
3. You'll receive an email confirmation once verified

### Option B: Using Resend's Test Domain (For Development)

For testing purposes, you can use Resend's test domain:
- From: `onboarding@resend.dev`
- This allows immediate testing without domain setup
- Limited to sending emails to your own verified email addresses

---

## 4. Setting Up Email Templates

### Step 1: Create Templates in Resend Dashboard
1. Navigate to **Emails** > **Templates**
2. Click **Create Template**
3. Choose template type:
   - **Transactional**: For booking confirmations, quotes, etc.
   - **Marketing**: For newsletters (if needed)

### Step 2: Template Examples for Hutchins Electric

#### Quote Request Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Quote Request Received - Hutchins Electric</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af;">Hutchins Electric</h1>
        </header>
        
        <h2>Quote Request Received</h2>
        
        <p>Dear {{customerName}},</p>
        
        <p>Thank you for requesting a quote from Hutchins Electric. We have received your request and will review it shortly.</p>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Request Details:</h3>
            <p><strong>Service Type:</strong> {{serviceType}}</p>
            <p><strong>Description:</strong> {{description}}</p>
            <p><strong>Contact:</strong> {{email}} | {{phone}}</p>
        </div>
        
        <p>Our team will contact you within 24 hours to discuss your project and provide a detailed quote.</p>
        
        <p>If you have any urgent questions, please call us at <strong>(555) 123-4567</strong>.</p>
        
        <p>Best regards,<br>The Hutchins Electric Team</p>
        
        <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p>Hutchins Electric | Licensed & Insured | Serving the Community Since 1985</p>
        </footer>
    </div>
</body>
</html>
```

#### Booking Confirmation Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Booking Confirmed - Hutchins Electric</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af;">Hutchins Electric</h1>
        </header>
        
        <h2>Service Appointment Confirmed</h2>
        
        <p>Dear {{customerName}},</p>
        
        <p>Your electrical service appointment has been confirmed. We look forward to serving you!</p>
        
        <div style="background: #dcfce7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3>Appointment Details:</h3>
            <p><strong>Date:</strong> {{appointmentDate}}</p>
            <p><strong>Time:</strong> {{appointmentTime}}</p>
            <p><strong>Service:</strong> {{serviceType}}</p>
            <p><strong>Address:</strong> {{serviceAddress}}</p>
            <p><strong>Technician:</strong> {{technicianName}}</p>
        </div>
        
        <h3>What to Expect:</h3>
        <ul>
            <li>Our licensed technician will arrive on time</li>
            <li>We'll provide a detailed assessment of your electrical needs</li>
            <li>All work comes with our satisfaction guarantee</li>
        </ul>
        
        <p><strong>Need to reschedule?</strong> Please call us at <strong>(555) 123-4567</strong> at least 24 hours in advance.</p>
        
        <p>Thank you for choosing Hutchins Electric!</p>
        
        <p>Best regards,<br>The Hutchins Electric Team</p>
    </div>
</body>
</html>
```

---

## 5. Testing Email Sending

### Step 1: Create a Test API Route

Create a test file at `src/app/api/test-email/route.ts`:

```typescript
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to, subject, type } = await request.json();

    let emailContent;
    
    if (type === 'quote') {
      emailContent = {
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: [to],
        subject: subject || 'Quote Request Received - Hutchins Electric',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Quote Request Test Email</h2>
            <p>This is a test email from Hutchins Electric.</p>
            <p>If you received this, your Resend integration is working correctly!</p>
            <div style="background: #f3f4f6; padding: 15px; margin: 20px 0;">
              <h3>Test Details:</h3>
              <p><strong>Sent to:</strong> ${to}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Service:</strong> Email Service Test</p>
            </div>
            <p>Best regards,<br>Hutchins Electric Team</p>
          </div>
        `,
      };
    } else {
      emailContent = {
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: [to],
        subject: subject || 'Test Email - Hutchins Electric',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Test Email from Hutchins Electric</h2>
            <p>Hello! This is a test email to verify your Resend setup.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p>If you received this email, your configuration is working correctly.</p>
          </div>
        `,
      };
    }

    const { data, error } = await resend.emails.send(emailContent);

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Email sent successfully!'
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
```

### Step 2: Test via API

You can test the email sending using curl or a tool like Postman:

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Resend Test Email",
    "type": "quote"
  }'
```

### Step 3: Create a Simple Test Page (Optional)

Create `src/app/test-email/page.tsx` for easier testing:

```tsx
'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const sendTestEmail = async () => {
    if (!email) {
      setStatus('Please enter an email address');
      return;
    }

    setLoading(true);
    setStatus('Sending...');

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Resend Test - Hutchins Electric',
          type: 'quote'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus(`✅ Email sent successfully! ID: ${result.data?.id}`);
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setStatus(`❌ Failed to send email: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Resend Email</h1>
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={sendTestEmail}
          disabled={loading}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>
        {status && (
          <div className="p-2 rounded bg-gray-100">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 6. Understanding Free Tier Limits

### Free Tier Includes:
- **3,000 emails per month**
- **100 emails per day**
- Email analytics and logs
- API access
- Webhook support
- Email templates

### Usage Monitoring:
1. Check your **Dashboard** for current usage
2. Set up usage alerts in account settings
3. Monitor daily limits to avoid hitting caps

### Upgrade Considerations:
- **Pro Plan**: $20/month for 50,000 emails
- **Additional emails**: $1 per 1,000 emails
- Consider upgrading based on business growth

### Optimization Tips:
- Use email templates to reduce payload size
- Implement email queuing for high-volume periods
- Monitor bounce rates to maintain good sender reputation

---

## 7. Monitoring Email Delivery

### Step 1: Access Email Logs
1. Go to **Emails** > **Logs** in Resend dashboard
2. View delivery status, opens, clicks, and bounces
3. Filter by date range, status, or recipient

### Step 2: Understanding Email Status
- **Sent**: Email accepted by Resend
- **Delivered**: Successfully delivered to recipient's server
- **Opened**: Recipient opened the email (requires tracking pixels)
- **Clicked**: Recipient clicked a link in the email
- **Bounced**: Email rejected by recipient's server
- **Complained**: Recipient marked as spam

### Step 3: Set Up Monitoring in Code

Create a utility to log email events:

```typescript
// src/lib/email-monitor.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function getEmailStatus(emailId: string) {
  try {
    const email = await resend.emails.get(emailId);
    return email;
  } catch (error) {
    console.error('Error fetching email status:', error);
    return null;
  }
}

export async function logEmailEvent(emailId: string, event: string, details?: any) {
  console.log(`Email Event: ${event}`, {
    emailId,
    timestamp: new Date().toISOString(),
    details
  });
  
  // You could also store this in your database
  // await supabase.from('email_logs').insert({
  //   email_id: emailId,
  //   event,
  //   details,
  //   created_at: new Date()
  // });
}
```

---

## 8. Setting Up Email Analytics

### Step 1: Enable Tracking
When sending emails, enable tracking options:

```typescript
const { data, error } = await resend.emails.send({
  from: 'noreply@hutchinselectric.com',
  to: ['customer@example.com'],
  subject: 'Your Quote Request',
  html: emailTemplate,
  // Enable tracking
  tags: [
    { name: 'category', value: 'quote-request' },
    { name: 'customer-type', value: 'residential' }
  ],
  headers: {
    'X-Entity-Ref-ID': 'quote-123456', // Your internal reference
  },
});
```

### Step 2: Webhook Setup for Real-time Analytics

Create a webhook endpoint at `src/app/api/webhooks/resend/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('resend-signature');
    
    // Verify webhook signature (implement based on Resend docs)
    // const isValid = verifyWebhookSignature(body, signature);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const event = JSON.parse(body);
    
    console.log('Resend webhook event:', event);

    // Handle different event types
    switch (event.type) {
      case 'email.delivered':
        console.log(`Email ${event.data.email_id} delivered successfully`);
        break;
      case 'email.opened':
        console.log(`Email ${event.data.email_id} opened by recipient`);
        break;
      case 'email.clicked':
        console.log(`Link clicked in email ${event.data.email_id}`);
        break;
      case 'email.bounced':
        console.log(`Email ${event.data.email_id} bounced: ${event.data.reason}`);
        break;
      case 'email.complained':
        console.log(`Spam complaint for email ${event.data.email_id}`);
        break;
    }

    // Store analytics in your database
    // await storeEmailAnalytics(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

### Step 3: Configure Webhook in Resend
1. Go to **Webhooks** in Resend dashboard
2. Add webhook URL: `https://yourdomain.com/api/webhooks/resend`
3. Select events you want to track
4. Test the webhook

---

## 9. Handling Bounces and Complaints

### Step 1: Bounce Management Strategy

```typescript
// src/lib/bounce-handler.ts
export async function handleBounce(emailAddress: string, bounceType: string, reason: string) {
  console.log(`Bounce detected: ${emailAddress} - ${bounceType}: ${reason}`);
  
  // Categories of bounces:
  // - Hard bounce: Permanent failure (invalid email, domain doesn't exist)
  // - Soft bounce: Temporary failure (mailbox full, server down)
  
  if (bounceType === 'hard') {
    // Remove from email list or mark as invalid
    await markEmailAsInvalid(emailAddress);
  } else if (bounceType === 'soft') {
    // Retry later or after a few attempts, treat as hard bounce
    await incrementSoftBounceCount(emailAddress);
  }
}

async function markEmailAsInvalid(email: string) {
  // Update your database to mark email as invalid
  // await supabase
  //   .from('customers')
  //   .update({ email_valid: false, bounce_reason: 'hard_bounce' })
  //   .eq('email', email);
}

async function incrementSoftBounceCount(email: string) {
  // Track soft bounce counts
  // After 3-5 soft bounces, consider it a hard bounce
}
```

### Step 2: Complaint Handling

```typescript
export async function handleComplaint(emailAddress: string) {
  console.log(`Spam complaint from: ${emailAddress}`);
  
  // Immediately suppress this email address
  await suppressEmailAddress(emailAddress);
  
  // Review your email content and sending practices
  // Consider reaching out to understand the complaint
}

async function suppressEmailAddress(email: string) {
  // Add to suppression list
  // await supabase
  //   .from('email_suppressions')
  //   .insert({ email, reason: 'complaint', created_at: new Date() });
}
```

### Step 3: Suppression List Management

```typescript
// Check suppression list before sending
export async function isEmailSuppressed(email: string): Promise<boolean> {
  // Check your suppression list
  // const result = await supabase
  //   .from('email_suppressions')
  //   .select('id')
  //   .eq('email', email)
  //   .single();
  
  // return !!result.data;
  return false; // Placeholder
}

// Use before sending any email
export async function sendEmailSafely(emailData: any) {
  const isSuppressed = await isEmailSuppressed(emailData.to[0]);
  
  if (isSuppressed) {
    console.log(`Email suppressed: ${emailData.to[0]}`);
    return { error: 'Email address is suppressed' };
  }
  
  return await resend.emails.send(emailData);
}
```

---

## 10. Best Practices for Transactional Emails

### Content Best Practices

#### 1. **Subject Lines**
```typescript
// Good subject lines for Hutchins Electric
const goodSubjects = [
  "Your electrical service appointment is confirmed",
  "Quote ready: Hutchins Electric estimate #12345",
  "Service completed: Thank you for choosing Hutchins Electric",
  "Reminder: Your electrical inspection is tomorrow"
];

// Avoid these
const avoidSubjects = [
  "RE: RE: RE: Your request", // Too many RE:s
  "URGENT!!! ELECTRICAL EMERGENCY!!!", // Too aggressive
  "Free estimate (limited time)", // Sounds like marketing
];
```

#### 2. **Email Structure**
```html
<!-- Good email structure template -->
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <!-- Clear header with company branding -->
  <header style="text-align: center; padding: 20px;">
    <h1 style="color: #1e40af;">Hutchins Electric</h1>
    <p>Licensed & Insured Electrical Services</p>
  </header>
  
  <!-- Clear, actionable content -->
  <main style="padding: 20px;">
    <h2>{{ subject }}</h2>
    <p>Dear {{ customerName }},</p>
    
    <!-- Key information in highlighted box -->
    <div style="background: #f3f4f6; padding: 15px; border-radius: 5px;">
      <!-- Important details here -->
    </div>
    
    <!-- Clear next steps -->
    <p><strong>What happens next:</strong></p>
    <ul>
      <li>Step 1</li>
      <li>Step 2</li>
    </ul>
    
    <!-- Contact information -->
    <p>Questions? Call us at <strong>(555) 123-4567</strong></p>
  </main>
  
  <!-- Professional footer -->
  <footer style="border-top: 1px solid #e5e7eb; padding: 20px; font-size: 12px;">
    <p>Hutchins Electric | Serving the Community Since 1985</p>
    <p>Licensed in [State] | License #[Number] | Fully Insured</p>
  </footer>
</div>
```

### Technical Best Practices

#### 1. **Email Service Architecture**

```typescript
// src/lib/email-service.ts
import { Resend } from 'resend';

class EmailService {
  private resend: Resend;
  
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }
  
  async sendQuoteConfirmation(customerData: any, quoteData: any) {
    const emailData = {
      from: process.env.RESEND_FROM_EMAIL!,
      to: [customerData.email],
      subject: `Quote Request Received - Hutchins Electric #${quoteData.id}`,
      html: await this.renderQuoteTemplate(customerData, quoteData),
      tags: [
        { name: 'type', value: 'quote-confirmation' },
        { name: 'customer-id', value: customerData.id }
      ],
      headers: {
        'X-Quote-ID': quoteData.id,
      },
    };
    
    // Check suppression list
    if (await this.isEmailSuppressed(customerData.email)) {
      throw new Error('Email address is suppressed');
    }
    
    const result = await this.resend.emails.send(emailData);
    
    // Log the email
    await this.logEmailSent(result.data?.id, 'quote-confirmation', customerData.id);
    
    return result;
  }
  
  async sendBookingConfirmation(customerData: any, bookingData: any) {
    // Similar implementation for booking confirmations
  }
  
  private async renderQuoteTemplate(customerData: any, quoteData: any) {
    // Render your email template with customer and quote data
    return `<!-- Your HTML template -->`;
  }
  
  private async isEmailSuppressed(email: string): Promise<boolean> {
    // Check your suppression list
    return false;
  }
  
  private async logEmailSent(emailId: string, type: string, customerId: string) {
    // Log email sending to your database
    console.log(`Email sent: ${emailId} (${type}) to customer ${customerId}`);
  }
}

export const emailService = new EmailService();
```

#### 2. **Error Handling and Retry Logic**

```typescript
// src/lib/email-retry.ts
export async function sendEmailWithRetry(emailData: any, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await resend.emails.send(emailData);
      console.log(`Email sent successfully on attempt ${attempt}`);
      return result;
    } catch (error: any) {
      lastError = error;
      console.log(`Email attempt ${attempt} failed:`, error.message);
      
      // Don't retry certain errors
      if (error.message?.includes('Invalid email') || 
          error.message?.includes('API key')) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed to send email after ${maxRetries} attempts: ${lastError?.message}`);
}
```

#### 3. **Environment-Specific Configuration**

```typescript
// src/lib/email-config.ts
interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  replyToEmail?: string;
  webhookSecret?: string;
  isDevelopment: boolean;
}

export const emailConfig: EmailConfig = {
  apiKey: process.env.RESEND_API_KEY!,
  fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  replyToEmail: process.env.RESEND_REPLY_TO || 'info@hutchinselectric.com',
  webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
  isDevelopment: process.env.NODE_ENV === 'development',
};

// Development email override
export function getEmailRecipient(originalEmail: string): string {
  if (emailConfig.isDevelopment) {
    // In development, send all emails to a test address
    return process.env.TEST_EMAIL || 'test@example.com';
  }
  return originalEmail;
}
```

### Security Best Practices

#### 1. **API Key Security**
- Store API keys in environment variables
- Use different keys for development and production
- Rotate keys regularly
- Never log API keys
- Use least privilege principle for API key permissions

#### 2. **Email Content Security**
- Sanitize all user input before including in emails
- Use parameterized templates
- Avoid including sensitive information in emails
- Implement email encryption for sensitive data

#### 3. **Rate Limiting**
```typescript
// Simple rate limiting for email sending
const emailRateLimit = new Map<string, { count: number; resetTime: number }>();

export function checkEmailRateLimit(identifier: string, maxEmails = 10, windowMs = 60000) {
  const now = Date.now();
  const current = emailRateLimit.get(identifier);
  
  if (!current || now > current.resetTime) {
    emailRateLimit.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxEmails) {
    return false;
  }
  
  current.count++;
  return true;
}
```

### Performance Optimization

#### 1. **Email Queuing**
For high-volume scenarios, implement email queuing:

```typescript
// src/lib/email-queue.ts
interface EmailJob {
  id: string;
  emailData: any;
  priority: 'high' | 'normal' | 'low';
  attempts: number;
  createdAt: Date;
}

class EmailQueue {
  private queue: EmailJob[] = [];
  private processing = false;
  
  async addToQueue(emailData: any, priority: 'high' | 'normal' | 'low' = 'normal') {
    const job: EmailJob = {
      id: Math.random().toString(36).substr(2, 9),
      emailData,
      priority,
      attempts: 0,
      createdAt: new Date(),
    };
    
    this.queue.push(job);
    this.queue.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
    
    if (!this.processing) {
      this.processQueue();
    }
  }
  
  private async processQueue() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const job = this.queue.shift()!;
      
      try {
        await sendEmailWithRetry(job.emailData);
        console.log(`Email job ${job.id} completed successfully`);
      } catch (error) {
        console.error(`Email job ${job.id} failed:`, error);
        
        job.attempts++;
        if (job.attempts < 3) {
          // Re-queue for retry
          this.queue.push(job);
        }
      }
      
      // Rate limiting - don't send too many emails too quickly
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.processing = false;
  }
  
  private getPriorityValue(priority: string): number {
    switch (priority) {
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }
}

export const emailQueue = new EmailQueue();
```

### Testing and Quality Assurance

#### 1. **Email Testing Checklist**
- [ ] Test with real email addresses
- [ ] Test on different email clients (Gmail, Outlook, Apple Mail)
- [ ] Test on mobile devices
- [ ] Verify all links work correctly
- [ ] Test with and without images enabled
- [ ] Check spam score using tools like Mail Tester
- [ ] Verify unsubscribe links (if applicable)
- [ ] Test error scenarios (invalid emails, API failures)

#### 2. **Automated Testing**
```typescript
// src/tests/email.test.ts
import { emailService } from '../lib/email-service';

describe('Email Service', () => {
  test('should send quote confirmation email', async () => {
    const mockCustomer = {
      id: '123',
      email: 'test@example.com',
      name: 'John Doe'
    };
    
    const mockQuote = {
      id: 'Q001',
      service: 'Electrical Panel Upgrade',
      description: 'Upgrade main electrical panel'
    };
    
    const result = await emailService.sendQuoteConfirmation(mockCustomer, mockQuote);
    
    expect(result.data).toBeDefined();
    expect(result.data?.id).toBeTruthy();
  });
  
  test('should handle invalid email addresses', async () => {
    const mockCustomer = {
      id: '123',
      email: 'invalid-email',
      name: 'John Doe'
    };
    
    const mockQuote = {
      id: 'Q001',
      service: 'Test Service',
      description: 'Test Description'
    };
    
    await expect(emailService.sendQuoteConfirmation(mockCustomer, mockQuote))
      .rejects.toThrow();
  });
});
```

---

## Conclusion

This comprehensive setup guide covers all aspects of integrating Resend with your Hutchins Electric website. Remember to:

1. **Start with the test domain** for development
2. **Set up proper monitoring** and analytics from the beginning
3. **Implement error handling** and retry logic
4. **Follow email best practices** for better deliverability
5. **Test thoroughly** across different email clients
6. **Monitor your sending reputation** and handle bounces/complaints properly

For additional support:
- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **Resend Community**: [resend.com/community](https://resend.com/community)
- **Status Page**: [status.resend.com](https://status.resend.com)

Remember to update this guide as your email requirements evolve and new features become available in Resend.