# Hutchins Electric Website - Deployment Guide for Vercel

This comprehensive guide will walk you through deploying the Hutchins Electric Next.js website to Vercel, from preparation to post-deployment optimization.

## Table of Contents
1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Step-by-step Vercel Deployment](#step-by-step-vercel-deployment)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Custom Domain Configuration](#custom-domain-configuration)
5. [Post-deployment Verification](#post-deployment-verification)
6. [Automatic Deployments from GitHub](#automatic-deployments-from-github)
7. [Managing Production vs Preview Deployments](#managing-production-vs-preview-deployments)
8. [Troubleshooting Common Issues](#troubleshooting-common-issues)
9. [SEO Checklist After Deployment](#seo-checklist-after-deployment)
10. [Performance Optimization Tips](#performance-optimization-tips)

## Pre-deployment Checklist

Before deploying to Vercel, ensure your application is ready for production:

### 1. Update Contact Information
- [ ] Verify all phone numbers are correct throughout the site
- [ ] Confirm email addresses are current and monitored
- [ ] Update business address if needed
- [ ] Check social media links are working

### 2. Content Review
- [ ] Review all service descriptions for accuracy
- [ ] Ensure pricing information is up-to-date
- [ ] Verify gallery images are optimized and loading properly
- [ ] Check that all forms are working correctly

### 3. Technical Preparation
- [ ] Run `npm run build` locally to ensure no build errors
- [ ] Test all pages and functionality in development
- [ ] Verify database connections (Supabase) are working
- [ ] Check that all environment variables are documented
- [ ] Ensure SSL certificates for external services are valid

### 4. Code Quality
- [ ] Run `npm run lint` to check for code issues
- [ ] Remove any console.log statements from production code
- [ ] Verify all TODO comments are addressed or documented
- [ ] Test responsive design on various screen sizes

## Step-by-step Vercel Deployment

### Step 1: Create a Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and choose to sign up with GitHub (recommended)
3. Authorize Vercel to access your GitHub account
4. Complete your profile setup

### Step 2: Prepare Your GitHub Repository
1. Ensure your code is pushed to a GitHub repository
2. Make sure your main branch contains the latest, tested code
3. Verify your `package.json` has the correct build scripts:
   ```json
   {
     "scripts": {
       "dev": "next dev --turbopack",
       "build": "next build",
       "start": "next start",
       "lint": "next lint"
     }
   }
   ```

### Step 3: Import Project to Vercel
1. From your Vercel dashboard, click "New Project"
2. Select "Import Git Repository"
3. Choose your Hutchins Electric repository from the list
4. Click "Import"

**Screenshot Description**: You'll see a list of your GitHub repositories. Find "hutchins-electric" and click the "Import" button next to it.

### Step 4: Configure Project Settings
1. **Project Name**: Keep as "hutchins-electric" or customize
2. **Framework Preset**: Vercel should automatically detect "Next.js"
3. **Root Directory**: Leave as "./" (root of repository)
4. **Build and Output Settings**: Leave as default unless you have custom requirements
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

**Screenshot Description**: The project configuration screen shows dropdown menus for framework selection, text fields for directories, and build commands.

### Step 5: Deploy
1. Click "Deploy" button
2. Wait for the deployment to complete (usually 2-5 minutes)
3. You'll see a success screen with your deployment URL

**Screenshot Description**: A progress screen shows build logs in real-time, followed by a celebration screen with your live site URL.

## Environment Variables Setup

Your Hutchins Electric application requires several environment variables for full functionality.

### Step 1: Access Environment Variables
1. Go to your project dashboard on Vercel
2. Click on the "Settings" tab
3. Click "Environment Variables" in the sidebar

### Step 2: Add Required Variables
Add each of the following environment variables:

#### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Email Service (if using Resend)
```
RESEND_API_KEY=your_resend_api_key
```

#### Other Configuration
```
NODE_ENV=production
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Step 3: Configure Variable Environments
For each variable:
1. Enter the **Name** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
2. Enter the **Value** (your actual key/URL)
3. Select environments: Production, Preview, and Development
4. Click "Save"

**Important**: Never commit sensitive keys to your repository. Always use environment variables for API keys, database URLs, and secrets.

## Custom Domain Configuration

### Step 1: Access Domain Settings
1. From your project dashboard, go to "Settings"
2. Click "Domains" in the sidebar
3. Click "Add Domain"

### Step 2: Add Your Domain
1. Enter your domain (e.g., `hutchinselectric.com`)
2. Click "Add"
3. Vercel will provide DNS configuration instructions

### Step 3: Configure DNS Records
You'll need to add these DNS records through your domain registrar:

#### For Root Domain (hutchinselectric.com):
```
Type: A
Name: @
Value: 76.76.19.61
```

#### For WWW Subdomain:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 4: Verify Domain
1. After adding DNS records, return to Vercel
2. Click "Refresh" next to your domain
3. Wait for verification (can take up to 48 hours)
4. Once verified, you'll see a green checkmark

**Screenshot Description**: The domains page shows a list of your domains with status indicators (pending, verified, etc.) and options to refresh or remove each domain.

## Post-deployment Verification

### Functionality Testing
- [ ] Visit your live site and test all pages
- [ ] Submit a test quote request to verify forms work
- [ ] Test the booking system functionality
- [ ] Verify all images and assets load correctly
- [ ] Check that navigation works on all devices

### Performance Testing
- [ ] Run Google PageSpeed Insights on your live site
- [ ] Test loading times from different locations
- [ ] Verify mobile responsiveness
- [ ] Check that all external links work

### Security Verification
- [ ] Ensure HTTPS is working (look for lock icon in browser)
- [ ] Verify that sensitive pages (admin) require authentication
- [ ] Test that environment variables are not exposed in browser
- [ ] Check that database connections are secure

## Automatic Deployments from GitHub

Vercel automatically sets up continuous deployment when you import from GitHub.

### How It Works
1. **Main Branch**: Pushes to your main branch trigger production deployments
2. **Feature Branches**: Other branches create preview deployments
3. **Pull Requests**: Each PR gets its own preview URL

### Managing Auto-deployments
1. Go to your project settings
2. Click "Git" in the sidebar
3. Configure deployment settings:
   - **Production Branch**: Usually `main` or `master`
   - **Auto-deploy**: Keep enabled for continuous deployment
   - **Deploy Hooks**: Create webhooks for external triggers

### Deployment Status
- Check deployment status in the "Deployments" tab
- Each deployment shows build logs and status
- Failed deployments will show error details

## Managing Production vs Preview Deployments

### Production Deployments
- Triggered by pushes to your main branch
- Use production environment variables
- Served on your custom domain
- Should only contain tested, stable code

### Preview Deployments
- Created for every branch and pull request
- Use preview environment variables (if different)
- Get unique URLs like `hutchins-electric-git-feature-username.vercel.app`
- Perfect for testing new features

### Best Practices
1. **Feature Branches**: Create branches for new features
2. **Pull Requests**: Always use PRs for code review
3. **Testing**: Test preview deployments before merging
4. **Rollbacks**: Use Vercel's instant rollback feature if needed

### Rollback Process
1. Go to "Deployments" tab
2. Find the deployment you want to rollback to
3. Click the three dots menu
4. Select "Promote to Production"

## Troubleshooting Common Issues

### Build Failures

#### Issue: "Module not found" errors
**Solution**: 
1. Check that all dependencies are in `package.json`
2. Run `npm install` locally to verify
3. Ensure import paths are correct and case-sensitive

#### Issue: Environment variables not working
**Solution**:
1. Verify variables are set in Vercel dashboard
2. Check variable names match exactly (case-sensitive)
3. Ensure `NEXT_PUBLIC_` prefix for client-side variables
4. Redeploy after adding new variables

#### Issue: Build timeout
**Solution**:
1. Optimize your build process
2. Remove unused dependencies
3. Contact Vercel support for build time limits

### Runtime Errors

#### Issue: Database connection failures
**Solution**:
1. Verify Supabase environment variables
2. Check Supabase project status
3. Test database connection locally
4. Review Supabase logs for errors

#### Issue: 404 errors on page refresh
**Solution**:
1. Ensure your `next.config.ts` has proper routing configuration
2. Check that all pages are in the correct directory structure
3. Verify no typos in file names

#### Issue: API routes not working
**Solution**:
1. Check API route file naming (`route.ts` for App Router)
2. Verify HTTP methods are properly exported
3. Check server logs in Vercel dashboard

### Performance Issues

#### Issue: Slow loading times
**Solution**:
1. Optimize images using Next.js Image component
2. Enable compression in `next.config.ts`
3. Use dynamic imports for large components
4. Check for unnecessary JavaScript bundles

#### Issue: High memory usage
**Solution**:
1. Review component rendering patterns
2. Implement proper cleanup in useEffect hooks
3. Optimize database queries
4. Use React.memo for expensive components

## SEO Checklist After Deployment

### Google Search Console Setup
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (your website URL)
3. Verify ownership using one of these methods:
   - HTML tag in your site's `<head>`
   - DNS record
   - Google Analytics
4. Submit your sitemap: `https://yourdomain.com/sitemap.xml`

### Essential SEO Tasks
- [ ] Verify all pages have unique, descriptive titles
- [ ] Check that meta descriptions are compelling and under 160 characters
- [ ] Ensure all images have alt text
- [ ] Test that your site is mobile-friendly using Google's Mobile-Friendly Test
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Business Profile for local SEO
- [ ] Create and submit robots.txt file
- [ ] Implement structured data for business information

### Social Media Integration
- [ ] Add Open Graph tags for Facebook sharing
- [ ] Add Twitter Card tags for Twitter sharing
- [ ] Test social sharing previews using Facebook Debugger
- [ ] Update social media profiles with new website URL

### Local SEO for Hutchins Electric
- [ ] Claim and optimize Google Business Profile
- [ ] Ensure NAP (Name, Address, Phone) consistency across all pages
- [ ] Add local business schema markup
- [ ] Create location-specific service pages
- [ ] Encourage customer reviews on Google and other platforms

## Performance Optimization Tips

### Next.js Specific Optimizations

#### Image Optimization
```jsx
import Image from 'next/image'

// Instead of:
<img src="/gallery/photo1.jpg" alt="Electrical work" />

// Use:
<Image 
  src="/gallery/photo1.jpg" 
  alt="Electrical work"
  width={800}
  height={600}
  priority={false} // Set to true for above-the-fold images
/>
```

#### Font Optimization
```jsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Layout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

### Vercel-Specific Optimizations

#### Enable Analytics
1. Go to project settings in Vercel
2. Click "Analytics" in sidebar
3. Enable "Web Analytics"
4. Add the analytics script to your layout

#### Use Vercel Functions for API Routes
Your API routes in `/src/app/api/` automatically become serverless functions, which is optimal for performance and cost.

#### Configure Caching Headers
```typescript
// In your API routes
export async function GET() {
  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 's-maxage=86400, stale-while-revalidate=59'
    }
  })
}
```

### General Performance Tips

#### Code Splitting
```jsx
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <p>Loading...</p>
})
```

#### Database Query Optimization
- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Cache frequently accessed data
- Use Supabase's built-in caching when possible

#### Asset Optimization
- Compress images before uploading
- Use WebP format when possible
- Implement lazy loading for images below the fold
- Minify CSS and JavaScript (Next.js does this automatically)

### Monitoring and Maintenance

#### Set Up Monitoring
1. Use Vercel Analytics for performance metrics
2. Set up error tracking (e.g., Sentry)
3. Monitor Core Web Vitals regularly
4. Set up uptime monitoring

#### Regular Maintenance Tasks
- [ ] Update dependencies monthly
- [ ] Review and update content regularly
- [ ] Monitor site performance metrics
- [ ] Check for broken links quarterly
- [ ] Review and update SEO strategies
- [ ] Backup database regularly

## Conclusion

Following this guide will ensure a successful deployment of your Hutchins Electric website to Vercel. Remember to:

1. Test thoroughly before deploying to production
2. Monitor your site performance and errors
3. Keep dependencies updated
4. Regularly backup your data
5. Stay informed about Vercel and Next.js updates

For additional support:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

**Need Help?** If you encounter issues not covered in this guide, check the troubleshooting section first, then consult the official documentation or contact the development team.