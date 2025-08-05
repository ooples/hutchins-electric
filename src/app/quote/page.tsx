'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle, CheckCircle } from 'lucide-react'

type QuoteFormData = {
  customer_name: string
  email: string
  phone: string
  service_type: string
  property_type: 'residential' | 'commercial'
  urgency: 'normal' | 'emergency'
  description: string
  preferred_date?: string
  sms_consent?: boolean
}

export default function QuotePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<QuoteFormData>()

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to submit quote')

      setSubmitStatus('success')
      reset()
    } catch (error) {
      console.error('Error submitting quote:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get a Free Quote</h1>
          <p className="text-gray-600 mb-8">
            Fill out the form below and we&apos;ll get back to you with a quote within 24 hours.
            For emergency service, please call us directly at 802-555-0123.
          </p>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Quote request submitted successfully!</p>
                <p className="text-green-700 text-sm mt-1">We&apos;ll contact you within 24 hours.</p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Failed to submit quote request.</p>
                <p className="text-red-700 text-sm mt-1">Please try again or call us directly.</p>
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
                Service Type *
              </label>
              <select
                id="service_type"
                {...register('service_type', { required: 'Please select a service type' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a service</option>
                <option value="Panel Upgrade">Panel Upgrade</option>
                <option value="Outlet/Switch Installation">Outlet/Switch Installation</option>
                <option value="Lighting Installation">Lighting Installation</option>
                <option value="Home Rewiring">Home Rewiring</option>
                <option value="EV Charger Installation">EV Charger Installation</option>
                <option value="Commercial Electrical">Commercial Electrical</option>
                <option value="Emergency Repair">Emergency Repair</option>
                <option value="Other">Other</option>
              </select>
              {errors.service_type && (
                <p className="mt-1 text-sm text-red-600">{errors.service_type.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="residential"
                      {...register('property_type', { required: 'Please select property type' })}
                      className="mr-2"
                    />
                    <span>Residential</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="commercial"
                      {...register('property_type', { required: 'Please select property type' })}
                      className="mr-2"
                    />
                    <span>Commercial</span>
                  </label>
                </div>
                {errors.property_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.property_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="normal"
                      {...register('urgency', { required: 'Please select urgency' })}
                      className="mr-2"
                    />
                    <span>Normal (within 1-2 weeks)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="emergency"
                      {...register('urgency', { required: 'Please select urgency' })}
                      className="mr-2"
                    />
                    <span>Emergency (ASAP)</span>
                  </label>
                </div>
                {errors.urgency && (
                  <p className="mt-1 text-sm text-red-600">{errors.urgency.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="preferred_date" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Date (Optional)
              </label>
              <input
                type="date"
                id="preferred_date"
                {...register('preferred_date')}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Project Description *
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description', { required: 'Please describe your project' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please describe the electrical work you need done..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
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
                    I consent to receive SMS text messages from Hutchins Electric regarding my quote request,
                    appointment confirmations, and service updates. Message and data rates may apply.
                    Reply STOP to unsubscribe at any time.
                  </p>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Need immediate assistance? Call us at{' '}
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