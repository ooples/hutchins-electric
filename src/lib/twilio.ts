import twilio from 'twilio'

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER

// Initialize Twilio client only if credentials are available
let twilioClient: twilio.Twilio | null = null

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken)
}

// Check if Twilio is properly configured
export const isTwilioConfigured = (): boolean => {
  return !!(accountSid && authToken && fromNumber)
}

// Get Twilio client instance
export const getTwilioClient = (): twilio.Twilio | null => {
  if (!isTwilioConfigured()) {
    console.warn('Twilio is not properly configured. SMS functionality will be disabled.')
    return null
  }
  return twilioClient
}

// Get the configured phone number for sending SMS
export const getTwilioPhoneNumber = (): string | null => {
  return fromNumber || null
}

// Validate phone number format (basic US format validation)
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // US phone numbers should have 10 or 11 digits (with or without country code)
  if (digits.length === 10) {
    return true
  }
  if (digits.length === 11 && digits[0] === '1') {
    return true
  }
  
  return false
}

// Format phone number for Twilio (E.164 format)
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Add country code if not present
  if (digits.length === 10) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+${digits}`
  }
  
  // Return as-is if it already looks like E.164 format
  if (phone.startsWith('+')) {
    return phone
  }
  
  // Default to US format
  return `+1${digits}`
}

const twilioUtils = {
  getTwilioClient,
  isTwilioConfigured,
  getTwilioPhoneNumber,
  validatePhoneNumber,
  formatPhoneNumber
}

export default twilioUtils