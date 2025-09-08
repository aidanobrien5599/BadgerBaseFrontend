# Project Structure Overview

This document provides an overview of the BadgerBase frontend project structure and organization.

## 📁 Directory Structure

### Core Application
```
app/                    # Next.js 15 App Router
├── globals.css        # Global styles and Tailwind imports
├── layout.tsx         # Root layout with providers
├── loading.tsx        # Global loading component
├── page.tsx          # Home page component
├── about/            # About page
│   ├── loading.tsx   # About page loading state
│   └── page.tsx      # About page content
├── api/              # API routes
│   └── proxy/        # Proxy endpoints
├── auth/             # Authentication pages
│   └── page.tsx      # Login/Signup/OTP/Reset forms
└── stim/             # Stimulation page
    └── page.tsx      # Stim page content
```

### Components
```
components/
├── ui/               # shadcn/ui base components
│   ├── alert.tsx     # Alert notifications
│   ├── avatar.tsx    # User avatars
│   ├── badge.tsx     # Status badges
│   ├── button.tsx    # Button variants
│   ├── card.tsx      # Card containers
│   ├── chart.tsx     # Chart components
│   ├── checkbox.tsx  # Form checkboxes
│   ├── collapsible.tsx # Collapsible sections
│   ├── input.tsx     # Form inputs
│   ├── label.tsx     # Form labels
│   ├── progress.tsx  # Progress indicators
│   ├── select.tsx    # Select dropdowns
│   ├── separator.tsx # Visual separators
│   └── slider.tsx    # Range sliders
├── course-header.tsx     # Course page header
├── course-table.tsx      # Course data table
├── display-text.tsx      # Text display utility
├── dopamine-dashboard.tsx # Dashboard component
├── footer.tsx            # Site footer
├── instagram-reels.tsx   # Social media integration
├── maintenance-banner.tsx # Maintenance notices
├── navigation.tsx        # Main navigation bar
├── notification-ticker.tsx # Notification ticker
├── notification.tsx      # Notification system
├── pagination-controls.tsx # Table pagination
├── PostHogProvider.tsx   # Analytics provider
├── search-filters.tsx    # Search filtering
├── theme-provider.tsx    # Theme management
├── tiktok-feed.tsx      # Social media feed
└── trending-feed.tsx    # Trending content
```

### Application Logic
```
contexts/
└── AuthContext.tsx   # Global authentication state

hooks/
└── use-mobile.tsx    # Mobile device detection

lib/
├── posthog.ts        # Analytics configuration
├── supabase.ts       # Supabase client and types
└── utils.ts          # Utility functions (cn, etc.)
```

### Configuration & Assets
```
database/
└── setup.sql         # Database schema and RLS policies

docs/                 # Project documentation
├── AUTHENTICATION_README.md    # Complete auth guide
├── AUTHENTICATION_SETUP.md     # Quick setup instructions
├── IMPLEMENTATION_SUMMARY.md   # Technical implementation notes
└── PROJECT_STRUCTURE.md        # This file

public/               # Static assets
├── BadgerBase.png               # Main logo
├── BadgerBaseTransparent.png    # Transparent logo
├── placeholder-*.{jpg,png,svg}  # Placeholder images
├── sconnie-grades-transparent.png # Alternative branding
└── SconnieGradesLogo.png       # Legacy logo

styles/
└── globals.css       # Additional global styles
```

### Configuration Files
```
Root Level Configuration:
├── .env.local.example      # Environment variables template
├── .gitignore             # Git ignore patterns
├── components.json        # shadcn/ui configuration
├── next-env.d.ts         # Next.js TypeScript declarations
├── next.config.mjs       # Next.js configuration
├── package.json          # Dependencies and scripts
├── postcss.config.mjs    # PostCSS configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🎯 Key Architecture Decisions

### 1. Next.js 15 App Router
- **Modern Routing**: Using the new App Router for better performance
- **Server Components**: Leveraging React Server Components where possible
- **Layouts**: Hierarchical layouts for consistent UI structure

### 2. Authentication Architecture
- **Context-Based State**: Global auth state via React Context
- **Supabase Integration**: Using Supabase Auth for security
- **Automatic Profiles**: Database triggers for user profile creation
- **Type Safety**: Full TypeScript integration with Supabase types

### 3. Component Organization
- **shadcn/ui Base**: Reusable, accessible base components
- **Feature Components**: Domain-specific components for courses, auth, etc.
- **Separation of Concerns**: Clear separation between UI and business logic

### 4. Styling Strategy
- **Tailwind CSS**: Utility-first styling for rapid development
- **Component Variants**: Using cva for component variations
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Theme Support**: Dark/light mode with next-themes

### 5. State Management
- **React Context**: For global state (authentication, theme)
- **Server State**: Supabase handles server-side state
- **Local State**: React hooks for component-level state

## 📊 File Organization Principles

### Grouping Strategy
1. **By Feature**: Related components grouped together
2. **By Type**: Similar file types in dedicated directories
3. **By Usage**: Frequently used utilities in `lib/`
4. **By Scope**: Global vs. component-specific styles

### Naming Conventions
- **kebab-case**: For file names and directories
- **PascalCase**: For React components
- **camelCase**: For functions and variables
- **UPPER_CASE**: For constants and environment variables

### Import Structure
```typescript
// 1. React and Next.js imports
import { useState } from 'react'
import Link from 'next/link'

// 2. Third-party libraries
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// 3. Internal imports (components, hooks, utils)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

// 4. Types
import type { Database } from '@/lib/supabase'
```

## 🔄 Future Considerations

### Scalability
- Consider implementing state management library (Zustand/Redux) if app grows
- Add component testing with React Testing Library
- Implement more sophisticated caching strategies

### Performance
- Add bundle analysis tools
- Implement code splitting for large components
- Consider adding service worker for offline functionality

### Developer Experience
- Add Storybook for component documentation
- Implement automated testing pipeline
- Add commit hooks for code quality

### Features
- Add internationalization (i18n) support
- Implement real-time features with Supabase Realtime
- Add progressive web app (PWA) capabilities

## 📝 Maintenance Notes

### Regular Tasks
- Update dependencies monthly
- Review and update documentation
- Monitor bundle size and performance
- Check for security vulnerabilities

### Code Quality
- ESLint configuration ensures consistent code style
- TypeScript provides type safety
- Prettier integration for code formatting
- Husky hooks for pre-commit validation

This structure supports rapid development while maintaining code quality and scalability for the BadgerBase frontend application.
