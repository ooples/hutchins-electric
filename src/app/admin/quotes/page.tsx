'use client'

import { useEffect, useState } from 'react'
import { getServiceSupabase } from '@/lib/supabase'

interface QuoteRequest {
  id: string
  customer_name: string
  email: string
  phone: string
  service_type: string
  description: string | null
  property_type: 'residential' | 'commercial'
  urgency: 'normal' | 'emergency'
  preferred_date: string | null
  status: 'pending' | 'contacted' | 'scheduled' | 'completed'
  created_at: string
}

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<QuoteRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchQuotes()
  }, [])

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredQuotes(quotes)
    } else {
      setFilteredQuotes(quotes.filter(quote => quote.status === statusFilter))
    }
  }, [quotes, statusFilter])

  const fetchQuotes = async () => {
    try {
      const supabase = getServiceSupabase()
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuotes(data || [])
    } catch (err) {
      console.error('Error fetching quotes:', err)
      setError('Failed to load quotes')
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuoteStatus = async (quoteId: string, newStatus: string) => {
    setUpdatingStatus(quoteId)
    try {
      const supabase = getServiceSupabase()
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: newStatus })
        .eq('id', quoteId)

      if (error) throw error

      // Update local state
      setQuotes(prev => prev.map(quote => 
        quote.id === quoteId ? { ...quote, status: newStatus as QuoteRequest['status'] } : quote
      ))
    } catch (err) {
      console.error('Error updating quote status:', err)
      alert('Failed to update quote status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const formatDate = (dateString: string) => {
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
  }

  const getUrgencyBadge = (urgency: string) => {
    return urgency === 'emergency' 
      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
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
        <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage and track all customer quote requests
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
          All ({quotes.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            statusFilter === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } border border-gray-300`}
        >
          Pending ({quotes.filter(q => q.status === 'pending').length})
        </button>
        <button
          onClick={() => setStatusFilter('contacted')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            statusFilter === 'contacted'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } border border-gray-300`}
        >
          Contacted ({quotes.filter(q => q.status === 'contacted').length})
        </button>
        <button
          onClick={() => setStatusFilter('scheduled')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            statusFilter === 'scheduled'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } border border-gray-300`}
        >
          Scheduled ({quotes.filter(q => q.status === 'scheduled').length})
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            statusFilter === 'completed'
              ? 'bg-green-100 text-green-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } border border-gray-300`}
        >
          Completed ({quotes.filter(q => q.status === 'completed').length})
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Quotes List */}
      <div className="space-y-4">
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quote requests</h3>
            <p className="mt-1 text-sm text-gray-500">No quote requests match your current filter.</p>
          </div>
        ) : (
          filteredQuotes.map((quote) => (
            <div key={quote.id} className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {quote.customer_name}
                      </h3>
                      <span className={getStatusBadge(quote.status)}>
                        {quote.status}
                      </span>
                      <span className={getUrgencyBadge(quote.urgency)}>
                        {quote.urgency}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>{quote.email}</span>
                      <span>{quote.phone}</span>
                      <span>{quote.service_type}</span>
                      <span className="capitalize">{quote.property_type}</span>
                      <span>{formatDate(quote.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={quote.status}
                      onChange={(e) => updateQuoteStatus(quote.id, e.target.value)}
                      disabled={updatingStatus === quote.id}
                      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => setExpandedQuote(expandedQuote === quote.id ? null : quote.id)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className={`h-5 w-5 transition-transform ${
                          expandedQuote === quote.id ? 'rotate-180' : ''
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

                {expandedQuote === quote.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Email:</span> 
                            <a href={`mailto:${quote.email}`} className="text-blue-600 hover:underline ml-1">
                              {quote.email}
                            </a>
                          </p>
                          <p><span className="font-medium">Phone:</span> 
                            <a href={`tel:${quote.phone}`} className="text-blue-600 hover:underline ml-1">
                              {quote.phone}
                            </a>
                          </p>
                          {quote.preferred_date && (
                            <p><span className="font-medium">Preferred Date:</span> {quote.preferred_date}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Service Details</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Service:</span> {quote.service_type}</p>
                          <p><span className="font-medium">Property:</span> {quote.property_type}</p>
                          <p><span className="font-medium">Urgency:</span> {quote.urgency}</p>
                        </div>
                      </div>
                    </div>
                    {quote.description && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">
                          {quote.description}
                        </p>
                      </div>
                    )}
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