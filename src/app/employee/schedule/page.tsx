'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  services?: Database['public']['Tables']['services']['Row'] | null
}

type ScheduleEntry = Database['public']['Tables']['employee_schedules']['Row'] & {
  bookings?: Booking | null
}

interface WeekData {
  weekStart: Date
  days: {
    date: Date
    bookings: Booking[]
    schedules: ScheduleEntry[]
  }[]
}

export default function EmployeeSchedule() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentWeek, setCurrentWeek] = useState(0) // 0 = this week, 1 = next week, etc.
  const [weekData, setWeekData] = useState<WeekData | null>(null)

  const getWeekStart = (weekOffset: number) => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - dayOfWeek + (weekOffset * 7))
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
  }

  const fetchScheduleData = useCallback(async (empId: string, weekOffset: number) => {
    try {
      setLoading(true)
      setError('')

      const weekStart = getWeekStart(weekOffset)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const weekStartStr = weekStart.toISOString().split('T')[0]
      const weekEndStr = weekEnd.toISOString().split('T')[0]

      // Fetch bookings assigned to this employee for the week
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          services (
            id,
            name,
            category
          )
        `)
        .eq('assigned_to', empId)
        .gte('scheduled_date', weekStartStr)
        .lte('scheduled_date', weekEndStr)
        .order('scheduled_date', { ascending: true })

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError)
        setError('Failed to load schedule')
        return
      }

      // Fetch employee schedules for the week
      const { data: schedules, error: schedulesError } = await supabase
        .from('employee_schedules')
        .select(`
          *,
          bookings (
            *,
            services (
              id,
              name,
              category
            )
          )
        `)
        .eq('employee_id', empId)
        .gte('scheduled_date', weekStartStr)
        .lte('scheduled_date', weekEndStr)
        .order('scheduled_date', { ascending: true })

      if (schedulesError) {
        console.error('Error fetching schedules:', schedulesError)
        setError('Failed to load schedule')
        return
      }

      // Organize data by day
      const days = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart)
        date.setDate(weekStart.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayBookings = (bookings || []).filter(booking => 
          booking.scheduled_date === dateStr
        )
        
        const daySchedules = (schedules || []).filter(schedule => 
          schedule.scheduled_date === dateStr
        )

        days.push({
          date,
          bookings: dayBookings,
          schedules: daySchedules
        })
      }

      setWeekData({
        weekStart,
        days
      })
    } catch (err) {
      console.error('Error fetching schedule:', err)
      setError('Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const empId = localStorage.getItem('employee_id')
    if (empId) {
      fetchScheduleData(empId, currentWeek)
    }
  }, [currentWeek, fetchScheduleData])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    
    try {
      // Handle both full datetime and time-only strings
      let date
      if (timeString.includes('T')) {
        date = new Date(timeString)
      } else {
        date = new Date(`2000-01-01T${timeString}`)
      }
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return timeString
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'requested':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-600 mt-1">
          View your assigned jobs and schedule
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Week Navigation */}
      <div className="mb-6 flex items-center justify-between bg-white rounded-lg shadow p-4">
        <button
          onClick={() => setCurrentWeek(prev => prev - 1)}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {weekData?.weekStart.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric'
            })} - {
              weekData ? new Date(weekData.weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }) : ''
            }
          </h2>
          {currentWeek === 0 && (
            <p className="text-sm text-blue-600 font-medium">This Week</p>
          )}
          {currentWeek === 1 && (
            <p className="text-sm text-green-600 font-medium">Next Week</p>
          )}
        </div>

        <button
          onClick={() => setCurrentWeek(prev => prev + 1)}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Next
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="space-y-4">
        {weekData?.days.map((day, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow ${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className={`px-4 py-3 border-b border-gray-200 ${isToday(day.date) ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-medium ${isToday(day.date) ? 'text-blue-900' : 'text-gray-900'}`}>
                  {formatDate(day.date)}
                  {isToday(day.date) && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Today
                    </span>
                  )}
                </h3>
                <span className="text-sm text-gray-500">
                  {day.bookings.length + day.schedules.length} {day.bookings.length + day.schedules.length === 1 ? 'job' : 'jobs'}
                </span>
              </div>
            </div>

            <div className="p-4">
              {day.bookings.length === 0 && day.schedules.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No jobs scheduled</p>
              ) : (
                <div className="space-y-3">
                  {/* Bookings */}
                  {day.bookings.map((booking) => (
                    <div key={`booking-${booking.id}`} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            {booking.services?.category && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                {booking.services.category}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-medium text-gray-900 mb-1">
                            {booking.services?.name || 'Service TBD'}
                          </h4>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {booking.scheduled_time 
                                ? formatTime(booking.scheduled_time)
                                : `${booking.requested_time_preference} preferred`
                              }
                            </p>
                            
                            {booking.notes && (
                              <p className="text-gray-500">
                                <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                {booking.notes}
                              </p>
                            )}
                            
                            {booking.admin_notes && (
                              <p className="text-blue-600 text-xs bg-blue-50 p-2 rounded">
                                Admin Note: {booking.admin_notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Employee Schedules */}
                  {day.schedules.map((schedule) => (
                    <div key={`schedule-${schedule.id}`} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              scheduled
                            </span>
                          </div>
                          
                          <h4 className="font-medium text-gray-900 mb-1">
                            {schedule.bookings?.services?.name || 'Scheduled Work'}
                          </h4>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </p>
                            
                            {schedule.notes && (
                              <p className="text-gray-600">
                                <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                {schedule.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="font-medium text-gray-900 mb-2">Week Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-semibold text-blue-600">
              {weekData?.days.reduce((sum, day) => sum + day.bookings.length + day.schedules.length, 0) || 0}
            </p>
            <p className="text-sm text-gray-500">Total Jobs</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-green-600">
              {weekData?.days.reduce((sum, day) => 
                sum + day.bookings.filter(b => b.status === 'confirmed').length, 0
              ) || 0}
            </p>
            <p className="text-sm text-gray-500">Confirmed</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-yellow-600">
              {weekData?.days.reduce((sum, day) => 
                sum + day.bookings.filter(b => b.status === 'requested').length, 0
              ) || 0}
            </p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-600">
              {weekData?.days.filter(day => day.bookings.length > 0 || day.schedules.length > 0).length || 0}
            </p>
            <p className="text-sm text-gray-500">Work Days</p>
          </div>
        </div>
      </div>
    </div>
  )
}