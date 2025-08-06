import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

// GET /api/employees/[id] - Get single employee
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = getServiceSupabase()
    
    const { data, error } = await supabase
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
      .eq('id', resolvedParams.id)
      .single()

    if (error) {
      console.error('Error fetching employee:', error)
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ employee: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/employees/[id] - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
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
      is_active,
      emergency_contact_name,
      emergency_contact_phone,
      address,
      city,
      state,
      zip_code,
      notes
    } = body

    // Validate required fields
    if (!first_name || !last_name || !hire_date || !employee_number) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()

    // First, get the current employee to access user_id
    const { data: currentEmployee, error: fetchError } = await supabase
      .from('employees')
      .select('user_id, employee_number')
      .eq('id', resolvedParams.id)
      .single()

    if (fetchError || !currentEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Check if employee number is being changed and if it already exists
    if (employee_number !== currentEmployee.employee_number) {
      const { data: existingEmployee } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_number', employee_number)
        .neq('id', resolvedParams.id)
        .single()

      if (existingEmployee) {
        return NextResponse.json(
          { error: 'Employee number already exists' },
          { status: 400 }
        )
      }
    }

    // Update user email if provided and changed
    if (email && currentEmployee.user_id) {
      const { error: userError } = await supabase
        .from('users')
        .update({ email })
        .eq('id', currentEmployee.user_id)

      if (userError) {
        console.error('Error updating user:', userError)
        return NextResponse.json(
          { error: 'Failed to update user email: ' + userError.message },
          { status: 400 }
        )
      }
    }

    // Update employee record
    const { data, error } = await supabase
      .from('employees')
      .update({
        employee_number,
        first_name,
        last_name,
        phone: phone || null,
        hire_date,
        hourly_rate: hourly_rate ? parseFloat(hourly_rate) : null,
        job_title: job_title || null,
        department: department || 'electrical',
        is_active: is_active !== undefined ? is_active : true,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        notes: notes || null
      })
      .eq('id', resolvedParams.id)
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

    if (error) {
      console.error('Error updating employee:', error)
      return NextResponse.json(
        { error: 'Failed to update employee: ' + error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ employee: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/employees/[id] - Deactivate employee (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const supabase = getServiceSupabase()

    // Instead of hard delete, we deactivate the employee
    const { data, error } = await supabase
      .from('employees')
      .update({ is_active: false })
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (error) {
      console.error('Error deactivating employee:', error)
      return NextResponse.json(
        { error: 'Failed to deactivate employee' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      message: 'Employee deactivated successfully',
      employee: data 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}