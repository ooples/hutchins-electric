'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type TimeEntry = Database['public']['Tables']['time_entries']['Row']
type Booking = Database['public']['Tables']['bookings']['Row']

interface DashboardStats {
  todayHours: number
  weekHours: number
  activeTimeEntry: TimeEntry | null
  upcomingBookings: Booking[]
  recentTimeEntries: TimeEntry[]
}

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<DashboardStats>({
    todayHours: 0,
    weekHours: 0,
    activeTimeEntry: null,
    upcomingBookings: [],
    recentTimeEntries: []
  })
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const empId = localStorage.getItem('employee_id')
    if (empId) {
      setEmployeeId(empId)
      fetchDashboardData(empId)
    }
  }, [])

  const fetchDashboardData = async (empId: string) => {
    try {
      setLoading(true)
      setError('')

      const today = new Date().toISOString().split('T')[0]
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week (Sunday)
      const weekStartStr = weekStart.toISOString().split('T')[0]

      // Fetch active time entry
      const { data: activeEntry } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employee_id', empId)
        .eq('status', 'active')
        .is('clock_out', null)
        .single()

      // Fetch today's total hours
      const { data: todayEntries } = await supabase
        .from('time_entries')
        .select('total_hours')
        .eq('employee_id', empId)
        .gte('clock_in', today)
        .lt('clock_in', new Date(Date.now() + 86400000).toISOString().split('T')[0])
        .not('total_hours', 'is', null)

      const todayHours = todayEntries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0

      // Fetch this week's total hours
      const { data: weekEntries } = await supabase
        .from('time_entries')
        .select('total_hours')
        .eq('employee_id', empId)
        .gte('clock_in', weekStartStr)
        .not('total_hours', 'is', null)

      const weekHours = weekEntries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0

      // Fetch upcoming bookings assigned to this employee
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('assigned_to', empId)
        .in('status', ['requested', 'confirmed'])
        .gte('scheduled_date', today)
        .order('scheduled_date', { ascending: true })
        .limit(5)

      // Fetch recent time entries
      const { data: recentEntries } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employee_id', empId)
        .order('clock_in', { ascending: false })
        .limit(5)

      setStats({
        todayHours,
        weekHours,
        activeTimeEntry: activeEntry || null,
        upcomingBookings: bookings || [],
        recentTimeEntries: recentEntries || []
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const getActiveEntryDuration = () => {
    if (!stats.activeTimeEntry) return '0h 0m'
    
    const start = new Date(stats.activeTimeEntry.clock_in)
    const diff = currentTime.getTime() - start.getTime()
    const hours = diff / (1000 * 60 * 60)
    
    return formatHours(hours)
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <p className="text-lg font-mono text-blue-600 mt-1">
          {formatTime(currentTime)}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Hours</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatHours(stats.todayHours)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Week</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatHours(stats.weekHours)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Upcoming Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.upcomingBookings.length}
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-lg shadow p-6 ${stats.activeTimeEntry ? 'ring-2 ring-green-500' : ''}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className={`h-8 w-8 ${stats.activeTimeEntry ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v5a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {stats.activeTimeEntry ? 'Currently Working' : 'Clocked Out'}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.activeTimeEntry ? getActiveEntryDuration() : '---'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/employee/timesheet"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">Timesheet</p>
            <p className="text-sm text-blue-100">Clock in/out</p>
          </Link>

          <Link
            href="/employee/schedule"
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-medium">Schedule</p>
            <p className="text-sm text-green-100">View jobs</p>
          </Link>

          <button
            onClick={() => fetchDashboardData(employeeId!)}
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className="font-medium">Refresh</p>
            <p className="text-sm text-gray-100">Update data</p>
          </button>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Jobs</h2>
        <div className="bg-white rounded-lg shadow">
          {stats.upcomingBookings.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <svg className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No upcoming jobs scheduled</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {stats.upcomingBookings.map((booking) => (
                <div key={booking.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.scheduled_date ? formatDate(booking.scheduled_date) : 'Date TBD'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.scheduled_time || 'Time TBD'}
                      </p>
                      {booking.notes && (
                        <p className="text-sm text-gray-600 mt-1">{booking.notes}</p>
                      )}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Time Entries */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Time Entries</h2>
        <div className="bg-white rounded-lg shadow">
          {stats.recentTimeEntries.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <svg className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No time entries yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {stats.recentTimeEntries.map((entry) => (
                <div key={entry.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(entry.clock_in)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.clock_in).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {entry.clock_out 
                          ? new Date(entry.clock_out).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Active'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {entry.total_hours ? formatHours(entry.total_hours) : 'Active'}
                      </p>
                      <p className={`text-xs ${
                        entry.status === 'active' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {entry.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}