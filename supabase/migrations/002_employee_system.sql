-- Migration for Employee Management System
-- Add employee profiles and time tracking tables

-- Create employees table (extends users with role='employee')
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  employee_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  hire_date DATE NOT NULL,
  hourly_rate DECIMAL(10,2),
  job_title TEXT,
  department TEXT DEFAULT 'electrical',
  is_active BOOLEAN DEFAULT true,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create time_entries table for clock in/out tracking
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  break_duration_minutes INTEGER DEFAULT 0,
  total_hours DECIMAL(5,2),
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  location_accuracy DECIMAL(10,2),
  notes TEXT,
  booking_id UUID REFERENCES bookings(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'adjusted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create employee_schedules table for scheduling
CREATE TABLE employee_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_employee_number ON employees(employee_number);
CREATE INDEX idx_employees_is_active ON employees(is_active);
CREATE INDEX idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX idx_time_entries_clock_in ON time_entries(clock_in);
CREATE INDEX idx_time_entries_status ON time_entries(status);
CREATE INDEX idx_employee_schedules_employee_id ON employee_schedules(employee_id);
CREATE INDEX idx_employee_schedules_scheduled_date ON employee_schedules(scheduled_date);
CREATE INDEX idx_employee_schedules_booking_id ON employee_schedules(booking_id);

-- Create function to automatically calculate total hours when clock_out is updated
CREATE OR REPLACE FUNCTION calculate_total_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clock_out IS NOT NULL AND NEW.clock_in IS NOT NULL THEN
    NEW.total_hours = EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600.0 - (COALESCE(NEW.break_duration_minutes, 0) / 60.0);
    NEW.updated_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate hours
CREATE TRIGGER trigger_calculate_total_hours
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_total_hours();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample employees for testing
INSERT INTO users (email, role) VALUES 
  ('john.smith@hutchinselectric.com', 'employee'),
  ('sarah.johnson@hutchinselectric.com', 'employee'),
  ('mike.davis@hutchinselectric.com', 'employee');

-- Get the user IDs for the sample employees
WITH employee_users AS (
  SELECT id, email FROM users WHERE role = 'employee'
)
INSERT INTO employees (
  user_id, 
  employee_number, 
  first_name, 
  last_name, 
  phone, 
  hire_date, 
  hourly_rate, 
  job_title,
  emergency_contact_name,
  emergency_contact_phone
) 
SELECT 
  u.id,
  CASE 
    WHEN u.email = 'john.smith@hutchinselectric.com' THEN 'EMP001'
    WHEN u.email = 'sarah.johnson@hutchinselectric.com' THEN 'EMP002'
    WHEN u.email = 'mike.davis@hutchinselectric.com' THEN 'EMP003'
  END,
  CASE 
    WHEN u.email = 'john.smith@hutchinselectric.com' THEN 'John'
    WHEN u.email = 'sarah.johnson@hutchinselectric.com' THEN 'Sarah'
    WHEN u.email = 'mike.davis@hutchinselectric.com' THEN 'Mike'
  END,
  CASE 
    WHEN u.email = 'john.smith@hutchinselectric.com' THEN 'Smith'
    WHEN u.email = 'sarah.johnson@hutchinselectric.com' THEN 'Johnson'
    WHEN u.email = 'mike.davis@hutchinselectric.com' THEN 'Davis'
  END,
  CASE 
    WHEN u.email = 'john.smith@hutchinselectric.com' THEN '(555) 123-4567'
    WHEN u.email = 'sarah.johnson@hutchinselectric.com' THEN '(555) 234-5678'
    WHEN u.email = 'mike.davis@hutchinselectric.com' THEN '(555) 345-6789'
  END,
  CURRENT_DATE - INTERVAL '1 year',
  CASE 
    WHEN u.email = 'john.smith@hutchinselectric.com' THEN 28.50
    WHEN u.email = 'sarah.johnson@hutchinselectric.com' THEN 26.00
    WHEN u.email = 'mike.davis@hutchinselectric.com' THEN 24.75
  END,
  CASE 
    WHEN u.email = 'john.smith@hutchinselectric.com' THEN 'Senior Electrician'
    WHEN u.email = 'sarah.johnson@hutchinselectric.com' THEN 'Electrician'
    WHEN u.email = 'mike.davis@hutchinselectric.com' THEN 'Apprentice Electrician'
  END,
  CASE 
    WHEN u.email = 'john.smith@hutchinselectric.com' THEN 'Jane Smith'
    WHEN u.email = 'sarah.johnson@hutchinselectric.com' THEN 'Robert Johnson'
    WHEN u.email = 'mike.davis@hutchinselectric.com' THEN 'Lisa Davis'
  END,
  CASE 
    WHEN u.email = 'john.smith@hutchinselectric.com' THEN '(555) 987-6543'
    WHEN u.email = 'sarah.johnson@hutchinselectric.com' THEN '(555) 876-5432'
    WHEN u.email = 'mike.davis@hutchinselectric.com' THEN '(555) 765-4321'
  END
FROM employee_users u;