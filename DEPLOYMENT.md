# 🚀 Deployment Guide: Vercel + Render

This guide walks you through deploying your **Dreamscape Tea Lounge** application using **Vercel** (frontend) and **Render** (backend) - both on free tiers!

## 📋 Prerequisites

- [x] GitHub repository with your code
- [x] Vercel account (free)
- [x] Render account (free)
- [x] Spotify Developer account

## 🎯 Quick Deployment Steps

### 1️⃣ **Deploy Backend to Render**

1. **Create Render Account**: Go to [render.com](https://render.com) and sign up
2. **Connect GitHub**: Link your repository
3. **Create Web Service**:

   - Click "New +" → "Web Service"
   - Connect your repository
   - **Root Directory**: `tea-lounge-backend`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
   - **Node Version**: 18 or higher (auto-detected from package.json)

4. **Set Environment Variables** in Render Dashboard:

   ```env
   NODE_ENV=production
   PORT=4000
   SPOTIFY_CLIENT_ID=aac3b66236a04e61a09a888767949d40
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here
   FRONTEND_URL=https://dreamscape-kitkut-whispers.vercel.app
   ```

5. **Note your backend URL**: Will be like `https://dreamscape-tea-lounge-backend.onrender.com`

### 2️⃣ **Deploy Frontend to Vercel**

1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up
2. **Import Project**: Click "New Project" and import from GitHub
3. **Configure Settings**:

   - **Framework Preset**: Vite
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm ci` (recommended for faster builds)
   - **Node.js Version**: 18.x or higher

4. **Set Environment Variables** in Vercel Dashboard:

   ```env
   VITE_SPOTIFY_CLIENT_ID=aac3b66236a04e61a09a888767949d40
   VITE_SPOTIFY_REDIRECT_URI=https://your-vercel-url.vercel.app/callback
   VITE_BACKEND_URL=https://your-render-backend-url.onrender.com
   ```

5. **Deploy**: Click "Deploy" - Vercel will automatically use the optimized settings from `vercel.json`

### 3️⃣ **Update Spotify Developer Dashboard**

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Open your app settings
3. **Add Redirect URIs**:
   - `https://your-vercel-url.vercel.app/callback`
   - Keep your localhost URI for development: `https://localhost:3000/callback`

### 4️⃣ **Update Environment Variables**

After deployment, update your `.env.production` file with actual URLs:

```env
# Frontend URLs (use in Vercel)
VITE_SPOTIFY_REDIRECT_URI=https://dreamscape-kitkut-whispers.vercel.app/callback
VITE_BACKEND_URL=https://dreamscape-tea-lounge-backend.onrender.com

# Backend URLs (use in Render)
FRONTEND_URL=https://dreamscape-kitkut-whispers.vercel.app
```

## ✅ Testing Your Deployment

1. **Backend Health Check**: Visit `https://your-backend.onrender.com/api/health`
2. **Frontend**: Visit your Vercel URL
3. **Spotify Auth**: Click "Connect with Spotify" - should work without localhost issues!

## 🔧 Troubleshooting

### ❌ CORS Errors

- Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check Render logs for blocked origins

### ❌ Spotify Auth Fails

- Verify redirect URI in Spotify Dashboard matches exactly
- Check environment variables in both Vercel and Render

### ❌ Backend Not Responding

- Render free tier sleeps after 15 minutes - first request may be slow
- Check Render logs for startup errors

## 💰 Free Tier Limitations

**Vercel Free Tier:**

- ✅ 100GB bandwidth/month
- ✅ Unlimited public repositories
- ✅ Custom domains

**Render Free Tier:**

- ✅ 750 hours/month (enough for personal use)
- ⚠️ Sleeps after 15 min inactivity
- ✅ 512MB RAM

## 🚀 Production URLs

Once deployed, update these placeholders:

- **Frontend**: `https://dreamscape-kitkut-whispers.vercel.app`
- **Backend**: `https://dreamscape-tea-lounge-backend.onrender.com`
- **Spotify Redirect**: `https://dreamscape-kitkut-whispers.vercel.app/callback`

---

**🎉 That's it!** Your app is now live and the Spotify OAuth will work perfectly with real HTTPS URLs!
