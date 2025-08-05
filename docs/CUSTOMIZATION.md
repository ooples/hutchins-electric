# Customization Guide

This guide walks you through customizing the Hutchins Electric website to match your business needs, branding, and preferences.

## Business Information Updates

### Essential Information to Change

#### 1. Phone Numbers
**Find and replace:** `802-555-0123`

**Locations to update:**
- `src/app/layout.tsx` (line 64, 152, 203)
- Navigation "Call Now" button
- Footer contact section
- Any service pages

**How to update:**
1. Use VS Code's "Find and Replace" (Ctrl+H)
2. Search for: `802-555-0123`
3. Replace with: `your-actual-phone-number`

#### 2. Email Addresses
**Find and replace:** `service@hutchinselectric.com`

**Locations to update:**
- `src/app/layout.tsx` (line 65, 208)
- `.env.local` file (BUSINESS_EMAIL)
- Contact forms and quote forms

#### 3. Business Name
**Find and replace:** `Hutchins Electric`

**Key locations:**
- `src/app/layout.tsx` (multiple locations)
- Page titles and meta descriptions
- Footer and navigation

#### 4. Service Areas
**Current areas:** Burlington, Montpelier, Stowe

**Locations to update:**
- `src/app/layout.tsx` (lines 77-93) - structured data
- Footer service areas section
- Homepage content
- SEO keywords and descriptions

## Visual Branding

### 1. Logo and Images

#### Adding Your Logo
1. **Add your logo file** to the `public/` directory
   - Recommended formats: PNG, SVG, or JPG
   - Suggested sizes: 200x50px for header, 400x100px for high-res
   - Name it something like `logo.png` or `company-logo.svg`

2. **Update the navigation logo** in `src/app/layout.tsx`:
   ```tsx
   // Replace this line (around line 129):
   <Link href="/" className="text-xl font-bold text-gray-900">
     Hutchins Electric
   </Link>
   
   // With this:
   <Link href="/" className="flex items-center">
     <Image 
       src="/your-logo.png" 
       alt="Your Business Name" 
       width={150} 
       height={40}
       className="h-8 w-auto"
     />
   </Link>
   ```

3. **Add the Image import** at the top of `layout.tsx`:
   ```tsx
   import Image from "next/image";
   ```

#### Open Graph Images
1. Create a social media image (1200x630px) and save as `public/og-image.jpg`
2. This image appears when someone shares your site on social media

### 2. Colors and Styling

#### Brand Colors
The site uses these main colors:
- **Primary Blue:** `#2563eb` (blue-600)
- **Hover Blue:** `#1d4ed8` (blue-700)
- **Text Gray:** `#374151` (gray-700)
- **Background:** White

#### Updating Brand Colors
1. **Global CSS variables** in `src/app/globals.css`:
   ```css
   :root {
     --primary-color: #your-brand-color;
     --primary-hover: #your-darker-brand-color;
     --background: #ffffff;
     --foreground: #171717;
   }
   ```

2. **Tailwind classes** throughout the site:
   - Replace `bg-blue-600` with `bg-[#your-color]`
   - Replace `text-blue-600` with `text-[#your-color]`
   - Replace `hover:bg-blue-700` with `hover:bg-[#your-darker-color]`

#### Common Color Locations
- Navigation "Call Now" button
- Form submit buttons
- Link hover states
- Section backgrounds

### 3. Fonts

#### Current Font
The site uses **Inter** from Google Fonts (set in `src/app/layout.tsx`)

#### Changing the Font
1. **Update the font import** in `src/app/layout.tsx`:
   ```tsx
   // Replace line 2:
   import { Inter } from "next/font/google";
   
   // With your preferred font:
   import { Roboto } from "next/font/google";
   // or
   import { Open_Sans } from "next/font/google";
   ```

2. **Update the font initialization**:
   ```tsx
   // Replace line 7:
   const inter = Inter({ subsets: ["latin"] });
   
   // With:
   const roboto = Roboto({ 
     weight: ['300', '400', '500', '700'],
     subsets: ["latin"] 
   });
   ```

3. **Update the className** in the body tag:
   ```tsx
   // Replace in body tag:
   className={`${inter.className} antialiased`}
   
   // With:
   className={`${roboto.className} antialiased`}
   ```

## Content Customization

### 1. Homepage Content

#### Hero Section
**File:** `src/app/page.tsx`

**Key sections to customize:**
- Main headline and tagline
- Service description
- Call-to-action buttons
- Feature highlights

#### Services Section
Update the services you offer:
- Residential services
- Commercial services  
- Emergency services
- Specialty services

### 2. Services Page
**File:** `src/app/services/page.tsx`

**Customize:**
- Service categories
- Detailed service descriptions
- Pricing information (if desired)
- Service area details

### 3. Meta Data and SEO

#### Page Titles and Descriptions
**File:** `src/app/layout.tsx` (lines 10-52)

**Update these key SEO elements:**
```tsx
title: "Your Business Name | Your Key Services | Your Location"
description: "Your compelling business description with local keywords"
keywords: "your keywords, local terms, service terms"
```

#### Structured Data
**Lines 59-113** in `layout.tsx` contain business schema markup:
- Business name and contact info
- Service areas
- Business hours
- Social media links
- Geographic coordinates

**To update coordinates:**
1. Go to [Google Maps](https://maps.google.com)
2. Find your business location
3. Right-click and select "What's here?"
4. Copy the coordinates and update lines 73-74

### 4. Contact Information

#### Business Hours
**File:** `src/app/layout.tsx` (lines 95-108)

**Current setting:** 24/7 (00:00-23:59)

**To change to regular business hours:**
```tsx
"openingHoursSpecification": [
  {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "08:00",
    "closes": "17:00"
  }
]
```

#### Social Media Links
**File:** `src/app/layout.tsx` (lines 109-112)

**Update with your actual social media:**
```tsx
"sameAs": [
  "https://www.facebook.com/yourbusiness",
  "https://www.instagram.com/yourbusiness",
  "https://www.linkedin.com/company/yourbusiness"
]
```

## Adding New Pages

### 1. Create a New Page

1. **Create a new folder** in `src/app/`:
   ```
   src/app/about/page.tsx
   ```

2. **Basic page structure:**
   ```tsx
   export default function AboutPage() {
     return (
       <div className="min-h-screen py-12">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <h1 className="text-3xl font-bold text-gray-900 mb-8">
             About Us
           </h1>
           <div className="prose max-w-none">
             {/* Your content here */}
           </div>
         </div>
       </div>
     );
   }
   ```

3. **Add to navigation** in `src/app/layout.tsx`:
   ```tsx
   <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
     About
   </Link>
   ```

### 2. Common New Pages

#### About Page
- Company history
- Team members
- Certifications and licenses
- Mission statement

#### Testimonials Page
- Customer reviews
- Before/after photos
- Case studies

#### Blog/News Page
- Industry updates
- Safety tips
- Company news

## Advanced Customizations

### 1. Form Modifications

#### Adding Form Fields
**Files:** `src/app/quote/page.tsx`, `src/app/schedule/page.tsx`

**To add a new field:**
1. Add to the form state
2. Add the input field
3. Update the API handler
4. Update the database schema if needed

#### Custom Form Styling
Update Tailwind classes on form elements:
- Input fields
- Buttons
- Error messages
- Success states

### 2. Email Templates

**File:** `src/app/api/quotes/route.ts`

**Customize email content:**
- Subject lines
- Email body formatting
- Branding elements
- Additional recipient handling

### 3. Database Schema Changes

**File:** `supabase/migrations/001_initial_schema.sql`

**To add new fields:**
1. Update the migration file
2. Run the new migration in Supabase
3. Update TypeScript types in `src/types/database.ts`
4. Update form handling code

## Testing Your Changes

### 1. Local Testing
```bash
npm run dev
```

### 2. Build Testing
```bash
npm run build
npm run start
```

### 3. Mobile Testing
- Use browser developer tools
- Test on actual devices
- Check form functionality

### 4. Performance Testing
- Use Google PageSpeed Insights
- Check Core Web Vitals
- Test loading speeds

## Deployment Updates

After customizing:

1. **Update environment variables** in Vercel dashboard
2. **Test all forms** in production
3. **Submit updated sitemap** to Google Search Console
4. **Update social media** with new branding
5. **Test email deliverability**

## Common Customization Patterns

### Business Cards Integration
Add QR codes or business card downloads linking to:
- Quote request form
- Contact information
- Service pages

### Local SEO Optimization
- Add location-specific pages
- Include local landmarks in content
- Add local business schema markup
- Create location-specific service pages

### Seasonal Promotions
- Add promotional banners
- Create limited-time offer pages
- Update homepage messaging
- Add promotional form fields

## Getting Help

If you need assistance with customizations:
1. Check the `docs/TROUBLESHOOTING.md` guide
2. Review the main `README.md` for technical details
3. Test changes in development before deploying
4. Keep backups of working configurations