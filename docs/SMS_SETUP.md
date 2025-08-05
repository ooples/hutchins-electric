# SMS Setup Guide for Hutchins Electric

This guide will walk you through setting up SMS notifications using Twilio for your Hutchins Electric application.

## Overview

The SMS notification system provides the following features:

- **Automated SMS notifications** for appointments and quotes
- **Customer opt-in/opt-out management** with STOP keyword support
- **Delivery status tracking** with webhook integration
- **Rate limiting** to prevent abuse (5 messages per phone per hour)
- **Cost tracking** for SMS usage monitoring
- **Test mode** for development and testing
- **Admin dashboard** for managing SMS settings and viewing logs

## Prerequisites

1. A Twilio account (sign up at [twilio.com](https://www.twilio.com))
2. A Twilio phone number for sending SMS
3. Access to your application's environment variables
4. Database migrations applied (SMS tables must exist)

## Step 1: Create Twilio Account and Get Credentials

### 1.1 Sign up for Twilio
1. Go to [twilio.com](https://www.twilio.com) and create an account
2. Complete the verification process
3. Navigate to the Console Dashboard

### 1.2 Get Your Account Credentials
1. In the Twilio Console, find your **Account SID** and **Auth Token**
2. Copy these values - you'll need them for environment variables

### 1.3 Purchase a Phone Number
1. Go to **Phone Numbers** > **Manage** > **Buy a number**
2. Choose a number that supports SMS
3. Purchase the number
4. Copy the phone number (in E.164 format, e.g., +15551234567)

## Step 2: Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567

# Optional: Admin API Key for SMS API (recommended for production)
ADMIN_API_KEY=your_secure_api_key_here

# Optional: Test Mode (set to false in production)
SMS_TEST_MODE=true

# Required: Your website URL for webhooks
NEXT_PUBLIC_URL=https://yourdomain.com
```

### Environment Variable Details

- **TWILIO_ACCOUNT_SID**: Your Twilio Account SID from the console
- **TWILIO_AUTH_TOKEN**: Your Twilio Auth Token (keep this secret!)
- **TWILIO_PHONE_NUMBER**: Your Twilio phone number in E.164 format
- **ADMIN_API_KEY**: Optional API key for admin SMS endpoints (generates random if not set)
- **SMS_TEST_MODE**: Set to `true` for testing (logs messages without sending), `false` for production
- **NEXT_PUBLIC_URL**: Your application's public URL (required for webhooks)

## Step 3: Apply Database Migrations

Make sure you've applied the SMS database migrations:

```sql
-- Run this migration in your Supabase SQL editor or via CLI:
-- File: supabase/migrations/002_sms_functionality.sql
```

This creates the following tables:
- `sms_logs` - Tracks all sent SMS messages
- `sms_opt_outs` - Manages phone numbers that have opted out
- `sms_templates` - Stores message templates
- `sms_settings` - Global SMS configuration

## Step 4: Configure Webhooks (Optional)

Webhooks allow you to receive delivery status updates from Twilio.

### 4.1 Set Up Webhook URL
1. In Twilio Console, go to **Phone Numbers** > **Manage** > **Active Numbers**
2. Click on your SMS-enabled phone number
3. In the **Messaging** section, set the webhook URL to:
   ```
   https://yourdomain.com/api/sms/webhook
   ```
4. Set HTTP method to **POST**
5. Save the configuration

### 4.2 Webhook Functionality
The webhook handles:
- Delivery status updates (delivered, failed, etc.)
- Automatic opt-out processing (STOP, UNSUBSCRIBE keywords)
- Cost tracking updates

## Step 5: Test Your Setup

### 5.1 Check Configuration Status
1. Start your application
2. Go to `/admin/notifications` in your browser
3. Check the configuration status indicator
4. It should show "SMS Configured" if everything is set up correctly

### 5.2 Send Test Messages
1. In the admin panel, go to the "Test SMS" tab
2. Enter a phone number (your own for testing)
3. Select a message type
4. Click "Send Test SMS"
5. You should receive the message if in production mode, or see a log entry if in test mode

### 5.3 Test Customer Flow
1. Go to the quote or booking forms
2. Check the SMS consent checkbox
3. Submit the form
4. You should receive SMS notifications based on the urgency/type

## Step 6: Production Deployment

### 6.1 Production Environment Variables
```bash
# Production settings
SMS_TEST_MODE=false
TWILIO_ACCOUNT_SID=your_production_account_sid
TWILIO_AUTH_TOKEN=your_production_auth_token
TWILIO_PHONE_NUMBER=+15551234567
ADMIN_API_KEY=your_secure_random_api_key
NEXT_PUBLIC_URL=https://your-production-domain.com
```

### 6.2 Security Considerations
- Keep your `TWILIO_AUTH_TOKEN` secret and secure
- Use a strong `ADMIN_API_KEY` for production
- Ensure your webhook URL is HTTPS
- Consider implementing additional webhook signature validation

### 6.3 Monitoring
- Monitor SMS costs in the Twilio Console
- Check the admin dashboard for delivery rates
- Set up alerts for failed messages if needed

## Message Types and Templates

The system supports these message types:

### 1. Appointment Confirmation
Sent when a booking is submitted or confirmed.
```
Hi {{customerName}}, your electrical service appointment with Hutchins Electric is confirmed for {{date}} at {{time}}. We'll see you then! Reply STOP to opt out.
```

### 2. Appointment Reminder
Sent 24 hours before scheduled appointments.
```
Reminder: You have an electrical service appointment with Hutchins Electric tomorrow ({{date}}) at {{time}}. We look forward to serving you! Reply STOP to opt out.
```

### 3. Quote Follow-up
Sent when a quote request is submitted.
```
Hi {{customerName}}, we've prepared your electrical service quote. Check your email for details or call us at 802-555-0123. Thank you for choosing Hutchins Electric! Reply STOP to opt out.
```

### 4. Emergency Response
Sent for emergency service requests.
```
Hi {{customerName}}, we've received your emergency electrical service request. A technician will contact you within 15 minutes. For immediate assistance, call 802-555-0123.
```

### 5. Status Update
General purpose status updates.
```
Hi {{customerName}}, update on your electrical service: {{message}}. Questions? Call us at 802-555-0123. Reply STOP to opt out.
```

## Cost Management

### SMS Pricing
- Twilio charges per SMS sent (typically $0.0075 per message in the US)
- Failed messages may still incur charges
- International messages cost more

### Cost Tracking
- All SMS costs are tracked in the `sms_logs` table
- View cost summaries in the admin dashboard
- Set up monitoring alerts in Twilio Console if needed

### Rate Limiting
- 5 messages per phone number per hour by default
- Prevents accidental spam and cost overruns
- Can be adjusted in SMS settings

## Compliance and Legal

### TCPA Compliance
- Always obtain explicit consent before sending SMS
- Provide clear opt-out instructions (STOP keyword)
- Honor opt-out requests immediately
- Include business identification in messages

### Best Practices
- Only send relevant, time-sensitive messages
- Keep messages concise and professional
- Test thoroughly before production deployment
- Monitor delivery rates and customer feedback

## Troubleshooting

### Common Issues

#### 1. "SMS service not configured" Error
- Check that all environment variables are set correctly
- Verify Twilio credentials are valid
- Ensure the phone number includes country code (+1 for US)

#### 2. Messages Not Sending
- Check test mode is disabled in production
- Verify phone number format (E.164)
- Check Twilio Console for account status/balance
- Review error logs in the admin dashboard

#### 3. Webhooks Not Working
- Ensure webhook URL is publicly accessible
- Check that URL uses HTTPS in production
- Verify webhook URL in Twilio Console matches your deployment

#### 4. High SMS Costs
- Review rate limiting settings
- Check for message loops or duplicate sends
- Monitor usage in Twilio Console
- Consider implementing additional validation

### Getting Help

1. Check the Twilio Console for detailed error messages
2. Review the admin SMS dashboard for delivery status
3. Check application logs for SMS-related errors
4. Consult Twilio documentation for specific API issues

## API Reference

### Send SMS Endpoint
```http
POST /api/sms/send
Content-Type: application/json
X-API-Key: your_admin_api_key

{
  "phone": "+15551234567",
  "type": "appointment_confirmation",
  "variables": {
    "customerName": "John Doe",
    "date": "Tomorrow",
    "time": "2:00 PM"
  }
}
```

### Check SMS Status
```http
GET /api/sms/send
X-API-Key: your_admin_api_key
```

### Webhook Endpoint
The webhook endpoint `/api/sms/webhook` handles:
- Delivery status updates from Twilio
- Automatic opt-out processing
- Message cost updates

## Conclusion

Your SMS notification system is now ready to enhance customer communication for Hutchins Electric. The system provides professional, timely notifications while maintaining compliance and cost control.

Remember to:
- Test thoroughly before going live
- Monitor costs and delivery rates
- Keep your Twilio credentials secure
- Respect customer opt-out preferences

For additional support, refer to the Twilio documentation or contact your development team.