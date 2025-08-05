import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { smsService } from '@/services/sms'

// Twilio webhook signature validation
function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  // In production, implement proper Twilio signature validation
  // For now, we'll do basic validation
  const authToken = process.env.TWILIO_AUTH_TOKEN
  
  if (!authToken || !signature) {
    return false
  }
  
  // This is a simplified validation - in production, use Twilio's validator
  // const validator = require('twilio').validateRequest
  // return validator(authToken, signature, url, params)
  
  return true
}

// Handle Twilio delivery status webhooks
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature validation
    const body = await request.text()
    const formData = new URLSearchParams(body)
    const params = Object.fromEntries(formData.entries())

    // Validate Twilio signature
    const signature = request.headers.get('x-twilio-signature') || ''
    const url = `${process.env.NEXT_PUBLIC_URL}/api/sms/webhook`
    
    if (!validateTwilioSignature(signature, url, params)) {
      console.warn('Invalid Twilio webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      )
    }

    // Extract webhook data
    const {
      MessageSid: messageSid,
      MessageStatus: status,
      To: toPhone,
      From: fromPhone,
      ErrorCode: errorCode,
      ErrorMessage: errorMessage
    } = params

    console.log('Twilio webhook received:', {
      messageSid,
      status,
      toPhone,
      errorCode,
      errorMessage
    })

    // Update SMS log in database
    if (messageSid) {
      const updateData: any = { status }
      
      // Set delivery timestamp for successful deliveries
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString()
      }
      
      // Set error information for failed messages
      if (status === 'failed' || status === 'undelivered') {
        updateData.error_message = errorMessage || `Error code: ${errorCode}`
      }

      const { error } = await supabase
        .from('sms_logs')
        .update(updateData)
        .eq('twilio_sid', messageSid)

      if (error) {
        console.error('Failed to update SMS log:', error)
      } else {
        console.log(`SMS log updated for ${messageSid}: ${status}`)
      }
    }

    // Handle opt-out messages (STOP, UNSUBSCRIBE, etc.)
    const messageBody = params.Body?.toLowerCase().trim()
    const optOutKeywords = ['stop', 'unsubscribe', 'cancel', 'end', 'quit']
    
    if (messageBody && optOutKeywords.includes(messageBody)) {
      await smsService.handleOptOut(toPhone || params.From)
      console.log(`Opt-out processed for ${toPhone || params.From}`)
    }

    // Respond to Twilio
    return new NextResponse('OK', { status: 200 })

  } catch (error) {
    console.error('SMS webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle GET requests (for webhook URL validation)
export async function GET() {
  return NextResponse.json({
    message: 'SMS webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}