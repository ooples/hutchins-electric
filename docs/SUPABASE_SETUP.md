# Supabase Setup Guide for Hutchins Electric

This comprehensive guide will walk you through setting up Supabase for the Hutchins Electric website, from creating an account to deploying the database schema and configuring security policies.

## Table of Contents
1. [Creating a Supabase Account](#1-creating-a-supabase-account)
2. [Creating a New Project](#2-creating-a-new-project)
3. [Finding and Copying API Keys](#3-finding-and-copying-api-keys)
4. [Running the SQL Migration](#4-running-the-sql-migration)
5. [Setting up Row Level Security (RLS)](#5-setting-up-row-level-security-rls)
6. [Testing Database Tables](#6-testing-database-tables)
7. [Managing Data in Supabase Dashboard](#7-managing-data-in-supabase-dashboard)
8. [Backup and Restore Procedures](#8-backup-and-restore-procedures)
9. [Monitoring Usage (Free Tier)](#9-monitoring-usage-free-tier)
10. [Troubleshooting Common Issues](#10-troubleshooting-common-issues)

---

## 1. Creating a Supabase Account

1. **Visit Supabase**: Go to [https://supabase.com](https://supabase.com)
2. **Sign Up**: Click "Start your project" or "Sign Up"
3. **Choose Authentication Method**:
   - Sign up with GitHub (recommended for developers)
   - Or use email/password
4. **Verify Email**: Check your email and verify your account if using email signup
5. **Complete Profile**: Fill in your profile information

**Note**: The free tier includes:
- Up to 2 active projects
- 500MB database space
- 2GB bandwidth
- 50MB file storage
- 100,000 monthly active users

---

## 2. Creating a New Project

1. **Access Dashboard**: After logging in, you'll see the Supabase dashboard
2. **Create New Project**: Click "New Project"
3. **Choose Organization**: Select your organization (usually your username)
4. **Project Settings**:
   - **Name**: `hutchins-electric`
   - **Database Password**: Create a strong password (save this securely!)
   - **Region**: Choose the region closest to your users (e.g., `us-east-1` for East Coast US)
   - **Pricing Plan**: Select "Free" to start
5. **Create Project**: Click "Create new project"
6. **Wait for Setup**: The project creation takes 1-2 minutes

**Important**: Save your database password immediately - you cannot retrieve it later!

---

## 3. Finding and Copying API Keys

Once your project is created:

### 3.1 Project URL and API Keys
1. **Navigate to Settings**: In your project dashboard, click "Settings" in the sidebar
2. **Go to API Section**: Click "API" under Settings
3. **Copy These Values**:

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Anon Key (Public Key - safe for client-side use)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (Secret Key - NEVER expose to client-side)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2 Update Environment Variables
Create or update your `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Security Note**: 
- The `NEXT_PUBLIC_` prefixed keys are safe for client-side use
- The service role key should ONLY be used server-side and never exposed to clients

---

## 4. Running the SQL Migration

### 4.1 Access SQL Editor
1. **Go to SQL Editor**: In your Supabase dashboard, click "SQL Editor" in the sidebar
2. **Create New Query**: Click "New Query"

### 4.2 Run the Initial Schema Migration
Copy and paste the entire contents of the migration file into the SQL editor:

```sql
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
```

### 4.3 Execute the Migration
1. **Run Query**: Click "Run" button or press `Ctrl+Enter`
2. **Verify Success**: Check that all queries executed successfully
3. **Check Tables**: Go to "Table Editor" to see your new tables

---

## 5. Setting up Row Level Security (RLS)

Row Level Security ensures users can only access data they're authorized to see.

### 5.1 Enable RLS on All Tables
Run these commands in the SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
```

### 5.2 Create RLS Policies

```sql
-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Services table policies (public read, admin write)
CREATE POLICY "Anyone can view services" ON services
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Quote requests policies
CREATE POLICY "Anyone can create quote requests" ON quote_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all quote requests" ON quote_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Admins can update quote requests" ON quote_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'employee')
    )
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (customer_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all bookings" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('admin', 'employee')
    )
  );

CREATE POLICY "Users can create their own bookings" ON bookings
  FOR INSERT WITH CHECK (customer_id::text = auth.uid()::text);

-- Gallery photos policies (public read, admin write)
CREATE POLICY "Anyone can view gallery photos" ON gallery_photos
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify gallery photos" ON gallery_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );
```

---

## 6. Testing Database Tables

### 6.1 Verify Tables Were Created
1. **Go to Table Editor**: Click "Table Editor" in the sidebar
2. **Check All Tables**: You should see:
   - `users`
   - `services`
   - `quote_requests`
   - `bookings`
   - `gallery_photos`

### 6.2 Test Sample Data
1. **Check Services Table**: Should contain 8 sample services
2. **Check Users Table**: Should contain the admin user
3. **Verify Relationships**: Check that foreign key relationships work

### 6.3 Test a Sample Query
In SQL Editor, run:

```sql
-- Test query to verify everything works
SELECT 
  s.name AS service_name,
  s.category,
  s.price_range
FROM services s
WHERE s.category = 'residential'
ORDER BY s.name;
```

---

## 7. Managing Data in Supabase Dashboard

### 7.1 Table Editor
- **View Data**: Browse and search table data
- **Add Records**: Click "Insert" to add new rows
- **Edit Records**: Click on any cell to edit
- **Delete Records**: Select rows and click "Delete"

### 7.2 SQL Editor
- **Custom Queries**: Write and execute custom SQL
- **Save Queries**: Save frequently used queries
- **Query History**: Access previously run queries

### 7.3 Authentication
- **User Management**: View and manage authenticated users
- **Auth Providers**: Configure login methods (email, OAuth, etc.)
- **Auth Settings**: Configure password policies, email templates

### 7.4 Storage (if needed later)
- **Buckets**: Create storage buckets for files
- **File Management**: Upload, view, and manage files
- **Access Policies**: Control who can access files

---

## 8. Backup and Restore Procedures

### 8.1 Manual Backup
1. **SQL Dump**: Go to Settings > Database
2. **Download Backup**: Click "Download backup"
3. **Save File**: Save the `.sql` file securely

### 8.2 Automated Backups (Pro Feature)
- Available on paid plans
- Daily automated backups
- Point-in-time recovery

### 8.3 Export Data
For individual tables:
```sql
-- Export services data
COPY services TO STDOUT WITH CSV HEADER;
```

### 8.4 Restore from Backup
1. **Create New Project**: If restoring to new project
2. **Run SQL File**: Execute the backup SQL file
3. **Verify Data**: Check that all data was restored correctly

---

## 9. Monitoring Usage (Free Tier)

### 9.1 Check Usage Dashboard
1. **Go to Settings**: Click "Settings" > "Usage"
2. **Monitor Metrics**:
   - **Database Size**: Max 500MB
   - **Bandwidth**: Max 2GB/month
   - **Storage**: Max 50MB
   - **Monthly Active Users**: Max 100,000

### 9.2 Free Tier Limits
- **2 Active Projects**: Delete unused projects
- **Database Size**: 500MB total
- **Bandwidth**: 2GB outbound per month
- **File Storage**: 50MB total
- **Realtime**: 2 concurrent connections
- **Auth**: 100,000 MAU

### 9.3 Optimization Tips
- **Clean Old Data**: Regularly remove old quote requests
- **Optimize Images**: Compress images before storing
- **Use CDN**: Consider external CDN for large files
- **Monitor Queries**: Use efficient queries to reduce bandwidth

---

## 10. Troubleshooting Common Issues

### 10.1 Connection Issues

**Problem**: Cannot connect to Supabase
**Solutions**:
- Verify API keys are correct
- Check environment variables are loaded
- Ensure project URL is correct
- Check if project is paused (free tier limitation)

### 10.2 Authentication Errors

**Problem**: Auth errors or RLS blocking queries
**Solutions**:
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Temporarily disable RLS for testing (NOT for production)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### 10.3 Migration Errors

**Problem**: SQL migration fails
**Solutions**:
- Run commands one section at a time
- Check for syntax errors
- Verify extensions are enabled
- Check if tables already exist

### 10.4 Performance Issues

**Problem**: Slow queries
**Solutions**:
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM table_name WHERE condition;

-- Add missing indexes
CREATE INDEX idx_table_column ON table_name(column_name);
```

### 10.5 Free Tier Exceeded

**Problem**: Project paused due to usage limits
**Solutions**:
- Clean up old data
- Optimize queries to reduce bandwidth
- Consider upgrading to Pro plan
- Delete unused projects

### 10.6 Common Error Messages

**"relation does not exist"**
- Table wasn't created properly
- Run the migration again

**"insufficient privileges"**
- Check RLS policies
- Verify user permissions

**"violates foreign key constraint"**
- Referenced record doesn't exist
- Check foreign key relationships

---

## Next Steps

After completing this setup:

1. **Test Your Application**: Ensure your Next.js app connects properly
2. **Configure Authentication**: Set up user registration and login
3. **Add More Data**: Populate with real services and content
4. **Set Up Monitoring**: Track usage and performance
5. **Plan for Growth**: Consider when to upgrade from free tier

## Important Security Notes

- **Never commit API keys** to version control
- **Use environment variables** for all sensitive data
- **Regularly rotate** service role keys
- **Monitor access logs** for suspicious activity
- **Keep RLS policies** strict and well-tested

## Support Resources

- **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
- **Community Discord**: [https://discord.supabase.com](https://discord.supabase.com)
- **GitHub Issues**: [https://github.com/supabase/supabase](https://github.com/supabase/supabase)
- **Status Page**: [https://status.supabase.com](https://status.supabase.com)

---

*This guide was created for the Hutchins Electric website project. Keep this document updated as your database schema evolves.*