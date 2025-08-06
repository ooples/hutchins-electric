import { NextRequest, NextResponse } from 'next/server'
import { smsService } from '@/services/sms'
import { validatePhoneNumber } from '@/lib/twilio'

// Rate limiting - simple in-memory store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number, resetTime: number }>()
const RATE_LIMIT = 10 // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

// Admin API key check (basic security)
function isAuthorized(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const adminApiKey = process.env.ADMIN_API_KEY
  
  // Allow if no API key is configured (development mode)
  if (!adminApiKey) {
    return true
  }
  
  return apiKey === adminApiKey
}

// Rate limiting check
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const key = `sms_${ip}`
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (record.count >= RATE_LIMIT) {
    return false
  }
  
  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { phone, type, variables = {} } = body

    // Validate required fields
    if (!phone || !type) {
      return NextResponse.json(
        { error: 'Phone number and notification type are required' },
        { status: 400 }
      )
    }

    // Validate phone number format
    if (!validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Validate notification type
    const validTypes = [
      'appointment_confirmation',
      'appointment_reminder',
      'quote_followup',
      'emergency_response',
      'status_update'
    ]
    
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      )
    }

    // Check if SMS service is enabled
    if (!smsService.isEnabled()) {
      return NextResponse.json(
        { 
          error: 'SMS service is not configured',
          success: false,
          configured: false
        },
        { status: 503 }
      )
    }

    // Send SMS
    const result = await smsService.sendSMS(phone, type, variables)

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'SMS sent successfully'
      })
    } else {
      // Return error but don't expose sensitive details
      const statusCode = result.error?.includes('Rate limit') ? 429 : 400
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send SMS'
        },
        { status: statusCode }
      )
    }

  } catch (error) {
    console.error('SMS API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        success: false
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check SMS service status
export async function GET(request: NextRequest) {
  try {
    // Check authorization for status endpoint
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const isConfigured = smsService.isEnabled()
    
    return NextResponse.json({
      configured: isConfigured,
      enabled: isConfigured,
      testMode: process.env.NODE_ENV !== 'production' || process.env.SMS_TEST_MODE === 'true',
      service: 'Twilio'
    })

  } catch (error) {
    console.error('SMS status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}