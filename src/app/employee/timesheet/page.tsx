'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type TimeEntry = Database['public']['Tables']['time_entries']['Row']

interface LocationCoords {
  latitude: number
  longitude: number
  accuracy: number
}

export default function EmployeeTimesheet() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isClockingIn, setIsClockingIn] = useState(false)
  const [isClockingOut, setIsClockingOut] = useState(false)
  const [location, setLocation] = useState<LocationCoords | null>(null)
  const [gpsEnabled, setGpsEnabled] = useState(false)
  const [notes, setNotes] = useState('')
  const [weekOffset, setWeekOffset] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
          setGpsEnabled(true)
        },
        (error) => {
          console.warn('Location access denied:', error)
          setGpsEnabled(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    }
  }

  const getWeekStart = (offset: number) => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - dayOfWeek + (offset * 7))
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
  }

  const fetchTimeData = useCallback(async (empId: string) => {
    try {
      setLoading(true)
      setError('')

      // Get active time entry
      const { data: active } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employee_id', empId)
        .eq('status', 'active')
        .is('clock_out', null)
        .single()

      setActiveEntry(active || null)

      // Get time entries for the current week
      const weekStart = getWeekStart(weekOffset)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const { data: entries, error: entriesError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employee_id', empId)
        .gte('clock_in', weekStart.toISOString())
        .lte('clock_in', weekEnd.toISOString())
        .order('clock_in', { ascending: false })

      if (entriesError) {
        console.error('Error fetching time entries:', entriesError)
        setError('Failed to load time entries')
        return
      }

      setTimeEntries(entries || [])
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load timesheet data')
    } finally {
      setLoading(false)
    }
  }, [weekOffset])

  useEffect(() => {
    const empId = localStorage.getItem('employee_id')
    if (empId) {
      setEmployeeId(empId)
      fetchTimeData(empId)
      requestLocation()
    }
  }, [weekOffset, fetchTimeData])

  const handleClockIn = async () => {
    if (!employeeId) return

    setIsClockingIn(true)
    setError('')
    setSuccess('')

    try {
      // Check if already clocked in
      if (activeEntry) {
        setError('You are already clocked in. Please clock out first.')
        return
      }

      // Refresh location if GPS is enabled
      if (gpsEnabled) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              })
              resolve()
            },
            () => resolve(), // Continue even if location fails
            { enableHighAccuracy: true, timeout: 5000 }
          )
        })
      }

      const clockInData = {
        employee_id: employeeId,
        clock_in: new Date().toISOString(),
        notes: notes || null,
        location_lat: location?.latitude || null,
        location_lng: location?.longitude || null,
        location_accuracy: location?.accuracy || null,
        status: 'active' as const
      }

      const { data, error } = await supabase
        .from('time_entries')
        .insert(clockInData)
        .select()
        .single()

      if (error) {
        console.error('Clock in error:', error)
        setError('Failed to clock in: ' + error.message)
        return
      }

      setActiveEntry(data)
      setNotes('')
      setSuccess('Successfully clocked in!')
      
      // Refresh the list
      fetchTimeData(employeeId)
    } catch (err) {
      console.error('Clock in error:', err)
      setError('Failed to clock in')
    } finally {
      setIsClockingIn(false)
    }
  }

  const handleClockOut = async () => {
    if (!employeeId || !activeEntry) return

    setIsClockingOut(true)
    setError('')
    setSuccess('')

    try {
      // Refresh location if GPS is enabled
      if (gpsEnabled) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              })
              resolve()
            },
            () => resolve(),
            { enableHighAccuracy: true, timeout: 5000 }
          )
        })
      }

      const clockOutTime = new Date().toISOString()
      
      const { error } = await supabase
        .from('time_entries')
        .update({
          clock_out: clockOutTime,
          notes: notes ? `${activeEntry.notes || ''}\nClock out: ${notes}`.trim() : activeEntry.notes,
          status: 'completed'
        })
        .eq('id', activeEntry.id)
        .select()
        .single()

      if (error) {
        console.error('Clock out error:', error)
        setError('Failed to clock out: ' + error.message)
        return
      }

      setActiveEntry(null)
      setNotes('')
      setSuccess('Successfully clocked out!')
      
      // Refresh the list
      fetchTimeData(employeeId)
    } catch (err) {
      console.error('Clock out error:', err)
      setError('Failed to clock out')
    } finally {
      setIsClockingOut(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
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

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const getCurrentDuration = () => {
    if (!activeEntry) return '0h 0m'
    
    const start = new Date(activeEntry.clock_in)
    const diff = currentTime.getTime() - start.getTime()
    const hours = diff / (1000 * 60 * 60)
    
    return formatDuration(hours)
  }

  const getWeekTotal = () => {
    return timeEntries
      .filter(entry => entry.total_hours)
      .reduce((sum, entry) => sum + (entry.total_hours || 0), 0)
  }

  const getWeekDates = () => {
    const start = getWeekStart(weekOffset)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    
    return {
      start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  const handleExportTimesheet = async () => {
    if (!employeeId) return

    setIsExporting(true)
    try {
      const weekStart = getWeekStart(weekOffset)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const startDate = weekStart.toISOString().split('T')[0]
      const endDate = weekEnd.toISOString().split('T')[0]

      const url = `/api/time-entries/export?employee_id=${employeeId}&start_date=${startDate}&end_date=${endDate}&format=csv`
      
      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `timesheet-${startDate}-${endDate}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setSuccess('Timesheet exported successfully!')
    } catch (err) {
      console.error('Export error:', err)
      setError('Failed to export timesheet')
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
        <h1 className="text-2xl font-bold text-gray-900">Timesheet</h1>
        <p className="text-gray-600 mt-1">
          Track your work hours and manage time entries
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Current Status */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Current Time</p>
            <p className="text-3xl font-mono font-bold text-gray-900">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}
            </p>
            <p className="text-sm text-gray-500">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {activeEntry ? (
            <div className="mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full mb-4">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse mr-2"></div>
                Currently Working
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Clocked in at {formatTime(activeEntry.clock_in)}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {getCurrentDuration()}
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-full mb-4">
                <div className="w-2 h-2 bg-gray-600 rounded-full mr-2"></div>
                Not Working
              </div>
              <p className="text-sm text-gray-600">Ready to clock in</p>
            </div>
          )}

          {/* GPS Status */}
          <div className="mb-4 text-sm">
            <div className={`inline-flex items-center px-2 py-1 rounded-full ${
              gpsEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {gpsEnabled ? 'GPS Enabled' : 'GPS Disabled'}
            </div>
          </div>

          {/* Notes Input */}
          <div className="mb-6">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={activeEntry ? "Add notes for clock out..." : "Add notes for clock in..."}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>

          {/* Clock In/Out Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!activeEntry ? (
              <button
                onClick={handleClockIn}
                disabled={isClockingIn}
                className="flex items-center justify-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isClockingIn ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Clocking In...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Clock In
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleClockOut}
                disabled={isClockingOut}
                className="flex items-center justify-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isClockingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Clocking Out...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Clock Out
                  </>
                )}
              </button>
            )}

            <button
              onClick={requestLocation}
              className="flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh GPS
            </button>
          </div>
        </div>
      </div>

      {/* Week Navigation and Summary */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="text-center">
            <h3 className="font-semibold text-gray-900">
              {getWeekDates().start} - {getWeekDates().end}
            </h3>
            {weekOffset === 0 && (
              <p className="text-sm text-blue-600 font-medium">This Week</p>
            )}
          </div>

          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Next
            <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">Total Hours This Week</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatDuration(getWeekTotal())}
          </p>
          
          <div className="mt-4">
            <button
              onClick={handleExportTimesheet}
              disabled={isExporting}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Time Entries List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Time Entries</h3>
        </div>

        {timeEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No time entries for this week</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-gray-900">
                        {formatDate(entry.clock_in)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        entry.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : entry.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(entry.clock_in)} - {entry.clock_out ? formatTime(entry.clock_out) : 'Active'}
                      </p>
                      
                      {entry.notes && (
                        <p className="text-gray-500 text-xs">
                          <svg className="inline h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          {entry.notes}
                        </p>
                      )}
                      
                      {(entry.location_lat && entry.location_lng) && (
                        <p className="text-gray-400 text-xs">
                          <svg className="inline h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          GPS tracked
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {entry.status === 'active' 
                        ? getCurrentDuration() 
                        : entry.total_hours 
                        ? formatDuration(entry.total_hours)
                        : '--'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}