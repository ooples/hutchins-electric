import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { smsService } from '@/services/sms'

import { Resend } from 'resend'

// Resend initialization - we'll handle errors if API key is missing
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['customer_name', 'email', 'phone', 'service_type', 'requested_date', 'requested_time_preference']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create a temporary user entry for the booking
    const supabase = getServiceSupabase()
    
    // First, check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single()

    let userId = existingUser?.id

    if (!userId) {
      // Create a new customer user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: data.email,
          role: 'customer'
        })
        .select()
        .single()

      if (userError) {
        console.error('User creation error:', userError)
      } else {
        userId = newUser.id
      }
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        customer_id: userId,
        requested_date: data.requested_date,
        requested_time_preference: data.requested_time_preference,
        notes: data.notes || null,
        status: 'requested',
        sms_consent: data.sms_consent || false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking error:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Send email notification to business owner
    const businessEmail = process.env.BUSINESS_EMAIL || 'service@hutchinselectric.com'
    
    const timeSlots = {
      morning: '8:00 AM - 12:00 PM',
      afternoon: '12:00 PM - 5:00 PM',
      evening: '5:00 PM - 8:00 PM',
      emergency: 'ASAP - Emergency'
    }

    const emailHtml = `
      <h2>${data.requested_time_preference === 'emergency' ? '🚨 EMERGENCY' : 'New'} Booking Request</h2>
      <p><strong>Customer:</strong> ${data.customer_name}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Service:</strong> ${data.service_type}</p>
      <p><strong>Requested Date:</strong> ${new Date(data.requested_date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
      <p><strong>Preferred Time:</strong> ${timeSlots[data.requested_time_preference as keyof typeof timeSlots]}</p>
      ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
      <hr>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/bookings">View in Admin Dashboard</a></p>
    `

    if (resend) {
      try {
        await resend.emails.send({
          from: 'Hutchins Electric <bookings@hutchinselectric.com>',
          to: businessEmail,
          subject: `${data.requested_time_preference === 'emergency' ? 'EMERGENCY' : 'New'} Booking - ${data.customer_name} - ${new Date(data.requested_date).toLocaleDateString()}`,
          html: emailHtml,
          replyTo: data.email
        })
      } catch (emailError) {
        console.error('Email error:', emailError)
      }
    } else {
      console.log('Email not sent - Resend API key not configured')
    }

    // Send confirmation email to customer
    if (resend) {
      try {
        const customerEmailHtml = `
        <h2>Appointment Request Received</h2>
        <p>Hi ${data.customer_name},</p>
        <p>We've received your appointment request and will confirm your booking within 24 hours.</p>
        <h3>Your Request Details:</h3>
        <p><strong>Service:</strong> ${data.service_type}</p>
        <p><strong>Date:</strong> ${new Date(data.requested_date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        <p><strong>Time Preference:</strong> ${timeSlots[data.requested_time_preference as keyof typeof timeSlots]}</p>
        ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
        ${data.requested_time_preference === 'emergency' ? 
          '<p style="color: red;"><strong>Emergency Service:</strong> We treat emergency requests as our top priority. If you need immediate assistance, please call us at 802-555-0123.</p>' : 
          '<p>We will call or email you to confirm the exact appointment time based on our schedule availability.</p>'
        }
        <p>If you need to make any changes or have questions, please reply to this email or call us.</p>
        <p>Thank you for choosing Hutchins Electric!</p>
      `

        await resend.emails.send({
          from: 'Hutchins Electric <noreply@hutchinselectric.com>',
          to: data.email,
          subject: `Appointment Request Received - ${new Date(data.requested_date).toLocaleDateString()}`,
          html: customerEmailHtml
        })
      } catch (customerEmailError) {
        console.error('Customer email error:', customerEmailError)
      }
    }

    // Send SMS notification if customer consented
    if (data.sms_consent && data.phone) {
      try {
        if (data.requested_time_preference === 'emergency') {
          await smsService.sendEmergencyResponse(data.phone, data.customer_name)
        } else {
          // Send appointment confirmation (even though it's just a request, we confirm receipt)
          const formattedDate = new Date(data.requested_date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })
          const timeSlot = timeSlots[data.requested_time_preference as keyof typeof timeSlots]
          
          await smsService.sendAppointmentConfirmation(
            data.phone, 
            data.customer_name, 
            formattedDate, 
            timeSlot
          )
        }
      } catch (smsError) {
        console.error('SMS error:', smsError)
        // Don't fail the request if SMS fails, booking is already saved
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Booking request submitted successfully',
      id: booking?.id 
    })
  } catch (error) {
    console.error('Booking submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase()
    const { searchParams } = new URL(request.url)
    const admin = searchParams.get('admin')
    
    if (admin === 'true') {
      // Admin view - return all bookings with full details
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .order('requested_date', { ascending: true })

      if (error) {
        console.error('Error fetching admin bookings:', error)
        return NextResponse.json(
          { error: 'Failed to fetch bookings' },
          { status: 500 }
        )
      }

      return NextResponse.json({ bookings })
    } else {
      // Public view - return only confirmed bookings for calendar display
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .order('requested_date', { ascending: true })
        .eq('status', 'confirmed')

      if (error) {
        console.error('Error fetching bookings:', error)
        return NextResponse.json(
          { error: 'Failed to fetch bookings' },
          { status: 500 }
        )
      }

      const publicBookings = bookings.map(booking => ({
        date: booking.requested_date,
        timeSlot: booking.requested_time_preference,
        isAvailable: false
      }))

      return NextResponse.json({ bookings: publicBookings })
    }
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
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const data = await request.json()
    
    // Validate status if provided
    if (data.status && !['requested', 'confirmed', 'completed', 'cancelled'].includes(data.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()
    
    // First get the current booking to access customer info
    const { data: currentBooking } = await supabase
      .from('bookings')
      .select(`
        *,
        users!bookings_customer_id_fkey (email)
      `)
      .eq('id', id)
      .single()

    const { data: booking, error } = await supabase
      .from('bookings')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        users!bookings_customer_id_fkey (email)
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      )
    }

    // Send SMS notification if booking was confirmed and customer has SMS consent
    if (
      data.status === 'confirmed' && 
      currentBooking?.status !== 'confirmed' &&
      currentBooking?.sms_consent &&
      data.scheduled_date &&
      data.scheduled_time
    ) {
      try {
        // We need customer info - for now, we'll extract it from the booking
        // In a real scenario, you might want to join with a customers table
        const customerName = currentBooking.customer_name || 'Customer'
        const customerPhone = currentBooking.phone // Assuming phone is stored in booking
        
        if (customerPhone) {
          const formattedDate = new Date(data.scheduled_date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })
          
          await smsService.sendAppointmentConfirmation(
            customerPhone,
            customerName,
            formattedDate,
            data.scheduled_time
          )
        }
      } catch (smsError) {
        console.error('SMS confirmation error:', smsError)
        // Don't fail the request if SMS fails
      }
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}