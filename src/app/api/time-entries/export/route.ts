import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// GET /api/time-entries/export - Export timesheet data as CSV
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase()
    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get('employee_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const format = searchParams.get('format') || 'csv'
    
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    // Fetch employee info
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        *,
        users (
          email
        )
      `)
      .eq('id', employeeId)
      .single()

    if (empError || !employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Fetch time entries for the date range
    const { data: timeEntries, error: entriesError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('clock_in', startDate)
      .lte('clock_in', endDate + 'T23:59:59.999Z')
      .order('clock_in', { ascending: true })

    if (entriesError) {
      console.error('Error fetching time entries:', entriesError)
      return NextResponse.json(
        { error: 'Failed to fetch time entries' },
        { status: 500 }
      )
    }

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'Date',
        'Clock In',
        'Clock Out',
        'Break (minutes)',
        'Total Hours',
        'Status',
        'Notes',
        'GPS Tracked'
      ]

      const csvRows = timeEntries?.map(entry => {
        const date = new Date(entry.clock_in).toLocaleDateString()
        const clockIn = new Date(entry.clock_in).toLocaleTimeString()
        const clockOut = entry.clock_out 
          ? new Date(entry.clock_out).toLocaleTimeString()
          : 'Not clocked out'
        const breakMinutes = entry.break_duration_minutes || 0
        const totalHours = entry.total_hours 
          ? `${entry.total_hours.toFixed(2)}`
          : 'N/A'
        const status = entry.status
        const notes = (entry.notes || '').replace(/"/g, '""') // Escape quotes
        const gpsTracked = (entry.location_lat && entry.location_lng) ? 'Yes' : 'No'

        return [
          date,
          clockIn,
          clockOut,
          breakMinutes,
          totalHours,
          status,
          `"${notes}"`,
          gpsTracked
        ].join(',')
      }) || []

      const csvContent = [
        `Timesheet Export for ${employee.first_name} ${employee.last_name}`,
        `Employee #: ${employee.employee_number}`,
        `Email: ${employee.users?.email}`,
        `Export Date: ${new Date().toLocaleDateString()}`,
        `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
        '',
        csvHeaders.join(','),
        ...csvRows
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="timesheet-${employee.employee_number}-${startDate}-${endDate}.csv"`
        }
      })
    }

    // Return JSON format if not CSV
    const summary = {
      employee: {
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        employee_number: employee.employee_number,
        email: employee.users?.email
      },
      period: {
        start: startDate,
        end: endDate
      },
      summary: {
        total_entries: timeEntries?.length || 0,
        total_hours: timeEntries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0,
        completed_entries: timeEntries?.filter(entry => entry.status === 'completed').length || 0,
        active_entries: timeEntries?.filter(entry => entry.status === 'active').length || 0
      },
      entries: timeEntries?.map(entry => ({
        id: entry.id,
        date: new Date(entry.clock_in).toLocaleDateString(),
        clock_in: entry.clock_in,
        clock_out: entry.clock_out,
        total_hours: entry.total_hours,
        break_duration_minutes: entry.break_duration_minutes,
        status: entry.status,
        notes: entry.notes,
        gps_tracked: !!(entry.location_lat && entry.location_lng),
        created_at: entry.created_at
      })) || []
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}