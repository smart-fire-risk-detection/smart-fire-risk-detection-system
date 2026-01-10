# Email Confirmation Setup Guide

## Issue Fixed
The "Email link is invalid or has expired" error has been addressed with the following changes:

### Code Changes Made:
1. ✅ Updated redirect URL in sign-up to point to `/auth` instead of `/`
2. ✅ Added email verification handler in Auth page to detect confirmation callbacks
3. ✅ Added error handling for expired or invalid email links
4. ✅ Added success toast notifications when email is verified

## Supabase Configuration Required

To complete the setup, you need to configure the redirect URLs in your Supabase project:

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `oiyuolkdpenkaxhpxcbl`
3. Navigate to **Authentication** > **URL Configuration**

### Step 2: Configure Redirect URLs
Add the following URLs to **Redirect URLs** section:

#### For Local Development:
```
http://localhost:5173/auth
http://localhost:3000/auth
http://localhost:5173
http://localhost:3000
```

#### For Production (if deployed):
```
https://your-production-domain.com/auth
https://your-production-domain.com
```

### Step 3: Configure Site URL
Set the **Site URL** to:
- Local: `http://localhost:5173` or `http://localhost:3000`
- Production: `https://your-production-domain.com`

### Step 4: Email Template Settings (Optional but Recommended)
1. Go to **Authentication** > **Email Templates**
2. Edit the **Confirm signup** template
3. Ensure the confirmation link uses: `{{ .ConfirmationURL }}`

### Step 5: Email Auth Settings
1. Go to **Authentication** > **Providers** > **Email**
2. Ensure the following settings:
   - ✅ Enable email provider
   - ✅ Confirm email (this should be enabled to require email verification)
   - Set "Email OTP expiry" to a reasonable time (default is 1 hour)

## Testing the Fix

### 1. Start Your Development Server
```bash
cd emberguard-dash-main
npm run dev
```

Make sure it's running on `http://localhost:5173` (or the port shown in terminal)

### 2. Test Sign-Up Flow
1. Navigate to the auth page
2. Click "Sign Up" tab
3. Enter your email, password, and full name
4. Click "Sign Up"
5. Check your email for the confirmation link

### 3. Click Confirmation Link
When you click the link in your email:
- ✅ It should redirect to `http://localhost:5173/auth` (or your configured port)
- ✅ You should see a green toast message: "Email Verified!"
- ✅ If the link expired, you'll see a red error message explaining the issue

### 4. Sign In
After email verification, you can sign in with your credentials.

## Troubleshooting

### Error: "Email link is invalid or has expired"
**Causes:**
- Email confirmation link expired (default: 1 hour)
- Wrong redirect URL configured in Supabase
- Development server not running on the expected port

**Solutions:**
1. Ensure development server is running
2. Check that redirect URLs in Supabase match your actual URL
3. Request a new confirmation email if the link expired
4. Clear browser cache and cookies

### Error: "localhost refused to connect"
**Solution:**
- Make sure your development server is running: `npm run dev`
- Check the correct port (usually 5173 for Vite)

### Email Not Received
**Solutions:**
1. Check spam/junk folder
2. Verify email provider settings in Supabase
3. Check Supabase logs for email sending errors

### Link Redirects to Wrong Port
**Solution:**
- Add all possible ports to Supabase redirect URLs:
  - `http://localhost:5173/auth`
  - `http://localhost:3000/auth`
  - `http://localhost:8080/auth`

## Additional Configuration

### Increase Email OTP Expiry Time
If users need more time to confirm their email:

1. Go to Supabase Dashboard > **Authentication** > **Providers**
2. Click on **Email** provider
3. Increase "Email OTP expiry" from default (3600 seconds = 1 hour) to desired time

### Disable Email Confirmation (Not Recommended for Production)
If you want to skip email confirmation during development:

1. Go to **Authentication** > **Providers** > **Email**
2. Uncheck "Confirm email"
3. Users will be able to sign in immediately without email verification

⚠️ **Warning:** This is not recommended for production as it allows anyone to sign up without verifying their email address.

## Production Deployment

When deploying to production (e.g., Vercel, Netlify):

1. Update Supabase redirect URLs with your production domain
2. Update environment variables with production URLs
3. Test the complete sign-up flow on production
4. Monitor Supabase logs for any authentication errors

## Support

If you continue to experience issues:
1. Check Supabase Dashboard > **Logs** for authentication errors
2. Check browser console for JavaScript errors
3. Verify all redirect URLs are correctly configured
4. Ensure development server is running on the correct port
