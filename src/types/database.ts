export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'customer' | 'admin' | 'employee'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'customer' | 'admin' | 'employee'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'customer' | 'admin' | 'employee'
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          category: 'residential' | 'commercial' | 'emergency'
          price_range: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: 'residential' | 'commercial' | 'emergency'
          price_range?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'residential' | 'commercial' | 'emergency'
          price_range?: string | null
          description?: string | null
          created_at?: string
        }
      }
      quote_requests: {
        Row: {
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
          sms_consent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          email: string
          phone: string
          service_type: string
          description?: string | null
          property_type: 'residential' | 'commercial'
          urgency?: 'normal' | 'emergency'
          preferred_date?: string | null
          status?: 'pending' | 'contacted' | 'scheduled' | 'completed'
          sms_consent?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          email?: string
          phone?: string
          service_type?: string
          description?: string | null
          property_type?: 'residential' | 'commercial'
          urgency?: 'normal' | 'emergency'
          preferred_date?: string | null
          status?: 'pending' | 'contacted' | 'scheduled' | 'completed'
          sms_consent?: boolean
          created_at?: string
        }
      }
      bookings: {
        Row: {
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
          sms_consent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          service_id?: string | null
          requested_date: string
          requested_time_preference: 'morning' | 'afternoon' | 'evening' | 'emergency'
          scheduled_date?: string | null
          scheduled_time?: string | null
          assigned_to?: string | null
          status?: 'requested' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          admin_notes?: string | null
          sms_consent?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          service_id?: string | null
          requested_date?: string
          requested_time_preference?: 'morning' | 'afternoon' | 'evening' | 'emergency'
          scheduled_date?: string | null
          scheduled_time?: string | null
          assigned_to?: string | null
          status?: 'requested' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          admin_notes?: string | null
          sms_consent?: boolean
          created_at?: string
        }
      }
      gallery_photos: {
        Row: {
          id: string
          project_name: string
          before_photo_url: string | null
          after_photo_url: string | null
          description: string | null
          category: 'residential' | 'commercial'
          featured: boolean
          display_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_name: string
          before_photo_url?: string | null
          after_photo_url?: string | null
          description?: string | null
          category: 'residential' | 'commercial'
          featured?: boolean
          display_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_name?: string
          before_photo_url?: string | null
          after_photo_url?: string | null
          description?: string | null
          category?: 'residential' | 'commercial'
          featured?: boolean
          display_order?: number | null
          created_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          user_id: string | null
          employee_number: string
          first_name: string
          last_name: string
          phone: string | null
          hire_date: string
          hourly_rate: number | null
          job_title: string | null
          department: string | null
          is_active: boolean
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          employee_number: string
          first_name: string
          last_name: string
          phone?: string | null
          hire_date: string
          hourly_rate?: number | null
          job_title?: string | null
          department?: string | null
          is_active?: boolean
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          employee_number?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          hire_date?: string
          hourly_rate?: number | null
          job_title?: string | null
          department?: string | null
          is_active?: boolean
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          employee_id: string | null
          clock_in: string
          clock_out: string | null
          break_duration_minutes: number | null
          total_hours: number | null
          location_lat: number | null
          location_lng: number | null
          location_accuracy: number | null
          notes: string | null
          booking_id: string | null
          status: 'active' | 'completed' | 'adjusted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id?: string | null
          clock_in: string
          clock_out?: string | null
          break_duration_minutes?: number | null
          total_hours?: number | null
          location_lat?: number | null
          location_lng?: number | null
          location_accuracy?: number | null
          notes?: string | null
          booking_id?: string | null
          status?: 'active' | 'completed' | 'adjusted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string | null
          clock_in?: string
          clock_out?: string | null
          break_duration_minutes?: number | null
          total_hours?: number | null
          location_lat?: number | null
          location_lng?: number | null
          location_accuracy?: number | null
          notes?: string | null
          booking_id?: string | null
          status?: 'active' | 'completed' | 'adjusted'
          created_at?: string
          updated_at?: string
        }
      }
      employee_schedules: {
        Row: {
          id: string
          employee_id: string | null
          booking_id: string | null
          scheduled_date: string
          start_time: string
          end_time: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id?: string | null
          booking_id?: string | null
          scheduled_date: string
          start_time: string
          end_time: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string | null
          booking_id?: string | null
          scheduled_date?: string
          start_time?: string
          end_time?: string
          notes?: string | null
          created_at?: string
        }
      }
      sms_logs: {
        Row: {
          id: string
          to_phone: string
          from_phone: string
          message: string
          notification_type: 'appointment_confirmation' | 'appointment_reminder' | 'quote_followup' | 'emergency_response' | 'status_update'
          status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered'
          twilio_sid: string | null
          cost: number | null
          error_message: string | null
          sent_at: string | null
          delivered_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          to_phone: string
          from_phone: string
          message: string
          notification_type: 'appointment_confirmation' | 'appointment_reminder' | 'quote_followup' | 'emergency_response' | 'status_update'
          status?: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered'
          twilio_sid?: string | null
          cost?: number | null
          error_message?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          to_phone?: string
          from_phone?: string
          message?: string
          notification_type?: 'appointment_confirmation' | 'appointment_reminder' | 'quote_followup' | 'emergency_response' | 'status_update'
          status?: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered'
          twilio_sid?: string | null
          cost?: number | null
          error_message?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          created_at?: string
        }
      }
      sms_opt_outs: {
        Row: {
          id: string
          phone: string
          opted_out_at: string
          created_at: string
        }
        Insert: {
          id?: string
          phone: string
          opted_out_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          phone?: string
          opted_out_at?: string
          created_at?: string
        }
      }
      sms_templates: {
        Row: {
          id: string
          name: string
          notification_type: 'appointment_confirmation' | 'appointment_reminder' | 'quote_followup' | 'emergency_response' | 'status_update'
          content: string
          variables: Record<string, string> | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          notification_type: 'appointment_confirmation' | 'appointment_reminder' | 'quote_followup' | 'emergency_response' | 'status_update'
          content: string
          variables?: Record<string, string> | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          notification_type?: 'appointment_confirmation' | 'appointment_reminder' | 'quote_followup' | 'emergency_response' | 'status_update'
          content?: string
          variables?: Record<string, string> | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sms_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}