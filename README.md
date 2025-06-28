# 🏋️ Fitness Buddy - PWA

A comprehensive Progressive Web App for tracking workouts, setting goals, scheduling activities, and monitoring fitness progress.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/fitness-buddy&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY)

## ✨ Features

- 🏋️ **Workout Management** - Create and track muscle-specific workouts
- 🎯 **Goal Setting** - Set and monitor fitness goals with progress tracking
- 📅 **Schedule Management** - Plan and schedule fitness activities
- 📊 **Progress Analytics** - Visual charts and performance metrics
- 👤 **User Profiles** - Comprehensive profile management with photo uploads
- 📱 **PWA Support** - Install as app, works offline, push notifications
- 🔐 **Secure Authentication** - Email/password auth with Supabase
- 📱 **Responsive Design** - Works perfectly on all devices

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI Library:** shadcn/ui (Radix UI + Tailwind CSS)
- **State Management:** Redux Toolkit + React Context
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Styling:** Tailwind CSS
- **PWA:** Service Worker, Web App Manifest
- **Deployment:** Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/fitness-buddy.git
cd fitness-buddy
npm install
```

### 2. Environment Setup

Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the migration scripts in `supabase/migrations/` in your Supabase SQL editor
3. Enable Row Level Security (RLS) policies

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## 📦 Deployment to Vercel

### Option 1: One-Click Deploy

Click the "Deploy with Vercel" button above and add your environment variables.

### Option 2: Manual Deploy

1. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

### Option 3: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

## 🗄️ Database Schema

The app uses PostgreSQL with these main tables:

- **profiles** - User profile information
- **workouts** - Workout sessions
- **exercises** - Individual exercises within workouts
- **goals** - User fitness goals
- **schedule_items** - Scheduled activities
- **progress_metrics** - Progress tracking data

## 📱 PWA Features

- **Installable** - Add to home screen on mobile/desktop
- **Offline Support** - Works without internet connection
- **Push Notifications** - Workout reminders and updates
- **Background Sync** - Sync data when back online
- **App-like Experience** - Full-screen, native feel

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/) for:

- **Professional Design** - Consistent, modern interface
- **Accessibility** - WCAG compliant components
- **Customizable** - Easy to modify with Tailwind CSS
- **Type Safe** - Full TypeScript support

## 🔐 Security

- **Row Level Security (RLS)** - Database-level security
- **JWT Authentication** - Secure session management
- **Environment Variables** - Sensitive data protection
- **HTTPS Only** - Secure data transmission

## 📊 Performance

- **Lighthouse Score:** 95+ PWA score
- **Core Web Vitals:** Optimized for speed
- **Code Splitting:** Lazy loading for faster initial load
- **Caching Strategy:** Efficient service worker caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation:** Check the `/docs` folder
- **Issues:** Create a GitHub issue
- **Discussions:** Use GitHub Discussions

## 🎯 Roadmap

- [ ] Social features
- [ ] Wearable device integration
- [ ] AI-powered workout recommendations
- [ ] Advanced analytics

---

**Built with ❤️ using React, TypeScript, and shadcn/ui**
