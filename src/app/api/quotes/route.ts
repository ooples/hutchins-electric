import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { smsService } from '@/services/sms'

import { Resend } from 'resend'

// Resend initialization - we'll handle errors if API key is missing
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function GET() {
  try {
    const supabase = getServiceSupabase()
    
    const { data: quotes, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching quotes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch quotes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ quotes })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      )
    }

    const data = await request.json()
    
    // Validate status if provided
    if (data.status && !['pending', 'contacted', 'scheduled', 'completed'].includes(data.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()
    const { data: quote, error } = await supabase
      .from('quote_requests')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update quote' },
        { status: 500 }
      )
    }

    return NextResponse.json({ quote })
  } catch (error) {
    console.error('Update quote error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['customer_name', 'email', 'phone', 'service_type', 'property_type', 'urgency', 'description']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Save to database
    const supabase = getServiceSupabase()
    const { data: quote, error: dbError } = await supabase
      .from('quote_requests')
      .insert({
        ...data,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save quote request' },
        { status: 500 }
      )
    }

    // Send email notification to business owner
    const businessEmail = process.env.BUSINESS_EMAIL || 'service@hutchinselectric.com'
    
    const emailHtml = `
      <h2>${data.urgency === 'emergency' ? '🚨 EMERGENCY' : 'New'} Quote Request</h2>
      <p><strong>Name:</strong> ${data.customer_name}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Service Type:</strong> ${data.service_type}</p>
      <p><strong>Property Type:</strong> ${data.property_type}</p>
      <p><strong>Urgency:</strong> ${data.urgency}</p>
      ${data.preferred_date ? `<p><strong>Preferred Date:</strong> ${data.preferred_date}</p>` : ''}
      <p><strong>Description:</strong></p>
      <p>${data.description}</p>
      <hr>
      <p><small>This quote request was submitted via the website at ${new Date().toLocaleString()}</small></p>
    `

    if (resend) {
      try {
        await resend.emails.send({
          from: 'Hutchins Electric <quotes@hutchinselectric.com>',
          to: businessEmail,
          subject: `${data.urgency === 'emergency' ? 'EMERGENCY' : 'New'} Quote Request - ${data.customer_name}`,
          html: emailHtml,
          replyTo: data.email
        })
      } catch (emailError) {
        console.error('Email error:', emailError)
        // Don't fail the request if email fails, quote is already saved
      }
    } else {
      console.log('Email not sent - Resend API key not configured')
    }

    // Send confirmation email to customer
    if (resend) {
      try {
        const customerEmailHtml = `
          <h2>Thank you for your quote request!</h2>
          <p>Hi ${data.customer_name},</p>
          <p>We've received your request for electrical services and will get back to you within 24 hours with a quote.</p>
          <h3>Your Request Details:</h3>
          <p><strong>Service Type:</strong> ${data.service_type}</p>
          <p><strong>Property Type:</strong> ${data.property_type}</p>
          <p><strong>Description:</strong> ${data.description}</p>
          ${data.urgency === 'emergency' ? '<p><strong>Note:</strong> For immediate emergency assistance, please call us at 802-555-0123.</p>' : ''}
          <p>If you have any questions, feel free to reply to this email or call us.</p>
          <p>Best regards,<br>Hutchins Electric</p>
        `

        await resend.emails.send({
          from: 'Hutchins Electric <noreply@hutchinselectric.com>',
          to: data.email,
          subject: 'Quote Request Received - Hutchins Electric',
          html: customerEmailHtml
        })
      } catch (customerEmailError) {
        console.error('Customer email error:', customerEmailError)
      }
    }

    // Send SMS notification if customer consented and it's urgent or emergency
    if (data.sms_consent && data.phone) {
      try {
        if (data.urgency === 'emergency') {
          await smsService.sendEmergencyResponse(data.phone, data.customer_name)
        } else {
          // Send quote follow-up SMS
          await smsService.sendQuoteFollowup(data.phone, data.customer_name)
        }
      } catch (smsError) {
        console.error('SMS error:', smsError)
        // Don't fail the request if SMS fails, quote is already saved
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Quote request submitted successfully',
      id: quote?.id 
    })
  } catch (error) {
    console.error('Quote submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}