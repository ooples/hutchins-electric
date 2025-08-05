# Quick Start Guide

This guide will get your Hutchins Electric website up and running as quickly as possible. Follow these steps in order for the best experience.

## Overview

The Hutchins Electric website is a complete electrical contractor website with:
- Professional homepage with service information
- Customer booking system
- Quote request forms
- Photo gallery
- Admin dashboard for managing bookings
- Mobile-responsive design optimized for Vermont local search

## Prerequisites

Before you begin, make sure you have:
- [ ] Computer with internet connection
- [ ] Node.js 18+ installed ([Download here](https://nodejs.org/))
- [ ] A code editor like VS Code ([Download here](https://code.visualstudio.com/))
- [ ] Basic familiarity with terminal/command prompt

## Step-by-Step Setup

### Step 1: Get the Code Running Locally

1. **Open your terminal/command prompt**
2. **Navigate to your project folder**
   ```bash
   cd C:\Users\yolan\source\repos\HutchinsElectric\hutchins-electric
   ```
3. **Install the required packages**
   ```bash
   npm install
   ```
4. **Start the development server**
   ```bash
   npm run dev
   ```
5. **Open your browser to http://localhost:3000**

You should now see the website running locally! It won't have all functionality yet (no database), but you can see the design and layout.

### Step 2: Set Up Your Database (Supabase)

1. **Go to [supabase.com](https://supabase.com) and create a free account**
2. **Create a new project**
   - Choose a name like "hutchins-electric"
   - Set a strong database password (save this!)
   - Choose a region close to Vermont (US East is good)
3. **Set up the database structure**
   - Go to the "SQL Editor" in your Supabase dashboard
   - Copy the contents of `supabase/migrations/001_initial_schema.sql` from your project
   - Paste it into the SQL Editor and click "Run"
4. **Get your connection details**
   - Go to Settings > API
   - Copy the "Project URL" and "Project API keys" (anon/public key)
   - Go to Settings > Database and copy the "service_role" key

### Step 3: Set Up Email Service (Resend)

1. **Go to [resend.com](https://resend.com) and create a free account**
2. **Create an API key**
   - Go to API Keys section
   - Click "Create API Key"
   - Give it a name like "hutchins-electric"
   - Copy the key (you won't see it again!)
3. **Add your sending domain (optional for testing)**
   - You can use Resend's test domain initially
   - Later, add your actual domain for professional emails

### Step 4: Configure Your Environment

1. **Copy the example environment file**
   ```bash
   copy .env.example .env.local
   ```
2. **Edit `.env.local` with your details**
   - Open the file in your code editor
   - Replace the placeholder values with your real ones from Steps 2 and 3
   - See `docs/CUSTOMIZATION.md` for detailed explanations of each setting

### Step 5: Test Everything Works

1. **Restart your development server**
   ```bash
   # Press Ctrl+C to stop, then:
   npm run dev
   ```
2. **Test the booking form**
   - Go to http://localhost:3000/schedule
   - Fill out and submit a booking
   - Check your Supabase dashboard to see if it was saved
3. **Test the quote form**  
   - Go to http://localhost:3000/quote
   - Submit a quote request
   - Check if you received an email

### Step 6: Deploy to the Internet

1. **Create a GitHub account** (if you don't have one)
2. **Push your code to GitHub**
   - Create a new repository
   - Follow GitHub's instructions to push your code
3. **Deploy with Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up with GitHub
   - Import your GitHub repository
   - Add your environment variables in Vercel's dashboard
   - Deploy!

## What's Next?

Once everything is working:

1. **Customize your site** - See `docs/CUSTOMIZATION.md`
2. **Set up your domain** - Point your domain to Vercel
3. **Test thoroughly** - Go through all forms and features
4. **Add your content** - Replace placeholder text and images

## Need Help?

- **Having issues?** Check `docs/TROUBLESHOOTING.md`
- **Want to customize?** See `docs/CUSTOMIZATION.md`
- **Technical problems?** Check the main README.md for more detailed technical information

## Success Checklist

- [ ] Website loads at http://localhost:3000
- [ ] Booking form saves to database
- [ ] Quote form sends emails
- [ ] Website deployed to internet
- [ ] Your business information updated
- [ ] All forms tested and working

Congratulations! You now have a professional electrical contractor website up and running.