# Troubleshooting Guide

This guide helps you resolve common issues you might encounter while setting up, customizing, or running the Hutchins Electric website.

## Quick Diagnosis Checklist

Before diving into specific issues, run through this checklist:

- [ ] Is Node.js version 18 or higher installed? (`node --version`)
- [ ] Are all dependencies installed? (`npm install`)
- [ ] Is your `.env.local` file properly configured?
- [ ] Are your Supabase and Resend services working?
- [ ] Did you restart the development server after changes?

## Common Setup Issues

### 1. "Cannot find module" or "Module not found" errors

**Symptoms:**
- Error messages about missing modules during `npm install` or `npm run dev`
- App won't start or crashes on startup

**Solutions:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Clear npm cache if needed
npm cache clean --force
npm install
```

**Alternative solution:**
```bash
# Try using npm instead of yarn, or vice versa
npm install
# OR
yarn install
```

### 2. Development server won't start

**Symptoms:**
- `npm run dev` fails
- Port 3000 already in use
- Server crashes immediately

**Solutions:**

**Port conflict:**
```bash
# Kill process using port 3000
npx kill-port 3000
# OR specify a different port
npm run dev -- -p 3001
```

**Permission issues (Windows):**
```bash
# Run as administrator or check antivirus software
# Exclude project folder from real-time scanning
```

**Check for syntax errors:**
```bash
npm run lint
```

### 3. Environment variables not loading

**Symptoms:**
- Database connections fail
- Email sending doesn't work
- "undefined" errors in API calls

**Solutions:**
1. **Check file name:** Must be `.env.local` (not `.env` or `.env.example`)
2. **Check file location:** Must be in project root directory
3. **Restart development server** after changing env vars
4. **No quotes around values** (unless they contain spaces)

**Correct format:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
RESEND_API_KEY=re_AbCdEf123456
```

**Incorrect format:**
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"  # Remove quotes
RESEND_API_KEY = re_AbCdEf123456  # Remove spaces around =
```

## Database Issues (Supabase)

### 1. Database connection fails

**Symptoms:**
- Forms don't save data
- "Failed to fetch" errors
- Network errors in browser console

**Diagnosis:**
1. Check your Supabase project status at supabase.com
2. Verify your project URL and keys in `.env.local`
3. Check if your project is paused (free tier auto-pauses after inactivity)

**Solutions:**
1. **Verify credentials:**
   ```bash
   # Test your connection
   curl -H "apikey: YOUR_ANON_KEY" \
        -H "Authorization: Bearer YOUR_ANON_KEY" \
        "YOUR_SUPABASE_URL/rest/v1/"
   ```

2. **Check database schema:**
   - Go to Supabase dashboard > Table Editor
   - Ensure `bookings` and `quotes` tables exist
   - Verify column names match your code

3. **Re-run migration:**
   - Go to SQL Editor in Supabase
   - Run the contents of `supabase/migrations/001_initial_schema.sql`

### 2. "Row Level Security" errors

**Symptoms:**
- 401/403 errors when inserting data
- "permission denied" messages

**Solution:**
Disable RLS for testing (re-enable for production):
1. Go to Supabase > Table Editor
2. Select your table
3. Go to "Settings" tab
4. Temporarily disable "Enable Row Level Security"

### 3. Database query errors

**Symptoms:**
- Specific form fields cause errors
- Data saves partially

**Solutions:**
1. **Check column types match your data:**
   - Text fields for strings
   - Integer for numbers
   - Timestamp with timezone for dates

2. **Check for required fields:**
   - Ensure all non-nullable columns have values
   - Add default values where appropriate

## Email Issues (Resend)

### 1. Emails not sending

**Symptoms:**
- Forms submit successfully but no emails arrive
- API errors related to email sending

**Diagnosis:**
1. Check Resend dashboard for delivery logs
2. Verify your API key is correct
3. Check spam/junk folders

**Solutions:**
1. **Verify Resend setup:**
   ```bash
   # Test your Resend API key
   curl -X POST 'https://api.resend.com/emails' \
        -H 'Authorization: Bearer YOUR_API_KEY' \
        -H 'Content-Type: application/json' \
        -d '{"to":"test@example.com","from":"noreply@resend.dev","subject":"Test","html":"Test"}'
   ```

2. **Check domain verification:**
   - In Resend dashboard, verify your sending domain
   - Use resend.dev domain for testing

3. **Update email configuration:**
   - Ensure `BUSINESS_EMAIL` in `.env.local` is correct
   - Check email format in API route files

### 2. Emails going to spam

**Solutions:**
1. **Domain setup:**
   - Add SPF, DKIM, and DMARC records
   - Verify domain in Resend dashboard

2. **Email content:**
   - Avoid spam trigger words
   - Include proper unsubscribe links
   - Use professional formatting

### 3. Rate limiting errors

**Symptoms:**
- Email sending fails after multiple submissions
- "Rate limit exceeded" errors

**Solutions:**
1. **Check Resend limits:**
   - Free tier: 10,000 emails/month, 10 emails/second
   - Add billing information for higher limits

2. **Implement rate limiting:**
   - Add delays between submissions
   - Cache recent submissions

## Form Issues

### 1. Forms not submitting

**Symptoms:**
- Submit button doesn't work
- Page refreshes but nothing happens
- Console errors

**Solutions:**
1. **Check browser console:**
   - Open Developer Tools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Verify form validation:**
   - Ensure all required fields are filled
   - Check email format validation
   - Verify phone number format

3. **Test with minimal data:**
   - Try submitting with only required fields
   - Remove special characters from inputs

### 2. Form data not reaching database

**Symptoms:**
- Form submits successfully but data doesn't appear in Supabase
- Success message shows but no database entry

**Solutions:**
1. **Check API routes:**
   - Verify `/api/bookings/route.ts` and `/api/quotes/route.ts`
   - Add console.log statements to debug

2. **Check database permissions:**
   - Verify table permissions in Supabase
   - Check Row Level Security settings

3. **Verify data format:**
   - Ensure date formats match database expectations
   - Check for special characters causing issues

## Build and Deployment Issues

### 1. Build failures

**Symptoms:**
- `npm run build` fails
- TypeScript errors
- Missing dependencies

**Solutions:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build

# Fix TypeScript errors
npm run lint
```

**Common TypeScript fixes:**
- Add missing type imports
- Fix unused variables
- Resolve type mismatches

### 2. Vercel deployment issues

**Symptoms:**
- Deployment fails
- Environment variables not working in production
- Functions timeout

**Solutions:**
1. **Environment variables:**
   - Add all variables to Vercel dashboard
   - Don't include quotes around values
   - Redeploy after adding variables

2. **Function timeouts:**
   - Optimize API routes
   - Add error handling
   - Check external service response times

3. **Build configuration:**
   ```json
   // vercel.json
   {
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 10
       }
     }
   }
   ```

### 3. Domain and SSL issues

**Symptoms:**
- Custom domain not working
- SSL certificate errors
- DNS propagation issues

**Solutions:**
1. **DNS setup:**
   - Point domain to Vercel servers
   - Wait 24-48 hours for propagation
   - Use DNS checker tools

2. **SSL certificate:**
   - Vercel handles this automatically
   - Ensure domain is verified
   - Check for mixed content warnings

## Performance Issues

### 1. Slow loading times

**Solutions:**
1. **Optimize images:**
   - Use Next.js Image component
   - Compress images before uploading
   - Use appropriate image formats (WebP)

2. **Check bundle size:**
   ```bash
   npm run build
   # Review bundle analyzer output
   ```

3. **Database optimization:**
   - Add indexes to frequently queried columns
   - Limit query results
   - Use database connection pooling

### 2. Mobile responsiveness issues

**Solutions:**
1. **Test on actual devices**
2. **Use browser developer tools**
3. **Check Tailwind responsive classes:**
   - `sm:`, `md:`, `lg:` breakpoints
   - Mobile-first design approach

## Browser-Specific Issues

### 1. Safari compatibility

**Common issues:**
- Form submission problems
- Date picker differences
- CSS compatibility

**Solutions:**
- Test on actual Safari browser/iOS device
- Add webkit-specific CSS prefixes
- Use polyfills for unsupported features

### 2. Internet Explorer (if required)

**Solutions:**
- Add IE-specific polyfills
- Test extensively
- Consider graceful degradation

## Getting More Help

### 1. Debug Information to Collect

When asking for help, include:
- Node.js version (`node --version`)
- Operating system
- Browser and version
- Exact error messages
- Steps to reproduce the issue
- Environment variables (without actual values)

### 2. Useful Commands for Debugging

```bash
# Check versions
node --version
npm --version

# Clear all caches
npm cache clean --force
rm -rf .next
rm -rf node_modules
npm install

# Verbose error output
npm run dev --verbose

# Check for port conflicts
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux
```

### 3. Log Files and Debugging

**Browser Console:**
- Open Developer Tools (F12)
- Check Console, Network, and Application tabs
- Look for red error messages

**Server Logs:**
- Check terminal where `npm run dev` is running
- Add `console.log()` statements in API routes
- Use debugger statements for step-by-step debugging

**Supabase Logs:**
- Check Supabase dashboard > Logs
- Review API usage and errors
- Monitor real-time activity

### 4. Testing Strategies

**Systematic debugging:**
1. Start with a fresh project copy
2. Add changes incrementally
3. Test after each change
4. Keep working backups

**Isolation testing:**
- Test individual components
- Disable features to isolate issues
- Use minimal test data

**Production vs Development:**
- Issues that only occur in production
- Environment-specific problems
- Cache-related issues

## Prevention Tips

1. **Regular backups:**
   - Commit changes to git frequently
   - Keep working configuration files
   - Document custom changes

2. **Testing routine:**
   - Test all forms after changes
   - Check mobile responsiveness
   - Verify email delivery

3. **Monitoring:**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor uptime
   - Check performance regularly

4. **Updates:**
   - Keep dependencies updated
   - Monitor security advisories
   - Test updates in development first