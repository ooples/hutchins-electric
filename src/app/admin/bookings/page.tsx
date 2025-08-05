'use client'

import { useEffect, useState } from 'react'
import { getServiceSupabase } from '@/lib/supabase'

interface Booking {
  id: string
  customer_id: string | null
  service_id: string | null
  requested_date: string
  requested_time_preference: 'morning' | 'afternoon' | 'evening' | 'emergency'
  scheduled_date: string | null
  scheduled_time: string | null
  assigned_to: string | null
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled'
  notes: string | null
  admin_notes: string | null
  created_at: string
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [editingBooking, setEditingBooking] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    scheduled_date: '',
    scheduled_time: '',
    admin_notes: '',
    assigned_to: ''
  })

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredBookings(bookings)
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === statusFilter))
    }
  }, [bookings, statusFilter])

  const fetchBookings = async () => {
    try {
      const supabase = getServiceSupabase()
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('requested_date', { ascending: true })

      if (error) throw error
      setBookings(data || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingStatus(bookingId)
    try {
      const supabase = getServiceSupabase()
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus as Booking['status'] } : booking
      ))
    } catch (err) {
      console.error('Error updating booking status:', err)
      alert('Failed to update booking status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const updateBookingDetails = async (bookingId: string) => {
    try {
      const supabase = getServiceSupabase()
      const { error } = await supabase
        .from('bookings')
        .update({
          scheduled_date: editForm.scheduled_date || null,
          scheduled_time: editForm.scheduled_time || null,
          admin_notes: editForm.admin_notes || null,
          assigned_to: editForm.assigned_to || null
        })
        .eq('id', bookingId)

      if (error) throw error

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { 
              ...booking, 
              scheduled_date: editForm.scheduled_date || null,
              scheduled_time: editForm.scheduled_time || null,
              admin_notes: editForm.admin_notes || null,
              assigned_to: editForm.assigned_to || null
            } 
          : booking
      ))

      setEditingBooking(null)
      setEditForm({ scheduled_date: '', scheduled_time: '', admin_notes: '', assigned_to: '' })
    } catch (err) {
      console.error('Error updating booking details:', err)
      alert('Failed to update booking details')
    }
  }

  const startEditing = (booking: Booking) => {
    setEditingBooking(booking.id)
    setEditForm({
      scheduled_date: booking.scheduled_date || '',
      scheduled_time: booking.scheduled_time || '',
      admin_notes: booking.admin_notes || '',
      assigned_to: booking.assigned_to || ''
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    
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

  const getTimePreferenceBadge = (preference: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    
    switch (preference) {
      case 'emergency':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'morning':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'afternoon':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'evening':
        return `${baseClasses} bg-purple-100 text-purple-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage and schedule customer appointments
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            statusFilter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } border border-gray-300`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setStatusFilter('requested')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            statusFilter === 'requested'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } border border-gray-300`}
        >
          Requested ({bookings.filter(b => b.status === 'requested').length})
        </button>
        <button
          onClick={() => setStatusFilter('confirmed')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            statusFilter === 'confirmed'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } border border-gray-300`}
        >
          Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            statusFilter === 'completed'
              ? 'bg-green-100 text-green-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } border border-gray-300`}
        >
          Completed ({bookings.filter(b => b.status === 'completed').length})
        </button>
        <button
          onClick={() => setStatusFilter('cancelled')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            statusFilter === 'cancelled'
              ? 'bg-red-100 text-red-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } border border-gray-300`}
        >
          Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
            <p className="mt-1 text-sm text-gray-500">No bookings match your current filter.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        Booking #{booking.id.slice(-8)}
                      </h3>
                      <span className={getStatusBadge(booking.status)}>
                        {booking.status}
                      </span>
                      <span className={getTimePreferenceBadge(booking.requested_time_preference)}>
                        {booking.requested_time_preference}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>Requested: {formatDate(booking.requested_date)}</span>
                      {booking.scheduled_date && (
                        <span className="text-blue-600 font-medium">
                          Scheduled: {formatDate(booking.scheduled_date)}
                          {booking.scheduled_time && ` at ${booking.scheduled_time}`}
                        </span>
                      )}
                      {booking.assigned_to && (
                        <span>Assigned to: {booking.assigned_to}</span>
                      )}
                      <span>Created: {formatDateTime(booking.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={booking.status}
                      onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                      disabled={updatingStatus === booking.id}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="requested">Requested</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className={`h-5 w-5 transition-transform ${
                          expandedBooking === booking.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {expandedBooking === booking.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Booking Details */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Booking Details</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><span className="font-medium">Booking ID:</span> {booking.id}</p>
                          <p><span className="font-medium">Requested Date:</span> {formatDate(booking.requested_date)}</p>
                          <p><span className="font-medium">Time Preference:</span> {booking.requested_time_preference}</p>
                          {booking.scheduled_date && (
                            <p><span className="font-medium">Scheduled Date:</span> {formatDate(booking.scheduled_date)}</p>
                          )}
                          {booking.scheduled_time && (
                            <p><span className="font-medium">Scheduled Time:</span> {booking.scheduled_time}</p>
                          )}
                          {booking.assigned_to && (
                            <p><span className="font-medium">Assigned To:</span> {booking.assigned_to}</p>
                          )}
                        </div>
                        
                        {booking.notes && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-1">Customer Notes</h5>
                            <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-2">
                              {booking.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Admin Actions */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">Admin Actions</h4>
                          {editingBooking !== booking.id ? (
                            <button
                              onClick={() => startEditing(booking)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                            >
                              Edit Details
                            </button>
                          ) : (
                            <div className="space-x-2">
                              <button
                                onClick={() => updateBookingDetails(booking.id)}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingBooking(null)
                                  setEditForm({ scheduled_date: '', scheduled_time: '', admin_notes: '', assigned_to: '' })
                                }}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>

                        {editingBooking === booking.id ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Scheduled Date
                              </label>
                              <input
                                type="date"
                                value={editForm.scheduled_date}
                                onChange={(e) => setEditForm(prev => ({ ...prev, scheduled_date: e.target.value }))}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Scheduled Time
                              </label>
                              <input
                                type="time"
                                value={editForm.scheduled_time}
                                onChange={(e) => setEditForm(prev => ({ ...prev, scheduled_time: e.target.value }))}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Assigned To
                              </label>
                              <input
                                type="text"
                                value={editForm.assigned_to}
                                onChange={(e) => setEditForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                                placeholder="Technician name"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Admin Notes
                              </label>
                              <textarea
                                value={editForm.admin_notes}
                                onChange={(e) => setEditForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                                placeholder="Internal notes..."
                                rows={3}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 text-sm text-gray-600">
                            {booking.admin_notes ? (
                              <div>
                                <span className="font-medium text-gray-900">Admin Notes:</span>
                                <p className="mt-1 bg-gray-50 rounded-md p-2">{booking.admin_notes}</p>
                              </div>
                            ) : (
                              <p className="text-gray-400 italic">No admin notes</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}