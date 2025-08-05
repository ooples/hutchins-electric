import { getTwilioClient, getTwilioPhoneNumber, isTwilioConfigured, formatPhoneNumber, validatePhoneNumber } from '@/lib/twilio'
import { supabase } from '@/lib/supabase'

// SMS Template types
export interface SMSTemplate {
  id: string
  name: string
  content: string
  variables: string[]
}

// SMS notification types
export type SMSNotificationType = 
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'quote_followup'
  | 'emergency_response'
  | 'status_update'

// SMS delivery status
export type SMSDeliveryStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered'

// SMS tracking record
export interface SMSRecord {
  id?: string
  to_phone: string
  from_phone: string
  message: string
  notification_type: SMSNotificationType
  status: SMSDeliveryStatus
  twilio_sid?: string
  cost?: number
  error_message?: string
  sent_at?: string
  delivered_at?: string
  created_at?: string
}

// Default SMS templates
const SMS_TEMPLATES: Record<SMSNotificationType, SMSTemplate> = {
  appointment_confirmation: {
    id: 'appointment_confirmation',
    name: 'Appointment Confirmation',
    content: 'Hi {{customerName}}, your electrical service appointment with Hutchins Electric is confirmed for {{date}} at {{time}}. We\'ll see you then! Reply STOP to opt out.',
    variables: ['customerName', 'date', 'time']
  },
  appointment_reminder: {
    id: 'appointment_reminder',
    name: 'Appointment Reminder',
    content: 'Reminder: You have an electrical service appointment with Hutchins Electric tomorrow ({{date}}) at {{time}}. We look forward to serving you! Reply STOP to opt out.',
    variables: ['date', 'time']
  },
  quote_followup: {
    id: 'quote_followup',
    name: 'Quote Follow-up',
    content: 'Hi {{customerName}}, we\'ve prepared your electrical service quote. Check your email for details or call us at 802-555-0123. Thank you for choosing Hutchins Electric! Reply STOP to opt out.',
    variables: ['customerName']
  },
  emergency_response: {
    id: 'emergency_response',
    name: 'Emergency Response',
    content: 'Hi {{customerName}}, we\'ve received your emergency electrical service request. A technician will contact you within 15 minutes. For immediate assistance, call 802-555-0123.',
    variables: ['customerName']
  },
  status_update: {
    id: 'status_update',
    name: 'Status Update',
    content: 'Hi {{customerName}}, update on your electrical service: {{message}}. Questions? Call us at 802-555-0123. Reply STOP to opt out.',
    variables: ['customerName', 'message']
  }
}

// Rate limiting - max 5 SMS per phone number per hour
const RATE_LIMIT_PER_HOUR = 5
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds

// SMS service class
export class SMSService {
  private static instance: SMSService
  private isTestMode: boolean

  constructor() {
    this.isTestMode = process.env.NODE_ENV !== 'production' || process.env.SMS_TEST_MODE === 'true'
  }

  public static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService()
    }
    return SMSService.instance
  }

  // Check if SMS is enabled and configured
  public isEnabled(): boolean {
    return isTwilioConfigured()
  }

  // Get SMS template
  public getTemplate(type: SMSNotificationType): SMSTemplate {
    return SMS_TEMPLATES[type]
  }

  // Replace template variables
  private replaceVariables(template: string, variables: Record<string, string>): string {
    let message = template
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      message = message.replace(new RegExp(placeholder, 'g'), value)
    })
    return message
  }

  // Check rate limit for phone number
  private async checkRateLimit(phone: string): Promise<boolean> {
    try {
      const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString()
      
      const { data, error } = await supabase
        .from('sms_logs')
        .select('id')
        .eq('to_phone', phone)
        .gte('created_at', oneHourAgo)
      
      if (error) {
        console.error('Error checking rate limit:', error)
        return true // Allow if we can't check
      }
      
      return (data?.length || 0) < RATE_LIMIT_PER_HOUR
    } catch (error) {
      console.error('Rate limit check failed:', error)
      return true // Allow if error occurs
    }
  }

  // Check if phone number has opted out
  private async isOptedOut(phone: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('sms_opt_outs')
        .select('id')
        .eq('phone', phone)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking opt-out status:', error)
        return false // Allow if we can't check
      }
      
      return !!data
    } catch (error) {
      console.error('Opt-out check failed:', error)
      return false // Allow if error occurs
    }
  }

  // Log SMS to database
  private async logSMS(record: SMSRecord): Promise<void> {
    try {
      const { error } = await supabase
        .from('sms_logs')
        .insert([record])
      
      if (error) {
        console.error('Error logging SMS:', error)
      }
    } catch (error) {
      console.error('SMS logging failed:', error)
    }
  }

  // Send SMS
  public async sendSMS(
    to: string,
    type: SMSNotificationType,
    variables: Record<string, string> = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    
    // Validate phone number
    if (!validatePhoneNumber(to)) {
      return { success: false, error: 'Invalid phone number format' }
    }

    const formattedPhone = formatPhoneNumber(to)

    // Check if SMS is enabled
    if (!this.isEnabled()) {
      console.log(`SMS not configured - would send ${type} to ${formattedPhone}`)
      return { success: false, error: 'SMS service not configured' }
    }

    // Check if phone number has opted out
    if (await this.isOptedOut(formattedPhone)) {
      console.log(`Phone ${formattedPhone} has opted out of SMS`)
      return { success: false, error: 'Phone number has opted out' }
    }

    // Check rate limit
    if (!(await this.checkRateLimit(formattedPhone))) {
      console.log(`Rate limit exceeded for ${formattedPhone}`)
      return { success: false, error: 'Rate limit exceeded' }
    }

    // Get template and prepare message
    const template = this.getTemplate(type)
    const message = this.replaceVariables(template.content, variables)

    // In test mode, just log the message
    if (this.isTestMode) {
      console.log(`[TEST MODE] SMS to ${formattedPhone}: ${message}`)
      
      // Log to database even in test mode
      await this.logSMS({
        to_phone: formattedPhone,
        from_phone: getTwilioPhoneNumber() || 'TEST',
        message,
        notification_type: type,
        status: 'sent',
        twilio_sid: `test_${Date.now()}`,
        sent_at: new Date().toISOString()
      })
      
      return { success: true, messageId: `test_${Date.now()}` }
    }

    // Send actual SMS via Twilio
    try {
      const client = getTwilioClient()
      const fromPhone = getTwilioPhoneNumber()

      if (!client || !fromPhone) {
        throw new Error('Twilio client or phone number not configured')
      }

      const result = await client.messages.create({
        body: message,
        from: fromPhone,
        to: formattedPhone,
        statusCallback: `${process.env.NEXT_PUBLIC_URL}/api/sms/webhook`
      })

      // Log successful send
      await this.logSMS({
        to_phone: formattedPhone,
        from_phone: fromPhone,
        message,
        notification_type: type,
        status: 'sent',
        twilio_sid: result.sid,
        cost: parseFloat(result.price || '0'),
        sent_at: new Date().toISOString()
      })

      return { success: true, messageId: result.sid }

    } catch (error) {
      console.error('Failed to send SMS:', error)
      
      // Log failed send
      await this.logSMS({
        to_phone: formattedPhone,
        from_phone: getTwilioPhoneNumber() || 'UNKNOWN',
        message,
        notification_type: type,
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        sent_at: new Date().toISOString()
      })

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send SMS' 
      }
    }
  }

  // Send appointment confirmation
  public async sendAppointmentConfirmation(
    phone: string,
    customerName: string,
    date: string,
    time: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendSMS(phone, 'appointment_confirmation', {
      customerName,
      date,
      time
    })
  }

  // Send appointment reminder
  public async sendAppointmentReminder(
    phone: string,
    date: string,
    time: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendSMS(phone, 'appointment_reminder', {
      date,
      time
    })
  }

  // Send quote follow-up
  public async sendQuoteFollowup(
    phone: string,
    customerName: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendSMS(phone, 'quote_followup', {
      customerName
    })
  }

  // Send emergency response confirmation
  public async sendEmergencyResponse(
    phone: string,
    customerName: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendSMS(phone, 'emergency_response', {
      customerName
    })
  }

  // Send status update
  public async sendStatusUpdate(
    phone: string,
    customerName: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendSMS(phone, 'status_update', {
      customerName,
      message
    })
  }

  // Handle opt-out
  public async handleOptOut(phone: string): Promise<void> {
    try {
      const formattedPhone = formatPhoneNumber(phone)
      
      const { error } = await supabase
        .from('sms_opt_outs')
        .upsert([{ phone: formattedPhone, opted_out_at: new Date().toISOString() }])
      
      if (error) {
        console.error('Error handling opt-out:', error)
      }
    } catch (error) {
      console.error('Opt-out handling failed:', error)
    }
  }

  // Get SMS statistics
  public async getStats(dateFrom?: string, dateTo?: string) {
    try {
      let query = supabase.from('sms_logs').select('*')
      
      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo)
      }
      
      const { data, error } = await query
      
      if (error) {
        throw error
      }
      
      const stats = {
        total: data.length,
        sent: data.filter(sms => sms.status === 'sent').length,
        delivered: data.filter(sms => sms.status === 'delivered').length,
        failed: data.filter(sms => sms.status === 'failed').length,
        totalCost: data.reduce((sum, sms) => sum + (sms.cost || 0), 0),
        byType: {} as Record<SMSNotificationType, number>
      }
      
      // Count by notification type
      Object.keys(SMS_TEMPLATES).forEach(type => {
        stats.byType[type as SMSNotificationType] = data.filter(
          sms => sms.notification_type === type
        ).length
      })
      
      return stats
    } catch (error) {
      console.error('Error getting SMS stats:', error)
      throw error
    }
  }
}

// Export singleton instance
export const smsService = SMSService.getInstance()
export default smsService