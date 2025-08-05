# Hutchins Electric - Vermont Electrician Website

A modern, SEO-optimized website for electrical services in Northern and Central Vermont. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Documentation

**New to this project? Start here:**
- 📋 **[Quick Start Guide](docs/QUICK_START.md)** - Get up and running in 15 minutes
- 🎨 **[Customization Guide](docs/CUSTOMIZATION.md)** - Customize colors, content, and branding
- 🔧 **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Fix common issues
- ⚙️ **[Environment Setup](/.env.example.documented)** - Detailed configuration guide

## Features

- 📱 Mobile-responsive design
- 🔍 SEO optimized for Vermont local search
- 📅 Customer self-scheduling system
- 📧 Quote request forms with email notifications
- 🖼️ Photo gallery for showcasing work
- 🚨 Emergency service request handling
- 🔐 Admin dashboard for managing bookings
- 📊 Future-ready for employee management

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Hosting**: Vercel

## Getting Started

**First time here?** Follow the **[Quick Start Guide](docs/QUICK_START.md)** for step-by-step setup instructions.

### Quick Setup Summary

1. **Install dependencies:** `npm install`
2. **Set up database:** Create Supabase project and run migration
3. **Configure email:** Set up Resend account for email delivery
4. **Environment setup:** Copy `.env.example.documented` to `.env.local` and fill in your values
5. **Start development:** `npm run dev`
6. **Deploy:** Push to GitHub and deploy with Vercel

For detailed instructions, see the **[Quick Start Guide](docs/QUICK_START.md)**.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Post-Deployment

1. Update `NEXT_PUBLIC_SITE_URL` in Vercel to your production URL
2. Update phone numbers and email addresses throughout the site
3. Add your Google Analytics/Search Console verification codes
4. Submit sitemap to Google Search Console

## Customization

Want to customize the site for your business? See the **[Customization Guide](docs/CUSTOMIZATION.md)** for detailed instructions on:

- Updating business information (phone, email, address)
- Adding your logo and branding
- Changing colors and fonts
- Customizing content and services
- Adding new pages
- SEO optimization

### Quick Customization Checklist

- [ ] Update phone number (`802-555-0123` → your number)
- [ ] Update email (`service@hutchinselectric.com` → your email)
- [ ] Update business name and service areas
- [ ] Add your logo to `/public/` directory
- [ ] Update SEO metadata in `src/app/layout.tsx`
- [ ] Test all forms and email delivery

## Admin Features

### Access Admin Dashboard

Navigate to `/admin` (you'll need to implement authentication)

### Manage Bookings

- View all booking requests
- Confirm/reschedule appointments
- Add admin notes
- Mark as completed

## Future Enhancements

The codebase is prepared for:
- Employee login system
- Time tracking
- SMS notifications (Twilio integration ready)
- Advanced scheduling with calendar view
- Customer reviews/testimonials
- Payment processing

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Run linting
npm run lint
```

## Support & Documentation

### Having Issues?

1. **Check the [Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Solutions to common problems
2. **Review setup steps** in the [Quick Start Guide](docs/QUICK_START.md)
3. **Verify environment configuration** using [.env.example.documented](/.env.example.documented)

### Need Help With Customization?

- See the **[Customization Guide](docs/CUSTOMIZATION.md)** for detailed instructions
- Check browser developer tools for errors
- Test changes in development before deploying

### Technical Issues

For technical issues or questions about the codebase, please create an issue in the repository.

## License

All rights reserved. This is proprietary software for Hutchins Electric.