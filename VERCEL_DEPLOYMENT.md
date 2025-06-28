# 🚀 Deploy Your Fitness App to Vercel

## Prerequisites

Before deploying, make sure you have:
- ✅ A GitHub account
- ✅ Your fitness app code ready
- ✅ Supabase project set up and configured

## Method 1: Deploy via Vercel Dashboard (Recommended for Beginners)

### Step 1: Prepare Your Code

1. **Push your code to GitHub:**
   ```bash
   # If you haven't initialized git yet
   git init
   git add .
   git commit -m "Initial commit - Fitness Tracker PWA"
   
   # Create a new repository on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/fitness-tracker.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Connect to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Import your GitHub repository:**
   - Select your fitness-tracker repository
   - Click "Import"

### Step 3: Configure Build Settings

Vercel should automatically detect your React/Vite project, but verify these settings:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 4: Add Environment Variables

In the Vercel dashboard, add your environment variables:

1. **Go to your project settings**
2. **Navigate to "Environment Variables"**
3. **Add these variables:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 5: Deploy

1. **Click "Deploy"**
2. **Wait for the build to complete** (usually 1-3 minutes)
3. **Get your live URL** (e.g., `https://fitness-tracker-xyz.vercel.app`)

---

## Method 2: Deploy via Vercel CLI (For Developers)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy from Your Project Directory

```bash
# Navigate to your project directory
cd your-fitness-app

# Deploy
vercel

# Follow the prompts:
# ? Set up and deploy "~/your-fitness-app"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? fitness-tracker
# ? In which directory is your code located? ./
```

### Step 4: Add Environment Variables via CLI

```bash
# Add your Supabase URL
vercel env add VITE_SUPABASE_URL

# Add your Supabase Anon Key
vercel env add VITE_SUPABASE_ANON_KEY

# Redeploy with environment variables
vercel --prod
```

---

## Method 3: One-Click Deploy Button

Add this to your GitHub README for easy deployment:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/fitness-tracker&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY)
```

---

## 🔧 Build Configuration

Create a `vercel.json` file in your project root for advanced configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

---

## 🌐 Custom Domain (Optional)

### Step 1: Add Domain in Vercel

1. **Go to your project dashboard**
2. **Click "Settings" → "Domains"**
3. **Add your custom domain**

### Step 2: Configure DNS

Add these DNS records with your domain provider:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

---

## 🔍 Troubleshooting Common Issues

### Issue 1: Build Fails

**Error:** `Command "npm run build" exited with 1`

**Solution:**
```bash
# Check your build locally first
npm run build

# Fix any TypeScript errors
# Ensure all dependencies are in package.json
```

### Issue 2: Environment Variables Not Working

**Error:** Supabase connection fails

**Solution:**
1. Verify environment variables are set in Vercel dashboard
2. Make sure they start with `VITE_` prefix
3. Redeploy after adding variables

### Issue 3: PWA Features Not Working

**Error:** Service Worker not registering

**Solution:**
1. Ensure `sw.js` is in the `public` folder
2. Check the `vercel.json` headers configuration
3. Verify HTTPS is enabled (automatic on Vercel)

### Issue 4: Routing Issues

**Error:** 404 on page refresh

**Solution:**
Add this to `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📊 Post-Deployment Checklist

After successful deployment:

### ✅ Test Core Features
- [ ] User authentication works
- [ ] Database operations (CRUD) work
- [ ] File uploads work
- [ ] PWA features work (install prompt, offline mode)

### ✅ Performance Check
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Test on mobile devices

### ✅ PWA Validation
- [ ] Install prompt appears
- [ ] App works offline
- [ ] Service Worker registers
- [ ] Manifest is valid

### ✅ Security Check
- [ ] HTTPS is enabled
- [ ] Environment variables are secure
- [ ] No sensitive data in client code

---

## 🚀 Automatic Deployments

Vercel automatically deploys when you push to your main branch:

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically builds and deploys!
```

---

## 📱 Testing Your Deployed PWA

### On Mobile (Best Experience):
1. **Open your Vercel URL** in Chrome/Safari
2. **Look for install prompt** or "Add to Home Screen"
3. **Install the app**
4. **Test offline functionality**

### On Desktop:
1. **Open in Chrome/Edge**
2. **Look for install icon** in address bar
3. **Run Lighthouse PWA audit**
4. **Test service worker** in DevTools

---

## 🎯 Next Steps

After deployment:

1. **Share your live URL** with users
2. **Monitor performance** with Vercel Analytics
3. **Set up monitoring** for errors
4. **Configure custom domain** if needed
5. **Set up CI/CD** for automated testing

---

## 📞 Support

If you encounter issues:

1. **Check Vercel logs** in the dashboard
2. **Review build output** for errors
3. **Test locally** with `npm run build && npm run preview`
4. **Check Vercel documentation** at [vercel.com/docs](https://vercel.com/docs)

---

## 🎉 Congratulations!

Your fitness app is now live and accessible worldwide! 🌍

**Your app includes:**
- ✅ Full PWA capabilities
- ✅ Offline functionality
- ✅ Real-time database
- ✅ User authentication
- ✅ File uploads
- ✅ Responsive design
- ✅ Professional UI with shadcn/ui

Share your live URL and start tracking fitness goals! 💪