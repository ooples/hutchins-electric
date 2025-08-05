'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, Settings, BarChart3, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

interface SMSStats {
  total: number
  sent: number
  delivered: number
  failed: number
  totalCost: number
  byType: Record<string, number>
}

interface SMSLog {
  id: string
  to_phone: string
  message: string
  notification_type: string
  status: string
  cost: number | null
  sent_at: string | null
  delivered_at: string | null
  error_message: string | null
  created_at: string
}

interface SMSServiceStatus {
  configured: boolean
  enabled: boolean
  testMode: boolean
  service: string
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'settings' | 'test'>('overview')
  const [stats, setStats] = useState<SMSStats | null>(null)
  const [logs, setLogs] = useState<SMSLog[]>([])
  const [serviceStatus, setServiceStatus] = useState<SMSServiceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Test SMS form state
  const [testPhone, setTestPhone] = useState('')
  const [testType, setTestType] = useState('status_update')
  const [testMessage, setTestMessage] = useState('This is a test message from Hutchins Electric.')
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load service status
      const statusResponse = await fetch('/api/sms/send')
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setServiceStatus(statusData)
      }

      // Load stats and logs (mock data since we don't have the full backend)
      // In a real implementation, you'd fetch from your API
      setStats({
        total: 42,
        sent: 38,
        delivered: 35,
        failed: 4,
        totalCost: 2.10,
        byType: {
          appointment_confirmation: 15,
          appointment_reminder: 12,
          quote_followup: 8,
          emergency_response: 3,
          status_update: 4
        }
      })

      setLogs([
        {
          id: '1',
          to_phone: '+1234567890',
          message: 'Hi John, your electrical service appointment...',
          notification_type: 'appointment_confirmation',
          status: 'delivered',
          cost: 0.05,
          sent_at: '2024-01-15T10:30:00Z',
          delivered_at: '2024-01-15T10:30:15Z',
          error_message: null,
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          to_phone: '+1987654321',
          message: 'Reminder: You have an electrical service...',
          notification_type: 'appointment_reminder',
          status: 'failed',
          cost: null,
          sent_at: '2024-01-15T09:00:00Z',
          delivered_at: null,
          error_message: 'Invalid phone number',
          created_at: '2024-01-15T09:00:00Z'
        }
      ])

    } catch (err) {
      setError('Failed to load notification data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const sendTestSMS = async () => {
    if (!testPhone.trim()) {
      setTestResult({ success: false, message: 'Please enter a phone number' })
      return
    }

    setTestLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
        },
        body: JSON.stringify({
          phone: testPhone,
          type: testType,
          variables: {
            customerName: 'Test Customer',
            message: testMessage,
            date: 'Tomorrow',
            time: '2:00 PM'
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        setTestResult({ success: true, message: 'Test SMS sent successfully!' })
        setTestPhone('')
        // Reload logs to show the new message
        setTimeout(loadData, 1000)
      } else {
        setTestResult({ success: false, message: data.error || 'Failed to send test SMS' })
      }

    } catch (err) {
      setTestResult({ success: false, message: 'Network error occurred' })
      console.error('Test SMS error:', err)
    } finally {
      setTestLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'sent':
        return <Send className="h-4 w-4 text-blue-600" />
      case 'failed':
      case 'undelivered':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/(\+1)?(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="mr-3 h-8 w-8 text-blue-600" />
            SMS Notifications
          </h1>
          <p className="text-gray-600 mt-2">
            Manage SMS notifications and view delivery statistics
          </p>
        </div>
        
        {serviceStatus && (
          <div className={`px-4 py-2 rounded-lg flex items-center ${
            serviceStatus.configured 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {serviceStatus.configured ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            {serviceStatus.configured ? 'SMS Configured' : 'SMS Not Configured'}
            {serviceStatus.testMode && (
              <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                TEST MODE
              </span>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!serviceStatus?.configured && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-yellow-800 font-medium">SMS Service Not Configured</p>
              <p className="text-yellow-700 text-sm mt-1">
                To enable SMS notifications, please configure your Twilio credentials in the environment variables.
                See the SMS setup documentation for details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'logs', name: 'Message Logs', icon: MessageSquare },
            { id: 'settings', name: 'Settings', icon: Settings },
            { id: 'test', name: 'Test SMS', icon: Send }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Send className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCost)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message Types */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Messages by Type</h3>
            <div className="space-y-3">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent SMS Messages</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPhoneNumber(log.to_phone)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {log.notification_type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(log.status)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.cost ? formatCurrency(log.cost) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Status</label>
                <p className="mt-1 text-sm text-gray-600">
                  {serviceStatus?.configured ? 'SMS service is configured and ready' : 'SMS service needs configuration'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Environment Variables Required</label>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>• TWILIO_ACCOUNT_SID</li>
                  <li>• TWILIO_AUTH_TOKEN</li>
                  <li>• TWILIO_PHONE_NUMBER</li>
                </ul>
              </div>

              {serviceStatus?.testMode && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Test Mode:</strong> SMS messages will be logged but not actually sent.
                    Set SMS_TEST_MODE=false in production.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Message Templates</h3>
            <p className="text-sm text-gray-600 mb-4">
              SMS templates are managed in the database. Default templates are created during setup.
            </p>
            <div className="space-y-2">
              {[
                'Appointment Confirmation',
                'Appointment Reminder',
                'Quote Follow-up',
                'Emergency Response',
                'Status Update'
              ].map((template) => (
                <div key={template} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{template}</span>
                  <span className="text-xs text-green-600">Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Test SMS Tab */}
      {activeTab === 'test' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Send Test SMS</h3>
          
          {!serviceStatus?.configured && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                SMS service is not configured. Please configure Twilio credentials first.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="testPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="testPhone"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="testType" className="block text-sm font-medium text-gray-700 mb-1">
                Message Type
              </label>
              <select
                id="testType"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="appointment_confirmation">Appointment Confirmation</option>
                <option value="appointment_reminder">Appointment Reminder</option>
                <option value="quote_followup">Quote Follow-up</option>
                <option value="emergency_response">Emergency Response</option>
                <option value="status_update">Status Update</option>
              </select>
            </div>

            {testType === 'status_update' && (
              <div>
                <label htmlFor="testMessage" className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Message
                </label>
                <textarea
                  id="testMessage"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <button
              onClick={sendTestSMS}
              disabled={testLoading || !serviceStatus?.configured}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testLoading ? 'Sending...' : 'Send Test SMS'}
            </button>

            {testResult && (
              <div className={`p-4 rounded-lg flex items-start ${
                testResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                )}
                <p className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                  {testResult.message}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}