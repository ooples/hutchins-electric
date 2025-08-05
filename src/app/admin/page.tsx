'use client'

import { useEffect, useState } from 'react'
import { getServiceSupabase } from '@/lib/supabase'
import Link from 'next/link'

interface DashboardStats {
  totalQuotes: number
  pendingQuotes: number
  totalBookings: number
  upcomingBookings: number
  completedThisMonth: number
  emergencyRequests: number
}

interface RecentActivity {
  id: string
  type: 'quote' | 'booking'
  customer_name?: string
  status: string
  created_at: string
  urgency?: string
  requested_time_preference?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotes: 0,
    pendingQuotes: 0,
    totalBookings: 0,
    upcomingBookings: 0,
    completedThisMonth: 0,
    emergencyRequests: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const supabase = getServiceSupabase()
      
      // Fetch quotes
      const { data: quotes, error: quotesError } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (quotesError) throw quotesError

      // Fetch bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (bookingsError) throw bookingsError

      // Calculate stats
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()

      const pendingQuotes = quotes?.filter(q => q.status === 'pending').length || 0
      const emergencyQuotes = quotes?.filter(q => q.urgency === 'emergency').length || 0
      const emergencyBookings = bookings?.filter(b => b.requested_time_preference === 'emergency').length || 0
      
      const upcomingBookings = bookings?.filter(b => {
        if (!b.scheduled_date) return false
        const scheduledDate = new Date(b.scheduled_date)
        return scheduledDate >= currentDate && b.status === 'confirmed'
      }).length || 0

      const completedThisMonth = (quotes?.filter(q => {
        if (q.status !== 'completed') return false
        const createdDate = new Date(q.created_at)
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
      }).length || 0) + (bookings?.filter(b => {
        if (b.status !== 'completed') return false
        const createdDate = new Date(b.created_at)
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
      }).length || 0)

      setStats({
        totalQuotes: quotes?.length || 0,
        pendingQuotes,
        totalBookings: bookings?.length || 0,
        upcomingBookings,
        completedThisMonth,
        emergencyRequests: emergencyQuotes + emergencyBookings
      })

      // Prepare recent activity
      const recentQuotes = quotes?.slice(0, 3).map(q => ({
        id: q.id,
        type: 'quote' as const,
        customer_name: q.customer_name,
        status: q.status,
        created_at: q.created_at,
        urgency: q.urgency
      })) || []

      const recentBookings = bookings?.slice(0, 3).map(b => ({
        id: b.id,
        type: 'booking' as const,
        status: b.status,
        created_at: b.created_at,
        requested_time_preference: b.requested_time_preference
      })) || []

      // Combine and sort by created_at
      const combined = [...recentQuotes, ...recentBookings]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      setRecentActivity(combined)

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string, type: 'quote' | 'booking') => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    
    if (type === 'quote') {
      switch (status) {
        case 'pending':
          return `${baseClasses} bg-yellow-100 text-yellow-800`
        case 'contacted':
          return `${baseClasses} bg-blue-100 text-blue-800`
        case 'scheduled':
          return `${baseClasses} bg-purple-100 text-purple-800`
        case 'completed':
          return `${baseClasses} bg-green-100 text-green-800`
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`
      }
    } else {
      switch (status) {
        case 'requested':
          return `${baseClasses} bg-yellow-100 text-yellow-800`
        case 'confirmed':
          return `${baseClasses} bg-blue-100 text-blue-800`
        case 'completed':
          return `${baseClasses} bg-green-100 text-green-800`
        case 'cancelled':
          return `${baseClasses} bg-red-100 text-red-800`
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`
      }
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your Hutchins Electric admin dashboard
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Quotes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Quotes</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalQuotes}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link href="/admin/quotes" className="text-sm text-blue-600 hover:text-blue-500">
              View all quotes →
            </Link>
          </div>
        </div>

        {/* Pending Quotes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Quotes</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pendingQuotes}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link href="/admin/quotes" className="text-sm text-yellow-600 hover:text-yellow-500">
              Review pending →
            </Link>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalBookings}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link href="/admin/bookings" className="text-sm text-purple-600 hover:text-purple-500">
              View all bookings →
            </Link>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Bookings</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.upcomingBookings}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link href="/admin/bookings" className="text-sm text-blue-600 hover:text-blue-500">
              View schedule →
            </Link>
          </div>
        </div>

        {/* Completed This Month */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed This Month</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.completedThisMonth}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <span className="text-sm text-gray-500">
              Jobs completed in {new Date().toLocaleDateString('en-US', { month: 'long' })}
            </span>
          </div>
        </div>

        {/* Emergency Requests */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.262 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Emergency Requests</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.emergencyRequests}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <span className="text-sm text-red-600 font-medium">
              Requires immediate attention
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={`${activity.type}-${activity.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'quote' ? (
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {activity.type === 'quote' ? 'Quote Request' : 'Booking'}
                          {activity.customer_name && ` from ${activity.customer_name}`}
                        </span>
                        <span className={getStatusBadge(activity.status, activity.type)}>
                          {activity.status}
                        </span>
                        {activity.urgency === 'emergency' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Emergency
                          </span>
                        )}
                        {activity.requested_time_preference === 'emergency' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Emergency
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(activity.created_at)}</p>
                    </div>
                  </div>
                  <Link
                    href={activity.type === 'quote' ? '/admin/quotes' : '/admin/bookings'}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link href="/admin/quotes" className="font-medium text-blue-600 hover:text-blue-500 mr-4">
              View all quotes →
            </Link>
            <Link href="/admin/bookings" className="font-medium text-blue-600 hover:text-blue-500">
              View all bookings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}