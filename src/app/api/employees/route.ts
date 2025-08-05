import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// GET /api/employees - Get all employees
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase()
    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get('include_inactive') === 'true'
    
    let query = supabase
      .from('employees')
      .select(`
        *,
        users (
          id,
          email,
          role,
          created_at
        )
      `)
      .order('last_name', { ascending: true })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching employees:', error)
      return NextResponse.json(
        { error: 'Failed to fetch employees' },
        { status: 500 }
      )
    }

    return NextResponse.json({ employees: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/employees - Create new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      employee_number,
      first_name,
      last_name,
      phone,
      hire_date,
      hourly_rate,
      job_title,
      department,
      emergency_contact_name,
      emergency_contact_phone,
      address,
      city,
      state,
      zip_code,
      notes
    } = body

    // Validate required fields
    if (!email || !first_name || !last_name || !hire_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()

    // Generate employee number if not provided
    const finalEmployeeNumber = employee_number || `EMP${Date.now().toString().slice(-6)}`

    // Check if employee number already exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('employee_number', finalEmployeeNumber)
      .single()

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee number already exists' },
        { status: 400 }
      )
    }

    // Create user account first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        role: 'employee'
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user:', userError)
      return NextResponse.json(
        { error: 'Failed to create user account: ' + userError.message },
        { status: 400 }
      )
    }

    // Create employee record
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .insert({
        user_id: userData.id,
        employee_number: finalEmployeeNumber,
        first_name,
        last_name,
        phone: phone || null,
        hire_date,
        hourly_rate: hourly_rate ? parseFloat(hourly_rate) : null,
        job_title: job_title || null,
        department: department || 'electrical',
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        notes: notes || null
      })
      .select(`
        *,
        users (
          id,
          email,
          role,
          created_at
        )
      `)
      .single()

    if (employeeError) {
      console.error('Error creating employee:', employeeError)
      
      // Clean up user if employee creation failed
      await supabase.from('users').delete().eq('id', userData.id)
      
      return NextResponse.json(
        { error: 'Failed to create employee: ' + employeeError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ employee: employeeData }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}