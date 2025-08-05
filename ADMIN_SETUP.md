# Hutchins Electric Admin Dashboard

This document provides complete setup and usage instructions for the Hutchins Electric admin dashboard.

## Admin Dashboard Features

The admin dashboard provides complete business management functionality:

### Authentication
- **Login Page**: `/admin/login`
- **Default Credentials**: 
  - Email: `admin@hutchinselectric.com`
  - Password: `admin123`
- **Security**: localStorage-based authentication with route protection

### Dashboard Overview (`/admin`)
- **Business Statistics**: 
  - Total quotes and pending quote count
  - Total bookings and upcoming confirmed bookings
  - Completed jobs this month
  - Emergency requests requiring immediate attention
- **Recent Activity**: Latest quote requests and bookings with status indicators
- **Quick Navigation**: Direct links to quotes and bookings management

### Quote Management (`/admin/quotes`)
- **View All Quotes**: Complete list with filtering by status
- **Status Management**: Update quote status (pending → contacted → scheduled → completed)
- **Filter Options**: All, Pending, Contacted, Scheduled, Completed
- **Detailed Information**: 
  - Customer contact details (clickable email/phone links)
  - Service type and property information
  - Urgency indicators (emergency highlighted)
  - Full description and preferred dates
- **Emergency Handling**: Emergency requests clearly marked in red

### Booking Management (`/admin/bookings`)
- **View All Bookings**: Complete scheduling interface
- **Status Updates**: Change booking status (requested → confirmed → completed → cancelled)
- **Schedule Management**: 
  - Set scheduled date and time
  - Assign technicians
  - Add admin notes
- **Filter Options**: All, Requested, Confirmed, Completed, Cancelled
- **Detailed View**: 
  - Customer preferences and time slots
  - Internal admin notes separate from customer notes
  - Booking history and timeline

### Mobile Responsive Design
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Mobile Navigation**: Collapsible sidebar for small screens
- **Touch Optimized**: All interactions work on touch devices

## Technical Implementation

### File Structure
```
src/app/admin/
├── layout.tsx           # Admin layout with navigation and auth
├── page.tsx            # Dashboard overview with statistics
├── login/
│   └── page.tsx        # Login form with localStorage auth
├── quotes/
│   └── page.tsx        # Quote management interface
└── bookings/
    └── page.tsx        # Booking management interface
```

### Key Technologies
- **Framework**: Next.js 15 with App Router
- **Database**: Supabase with PostgreSQL
- **Styling**: Tailwind CSS for responsive design
- **Authentication**: localStorage-based admin authentication
- **Email**: Resend integration for notifications

### Database Schema
The admin dashboard integrates with these main tables:
- `quote_requests`: Customer quote submissions
- `bookings`: Appointment scheduling
- `users`: Customer and admin accounts
- `services`: Available electrical services

## Setup Instructions

### 1. Environment Configuration
Copy `.env.example` to `.env.local` and configure:

```env
# Supabase Configuration (Required for full functionality)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Email Configuration (Optional - for notifications)
RESEND_API_KEY=your_resend_api_key
BUSINESS_EMAIL=your-business@email.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Database Setup
1. Create a Supabase project
2. Run the migration file: `supabase/migrations/001_initial_schema.sql`
3. The migration creates all necessary tables and sample data

### 3. Admin Account
The default admin account is created by the migration:
- **Email**: `admin@hutchinselectric.com`
- **Password**: `admin123`

**Important**: Change the default password in production!

### 4. Running the Application
```bash
npm install
npm run dev
```

Access the admin dashboard at: `http://localhost:3000/admin`

## Usage Guide

### Getting Started
1. Navigate to `/admin/login`
2. Use the default credentials to log in
3. You'll be redirected to the dashboard overview

### Managing Quotes
1. Go to "Quote Requests" from the sidebar
2. Use status filters to find specific quotes
3. Click the expand arrow to see full details
4. Update status using the dropdown menu
5. Contact customers using the clickable email/phone links

### Managing Bookings
1. Go to "Bookings" from the navigation
2. Filter by status to see different booking types
3. Expand bookings to see details and edit options
4. Click "Edit Details" to:
   - Set scheduled date and time
   - Assign technicians
   - Add internal admin notes
5. Update booking status as work progresses

### Dashboard Monitoring
- Check the dashboard regularly for new requests
- Emergency items are highlighted in red
- Use the statistics to track business performance
- Recent activity shows the latest customer interactions

## Customization Options

### Changing Admin Credentials
Update the authentication logic in `/admin/login/page.tsx`:
```javascript
if (email === 'your-email@domain.com' && password === 'your-password') {
  // Login logic
}
```

### Adding New Status Types
1. Update the database schema constraints
2. Modify the TypeScript types in `/types/database.ts`
3. Update the status options in the management pages

### Styling Customization
- All styles use Tailwind CSS classes
- Modify colors, spacing, and layout in the component files
- The design system uses consistent blue/gray color scheme

## Security Considerations

### Production Deployment
1. **Change Default Password**: Update admin credentials immediately
2. **Environment Variables**: Secure all API keys and database credentials
3. **HTTPS**: Always use HTTPS in production
4. **Database Security**: Configure Supabase Row Level Security (RLS)

### Access Control
- The admin routes are protected by authentication middleware
- Unauthorized users are redirected to the login page
- Session data is stored in localStorage (consider upgrading to httpOnly cookies for production)

## Support and Maintenance

### Regular Tasks
- Monitor emergency requests daily
- Update quote and booking statuses promptly
- Review completed work monthly for business insights
- Back up customer data regularly

### Troubleshooting
- Check browser console for JavaScript errors
- Verify Supabase connection in Network tab
- Ensure environment variables are properly configured
- Test email functionality with a sample quote/booking

### Feature Requests
The admin dashboard is designed to be extensible. Common additions include:
- Customer communication history
- Invoice generation
- Technician scheduling calendar
- Photo gallery management
- Business analytics and reporting

For technical support or feature requests, refer to the project documentation or contact the development team.