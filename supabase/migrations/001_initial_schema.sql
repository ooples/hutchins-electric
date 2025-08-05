-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'employee')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('residential', 'commercial', 'emergency')),
  price_range TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create quote_requests table
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL CHECK (property_type IN ('residential', 'commercial')),
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'emergency')),
  preferred_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id),
  service_id UUID REFERENCES services(id),
  requested_date DATE NOT NULL,
  requested_time_preference TEXT NOT NULL CHECK (requested_time_preference IN ('morning', 'afternoon', 'evening', 'emergency')),
  scheduled_date DATE,
  scheduled_time TIME,
  assigned_to UUID REFERENCES users(id),
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create gallery_photos table
CREATE TABLE gallery_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name TEXT NOT NULL,
  before_photo_url TEXT,
  after_photo_url TEXT,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('residential', 'commercial')),
  featured BOOLEAN DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_created_at ON quote_requests(created_at DESC);
CREATE INDEX idx_bookings_requested_date ON bookings(requested_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_gallery_photos_featured ON gallery_photos(featured);
CREATE INDEX idx_gallery_photos_display_order ON gallery_photos(display_order);

-- Insert sample services
INSERT INTO services (name, category, price_range, description) VALUES
  ('Panel Upgrade', 'residential', '$800-$2500', 'Upgrade electrical panel to modern standards'),
  ('Outlet Installation', 'residential', '$150-$300', 'Install new electrical outlets'),
  ('Lighting Installation', 'residential', '$200-$500', 'Install new lighting fixtures'),
  ('Home Rewiring', 'residential', '$3000-$8000', 'Complete home electrical rewiring'),
  ('EV Charger Installation', 'residential', '$500-$1500', 'Install electric vehicle charging station'),
  ('Commercial Lighting', 'commercial', '$500-$5000', 'Commercial lighting installation and repair'),
  ('Code Compliance Update', 'commercial', '$1000-$5000', 'Update electrical systems to meet current codes'),
  ('Emergency Repair', 'emergency', 'Varies', '24/7 emergency electrical repairs');

-- Create a default admin user (you should change this password immediately)
INSERT INTO users (email, role) VALUES 
  ('admin@hutchinselectric.com', 'admin');