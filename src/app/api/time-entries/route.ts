import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// GET /api/time-entries - Get time entries for an employee
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase()
    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get('employee_id')
    const weekStart = searchParams.get('week_start')
    const weekEnd = searchParams.get('week_end')
    const activeOnly = searchParams.get('active_only') === 'true'
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('time_entries')
      .select('*')
      .eq('employee_id', employeeId)
      .order('clock_in', { ascending: false })

    if (activeOnly) {
      query = query.eq('status', 'active').is('clock_out', null)
    }

    if (weekStart && weekEnd) {
      query = query
        .gte('clock_in', weekStart)
        .lte('clock_in', weekEnd)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching time entries:', error)
      return NextResponse.json(
        { error: 'Failed to fetch time entries' },
        { status: 500 }
      )
    }

    return NextResponse.json({ timeEntries: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/time-entries - Create new time entry (clock in)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employee_id,
      notes,
      location_lat,
      location_lng,
      location_accuracy,
      booking_id
    } = body

    if (!employee_id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()

    // Check if employee already has an active time entry
    const { data: activeEntry } = await supabase
      .from('time_entries')
      .select('id')
      .eq('employee_id', employee_id)
      .eq('status', 'active')
      .is('clock_out', null)
      .single()

    if (activeEntry) {
      return NextResponse.json(
        { error: 'Employee already has an active time entry. Please clock out first.' },
        { status: 400 }
      )
    }

    // Create new time entry
    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        employee_id,
        clock_in: new Date().toISOString(),
        notes: notes || null,
        location_lat: location_lat || null,
        location_lng: location_lng || null,
        location_accuracy: location_accuracy || null,
        booking_id: booking_id || null,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating time entry:', error)
      return NextResponse.json(
        { error: 'Failed to clock in: ' + error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ timeEntry: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/time-entries - Update time entry (clock out)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      entry_id,
      notes,
      break_duration_minutes,
      location_lat,
      location_lng,
      location_accuracy
    } = body

    if (!entry_id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()

    // Get the current entry to validate it exists and is active
    const { data: currentEntry, error: fetchError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('id', entry_id)
      .single()

    if (fetchError || !currentEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      )
    }

    if (currentEntry.clock_out) {
      return NextResponse.json(
        { error: 'Time entry already clocked out' },
        { status: 400 }
      )
    }

    const clockOutTime = new Date().toISOString()

    // Update the time entry with clock out time
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        clock_out: clockOutTime,
        notes: notes ? `${currentEntry.notes || ''}\n${notes}`.trim() : currentEntry.notes,
        break_duration_minutes: break_duration_minutes || 0,
        location_lat: location_lat || currentEntry.location_lat,
        location_lng: location_lng || currentEntry.location_lng,
        location_accuracy: location_accuracy || currentEntry.location_accuracy,
        status: 'completed'
      })
      .eq('id', entry_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating time entry:', error)
      return NextResponse.json(
        { error: 'Failed to clock out: ' + error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ timeEntry: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}