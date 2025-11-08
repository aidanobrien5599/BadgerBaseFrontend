# Supabase Authentication Setup

This project uses Supabase for authentication with the following features:

## Features

- **Email/Password Authentication**: Users can sign up and sign in with email and password
- **Magic Link (OTP)**: Users can sign in with a one-time password sent to their email
- **Session Management**: Automatic session management using cookies
- **Protected Routes**: Middleware to handle authentication state across the app

## Components

### AuthButton (`components/auth-button.tsx`)
- Displays a "Login" button when user is not authenticated
- Shows user avatar with dropdown menu when authenticated
- Handles sign out functionality

### LoginDialog (`components/login-dialog.tsx`)
- Modal dialog for authentication
- Supports three modes:
  1. Sign in with email/password
  2. Sign up with email/password
  3. Sign in with magic link (OTP)
- Toggle between authentication methods
- Form validation and error handling

## Configuration

Make sure your `.env` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Setup

### Enable Email Auth

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Enable "Email" provider
4. Configure email templates (optional)

### Configure Email Templates (Optional)

You can customize the email templates for:
- Magic Link emails
- Confirmation emails
- Password reset emails

Go to Authentication → Email Templates in your Supabase dashboard.

### Site URL Configuration

Make sure to set your site URL in Supabase:
1. Go to Authentication → URL Configuration
2. Set Site URL to your production domain (e.g., `https://yourdomain.com`)
3. Add redirect URLs for development: `http://localhost:3000/**`

## Usage

The auth button is automatically added to the navigation bar in the top right corner. Users can:

1. Click "Login" to open the authentication dialog
2. Choose to sign in/up with password or use a magic link
3. After successful authentication, their avatar appears in the nav bar
4. Click the avatar to access account options and sign out

## API Routes

- `/auth/callback` - Handles OAuth callbacks and email confirmations
- `/auth/auth-code-error` - Error page for failed authentication attempts

## Middleware

The middleware (`middleware.ts`) automatically:
- Refreshes user sessions
- Updates authentication cookies
- Protects routes (can be extended)

## Security

- Uses Supabase Row Level Security (RLS)
- Secure cookie-based session management
- CSRF protection built-in
- Automatic token refresh
