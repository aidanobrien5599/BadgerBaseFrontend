# BadgerBase Frontend

A modern, responsive web application for UW-Madison course information and instructor ratings, built with Next.js 15 and featuring comprehensive authentication.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Badger-Base/BadgerBaseFrontend.git
cd BadgerBaseFrontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Environment Setup](#-environment-setup)
- [Development](#-development)
- [Authentication](#-authentication)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Documentation](#-documentation)

## ✨ Features

### Core Functionality
- 🔍 **Course Search & Filtering** - Advanced search with multiple filters
- 📊 **Instructor Ratings** - Grade distributions and rating data
- 📱 **Responsive Design** - Mobile-first, works on all devices
- ⚡ **Fast Performance** - Optimized with Next.js 15

### Authentication System
- 🔐 **Secure Authentication** - Email/password and OTP login
- 🏫 **UW-Madison Integration** - @wisc.edu email validation
- 🔑 **Password Recovery** - Secure reset functionality
- 👤 **User Profiles** - Automatic profile management

### User Experience
- 🎨 **Modern UI** - Clean design with shadcn/ui components
- 🌙 **Theme Support** - Light/dark mode toggle
- 📊 **Data Visualization** - Interactive charts and graphs
- 🔄 **Real-time Updates** - Live data synchronization

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Components**: [shadcn/ui](https://ui.shadcn.com/) - Reusable component library
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful & consistent icons

### Backend & Database
- **Backend**: [Supabase](https://supabase.com/) - Open source Firebase alternative
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with custom flows
- **Storage**: Supabase Storage for file uploads

### Development & Deployment
- **Package Manager**: npm/pnpm
- **Linting**: ESLint with Next.js config
- **Deployment**: Vercel (recommended) or any Node.js host
- **Analytics**: Vercel Analytics integration

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── auth/             # Authentication pages
│   ├── about/            # About page
│   └── api/              # API routes
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui base components
│   ├── navigation.tsx    # Main navigation
│   ├── footer.tsx        # Site footer
│   └── ...               # Feature-specific components
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication state
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configs
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
├── public/               # Static assets
├── docs/                 # Project documentation
├── database/             # Database schemas and migrations
└── styles/               # Additional styles
```

## 🔧 Environment Setup

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### Supabase Setup

1. Create a new Supabase project
2. Run the database setup from `database/setup.sql`
3. Configure authentication settings:
   - Site URL: `http://localhost:3000` (development)
   - Redirect URLs: `http://localhost:3000/auth`
4. Copy your project URL and anon key to `.env.local`

## 💻 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Development Workflow

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Make Changes**: Edit files in `app/`, `components/`, or `lib/`

3. **Test Authentication**: Visit `/auth` to test login/signup flows

4. **Check Console**: Monitor for any TypeScript or runtime errors

5. **Build for Production**:
   ```bash
   npm run build
   ```

## 🔐 Authentication

BadgerBase features a comprehensive authentication system with multiple security layers.

### Features
- **Email/Password Authentication**
- **One-Time Password (OTP) Login**
- **Password Reset Functionality**
- **@wisc.edu Email Validation**
- **Automatic Profile Management**

### Quick Auth Setup

1. **Configure Supabase Auth** (see [docs/AUTHENTICATION_README.md](./docs/AUTHENTICATION_README.md))
2. **Run Database Migrations** from `database/setup.sql`
3. **Test Authentication** at `/auth`

For detailed authentication setup, see our [Authentication Documentation](./docs/AUTHENTICATION_README.md).

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository

2. **Configure Environment Variables**:
   - Add your Supabase credentials
   - Set production redirect URLs in Supabase

3. **Deploy**:
   - Vercel automatically builds and deploys
   - Your app will be live at `https://your-app.vercel.app`

### Other Platforms

BadgerBase can be deployed on any platform that supports Node.js:
- **Netlify**: Use `npm run build` and deploy `out/` directory
- **Railway**: Connect GitHub repo with automatic deployments
- **DigitalOcean**: Deploy using App Platform
- **AWS/Azure/GCP**: Use container deployment or static hosting

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Follow our coding standards
4. **Test Thoroughly**: Ensure all features work
5. **Submit Pull Request**: Describe your changes clearly

### Coding Standards
- Use TypeScript for type safety
- Follow ESLint configuration
- Write descriptive commit messages
- Add comments for complex logic
- Test authentication flows thoroughly

## 📚 Documentation

### Main Documentation
- **[Authentication Guide](./docs/AUTHENTICATION_README.md)** - Complete auth setup and usage
- **[Implementation Details](./docs/IMPLEMENTATION_SUMMARY.md)** - Technical implementation notes
- **[Auth Setup](./docs/AUTHENTICATION_SETUP.md)** - Quick setup instructions

### Component Documentation
- **shadcn/ui Components**: [ui.shadcn.com](https://ui.shadcn.com/)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

### API Documentation
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Analytics**: [vercel.com/docs/analytics](https://vercel.com/docs/analytics)

## 🆘 Support & Troubleshooting

### Common Issues

**Build Errors**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Authentication Issues**:
- Check Supabase configuration
- Verify environment variables
- Review auth documentation in `docs/`

**Styling Issues**:
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS classes
- Verify component imports

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check `docs/` directory for detailed guides
- **Community**: Join discussions in GitHub Discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **UW-Madison** - For inspiration and educational data
- **Supabase** - For providing excellent backend services
- **Vercel** - For hosting and deployment platform
- **shadcn/ui** - For beautiful, accessible components
- **Next.js Team** - For the amazing React framework

---

**Built with ❤️ for the UW-Madison community**

For detailed setup instructions, visit our [Authentication Documentation](./docs/AUTHENTICATION_README.md).
