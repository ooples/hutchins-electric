'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle, CheckCircle, Calendar, Clock } from 'lucide-react'

type ScheduleFormData = {
  customer_name: string
  email: string
  phone: string
  service_type: string
  requested_date: string
  requested_time_preference: 'morning' | 'afternoon' | 'evening' | 'emergency'
  notes?: string
  sms_consent?: boolean
}

export default function SchedulePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ScheduleFormData>()

  const onSubmit = async (data: ScheduleFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to submit booking')

      setSubmitStatus('success')
      reset()
    } catch (error) {
      console.error('Error submitting booking:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate dates for the next 30 days
  const generateDateOptions = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const dateOptions = generateDateOptions()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schedule Service</h1>
              <p className="text-gray-600">Book your electrical service appointment online</p>
            </div>
          </div>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Appointment request submitted!</p>
                <p className="text-green-700 text-sm mt-1">
                  We&apos;ll confirm your appointment within 24 hours. You&apos;ll receive an email and text confirmation.
                </p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Failed to submit appointment request.</p>
                <p className="text-red-700 text-sm mt-1">Please try again or call us at 802-555-0123.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="customer_name"
                  {...register('customer_name', { required: 'Name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.customer_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[\d\s()-]+$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-1">
                Service Needed *
              </label>
              <select
                id="service_type"
                {...register('service_type', { required: 'Please select a service' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a service</option>
                <option value="Panel Upgrade">Panel Upgrade</option>
                <option value="Outlet/Switch Installation">Outlet/Switch Installation</option>
                <option value="Lighting Installation">Lighting Installation</option>
                <option value="Home Rewiring">Home Rewiring</option>
                <option value="EV Charger Installation">EV Charger Installation</option>
                <option value="Electrical Inspection">Electrical Inspection</option>
                <option value="Emergency Repair">Emergency Repair</option>
                <option value="Other">Other (describe in notes)</option>
              </select>
              {errors.service_type && (
                <p className="mt-1 text-sm text-red-600">{errors.service_type.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="requested_date" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Date *
              </label>
              <select
                id="requested_date"
                {...register('requested_date', { required: 'Please select a date' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a date</option>
                {dateOptions.map((date) => {
                  const dateString = date.toISOString().split('T')[0]
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
                  const dateDisplay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  return (
                    <option key={dateString} value={dateString}>
                      {dayName}, {dateDisplay}
                    </option>
                  )
                })}
              </select>
              {errors.requested_date && (
                <p className="mt-1 text-sm text-red-600">{errors.requested_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Time *
              </label>
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="radio"
                    value="morning"
                    {...register('requested_time_preference', { required: 'Please select a time preference' })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <span className="font-medium">Morning</span>
                    <span className="text-gray-600 text-sm block">8:00 AM - 12:00 PM</span>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="radio"
                    value="afternoon"
                    {...register('requested_time_preference', { required: 'Please select a time preference' })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <span className="font-medium">Afternoon</span>
                    <span className="text-gray-600 text-sm block">12:00 PM - 5:00 PM</span>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="radio"
                    value="evening"
                    {...register('requested_time_preference', { required: 'Please select a time preference' })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <span className="font-medium">Evening</span>
                    <span className="text-gray-600 text-sm block">5:00 PM - 8:00 PM</span>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="radio"
                    value="emergency"
                    {...register('requested_time_preference', { required: 'Please select a time preference' })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <span className="font-medium text-red-600">Emergency - ASAP</span>
                    <span className="text-gray-600 text-sm block">For urgent electrical issues</span>
                  </div>
                </label>
              </div>
              {errors.requested_time_preference && (
                <p className="mt-1 text-sm text-red-600">{errors.requested_time_preference.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                {...register('notes')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special instructions or details about the work needed..."
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="sms_consent"
                  {...register('sms_consent')}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="sms_consent" className="ml-3 text-sm text-gray-700">
                  <span className="font-medium">SMS Notifications (Optional)</span>
                  <p className="text-gray-600 mt-1">
                    I consent to receive SMS text messages from Hutchins Electric regarding my appointment
                    confirmations, reminders, and service updates. Message and data rates may apply.
                    Reply STOP to unsubscribe at any time.
                  </p>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-900 font-medium">How scheduling works:</p>
                  <ul className="mt-2 text-blue-800 space-y-1">
                    <li>• Submit your preferred date and time</li>
                    <li>• We&apos;ll review our schedule and confirm within 24 hours</li>
                    <li>• You&apos;ll receive email and text confirmation</li>
                    <li>• We&apos;ll call if we need to suggest alternative times</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Request Appointment'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Need immediate emergency service? Call us now at{' '}
              <a href="tel:802-555-0123" className="text-blue-600 font-medium hover:underline">
                802-555-0123
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}