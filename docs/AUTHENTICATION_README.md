# BadgerBase Authentication System

A comprehensive authentication system for BadgerBase with enhanced security features and user experience improvements.

## 🚀 Features

### Authentication Methods
- **Email/Password Authentication**: Traditional sign up and sign in
- **One-Time Password (OTP)**: Magic link authentication for existing users
- **Password Reset**: Secure password recovery for registered users

### Security & Validation
- **Email Validation**: Enforces @wisc.edu email addresses only
- **Duplicate Account Prevention**: Checks for existing emails during signup
- **Account Verification**: Ensures OTP/password reset only works for registered users
- **Row Level Security (RLS)**: Database-level security policies
- **Automatic Profile Creation**: Database triggers handle user profiles

### User Experience
- **Responsive Design**: Mobile and desktop optimized
- **Smart Error Messages**: Context-aware error handling
- **Loading States**: Visual feedback for all operations
- **Auto-redirect**: Seamless navigation after authentication
- **Form Validation**: Client-side validation with helpful messages

## 🔧 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project dashboard → Settings → API.

### 2. Supabase Configuration

#### Authentication Settings
1. Go to **Authentication > Settings** in your Supabase dashboard
2. Configure the following:

**Site URL:**
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

**Redirect URLs:**
- `http://localhost:3000/auth` (development)
- `https://yourdomain.com/auth` (production)
- `http://localhost:3000/auth?mode=reset` (password reset - development)
- `https://yourdomain.com/auth?mode=reset` (password reset - production)

#### Email Templates (Optional)
1. Go to **Authentication > Templates**
2. Customize email templates:
   - **Confirm signup**: Welcome email with confirmation link
   - **Reset password**: Password reset instructions
   - **Magic Link**: OTP authentication email

### 3. Database Setup

The database schema is already configured with the previous `setup.sql`. If you need to verify or re-run it:

1. Go to **SQL Editor** in your Supabase dashboard
2. Verify these exist:
   - `profiles` table with user data
   - RLS policies for data security
   - Automatic triggers for profile creation
   - Proper indexes for performance

## 📱 How to Use

### Regular Sign Up/Sign In
1. Navigate to `/auth`
2. **Sign Up**: Enter name, @wisc.edu email, and password
3. **Sign In**: Enter email and password
4. Verify email if confirmation is enabled

### One-Time Password (OTP)
1. Go to `/auth` and ensure you're in "Sign In" mode
2. Enter your registered @wisc.edu email
3. Click **"Use One-Time Password"**
4. Check email for 6-digit verification code
5. Enter code to sign in

### Password Reset
1. Go to `/auth` and ensure you're in "Sign In" mode
2. Click **"Forgot your password?"**
3. Enter your registered @wisc.edu email
4. Click **"Send Reset Email"**
5. Check email for reset link
6. Follow link to set new password

## 🛡️ Security Features

### Email Validation Checks
- **Signup**: Prevents duplicate accounts with existing emails
- **OTP**: Only works for registered email addresses
- **Password Reset**: Only sends reset emails for existing accounts
- **Domain Restriction**: Only @wisc.edu emails accepted

### Enhanced Error Messages
- **Invalid Credentials**: Clear feedback for login failures
- **Account Exists**: Helpful message when email is already registered
- **Account Not Found**: Clear message when email isn't registered
- **Email Format**: Validation for proper @wisc.edu format

### Database Security
- **Row Level Security**: Users can only access their own data
- **Automatic Profile Creation**: Prevents manual insertion errors
- **Secure Session Management**: Proper authentication state handling

## 🧪 Testing Guide

### Test Scenarios

1. **New User Registration**
   - Try with non-@wisc.edu email (should fail)
   - Try with valid @wisc.edu email (should succeed)
   - Try same email twice (should show "account exists" error)

2. **OTP Authentication**
   - Try with unregistered email (should show "no account found")
   - Try with registered email (should send code)
   - Enter correct/incorrect codes

3. **Password Reset**
   - Try with unregistered email (should show "no account found")
   - Try with registered email (should send reset link)
   - Follow reset link to change password

4. **Form Validation**
   - Test password length requirements
   - Test password confirmation matching
   - Test email format validation

## 🚨 Error Handling

### Common Errors & Solutions

**"An account with this email already exists"**
- Solution: Use the sign in form instead of sign up

**"No account found with this email"**
- Solution: Create an account first or check email spelling

**"Must use wisconsin email"**
- Solution: Use an email ending with @wisc.edu

**"Password must be at least 6 characters long"**
- Solution: Choose a longer password

**"Passwords do not match"**
- Solution: Ensure both password fields are identical

## 🔄 Flow Diagrams

### Sign Up Flow
1. User enters name, email, password
2. System validates @wisc.edu email
3. System checks if email already exists
4. If new: Create account + send confirmation
5. Database trigger creates user profile
6. Redirect to home or show confirmation message

### OTP Flow
1. User enters email
2. System validates @wisc.edu email
3. System checks if account exists
4. If exists: Send 6-digit code
5. User enters code
6. System verifies and logs in

### Password Reset Flow
1. User enters email
2. System validates @wisc.edu email
3. System checks if account exists
4. If exists: Send reset link
5. User clicks link and sets new password

## 🔧 Configuration Options

### Email Confirmation
- **Enabled**: Users must verify email before full access
- **Disabled**: Immediate access after signup

### Session Duration
- **Default**: 1 hour
- **Remember Me**: 30 days (can be configured in Supabase)

### Rate Limiting
- **OTP**: 1 request per minute per email
- **Password Reset**: 1 request per 5 minutes per email
- **Login Attempts**: 5 attempts per 15 minutes per IP

## 📞 Support

### Troubleshooting
1. Check browser console for errors
2. Verify environment variables are set
3. Check Supabase Auth logs
4. Ensure database triggers are working
5. Verify RLS policies are active

### Common Issues
- **Email not received**: Check spam folder, verify SMTP settings
- **Reset link expired**: Links expire after 1 hour
- **OTP code invalid**: Codes expire after 10 minutes
- **Profile not created**: Check database trigger function

## 🎯 Future Enhancements

- Social login (Google, GitHub)
- Two-factor authentication (2FA)
- Account recovery options
- Admin user management
- Audit logging
- Session management dashboard
- Advanced password policies
- Account lockout protection
