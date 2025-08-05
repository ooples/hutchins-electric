-- Add SMS preferences to existing tables
ALTER TABLE quote_requests ADD COLUMN sms_consent BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN sms_consent BOOLEAN DEFAULT false;

-- Create SMS logs table for tracking all sent messages
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_phone TEXT NOT NULL,
  from_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'appointment_confirmation',
    'appointment_reminder', 
    'quote_followup',
    'emergency_response',
    'status_update'
  )),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'sent', 'delivered', 'failed', 'undelivered'
  )),
  twilio_sid TEXT,
  cost DECIMAL(10,4),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create SMS opt-outs table for managing unsubscribed numbers
CREATE TABLE sms_opt_outs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  opted_out_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create SMS templates table for managing message templates
CREATE TABLE sms_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  notification_type TEXT UNIQUE NOT NULL CHECK (notification_type IN (
    'appointment_confirmation',
    'appointment_reminder',
    'quote_followup', 
    'emergency_response',
    'status_update'
  )),
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create SMS settings table for global SMS configuration
CREATE TABLE sms_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_sms_logs_to_phone ON sms_logs(to_phone);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_sms_logs_notification_type ON sms_logs(notification_type);
CREATE INDEX idx_sms_logs_created_at ON sms_logs(created_at DESC);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at DESC);
CREATE INDEX idx_sms_opt_outs_phone ON sms_opt_outs(phone);
CREATE INDEX idx_sms_templates_notification_type ON sms_templates(notification_type);
CREATE INDEX idx_sms_templates_active ON sms_templates(active);

-- Insert default SMS templates
INSERT INTO sms_templates (name, notification_type, content, variables) VALUES
  (
    'Appointment Confirmation',
    'appointment_confirmation',
    'Hi {{customerName}}, your electrical service appointment with Hutchins Electric is confirmed for {{date}} at {{time}}. We''ll see you then! Reply STOP to opt out.',
    '["customerName", "date", "time"]'
  ),
  (
    'Appointment Reminder', 
    'appointment_reminder',
    'Reminder: You have an electrical service appointment with Hutchins Electric tomorrow ({{date}}) at {{time}}. We look forward to serving you! Reply STOP to opt out.',
    '["date", "time"]'
  ),
  (
    'Quote Follow-up',
    'quote_followup', 
    'Hi {{customerName}}, we''ve prepared your electrical service quote. Check your email for details or call us at 802-555-0123. Thank you for choosing Hutchins Electric! Reply STOP to opt out.',
    '["customerName"]'
  ),
  (
    'Emergency Response',
    'emergency_response',
    'Hi {{customerName}}, we''ve received your emergency electrical service request. A technician will contact you within 15 minutes. For immediate assistance, call 802-555-0123.',
    '["customerName"]'
  ),
  (
    'Status Update',
    'status_update',
    'Hi {{customerName}}, update on your electrical service: {{message}}. Questions? Call us at 802-555-0123. Reply STOP to opt out.',
    '["customerName", "message"]'
  );

-- Insert default SMS settings
INSERT INTO sms_settings (setting_key, setting_value, description) VALUES
  ('sms_enabled', 'true', 'Enable or disable SMS notifications globally'),
  ('rate_limit_per_hour', '5', 'Maximum SMS messages per phone number per hour'),
  ('test_mode', 'false', 'Enable test mode for SMS (logs messages without sending)'),
  ('business_hours_start', '08:00', 'Start of business hours for SMS sending'),
  ('business_hours_end', '18:00', 'End of business hours for SMS sending'),
  ('reminder_hours_before', '24', 'Hours before appointment to send reminder');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_sms_templates_updated_at 
  BEFORE UPDATE ON sms_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_settings_updated_at 
  BEFORE UPDATE ON sms_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();