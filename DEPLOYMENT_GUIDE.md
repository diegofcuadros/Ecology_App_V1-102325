# Production Deployment Guide

This guide walks you through deploying your Landscape Ecology Socratic Tutor to production using Railway (backend) and Vercel (frontend).

## Prerequisites

- GitHub account (your code is already pushed)
- Railway account (sign up at https://railway.app)
- Vercel account (sign up at https://vercel.com)
- Your Gemini API key

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to https://railway.app and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Select your repository: `diegofcuadros/Ecology_App_V1-102325`
5. Railway will detect the monorepo structure

### Step 2: Configure Backend Service

1. Railway should auto-detect the backend. If not:
   - Click **"Add Service"** → **"GitHub Repo"**
   - Set **Root Directory** to `/backend`

2. Add **PostgreSQL Database**:
   - In your project, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
   - Railway will automatically create a `DATABASE_URL` environment variable

### Step 3: Set Environment Variables

In your Railway backend service, go to **Variables** and add:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-random
GEMINI_API_KEY=your-gemini-api-key-here
FRONTEND_URL=https://your-app.vercel.app
```

**Important Notes:**
- `DATABASE_URL` is automatically provided by Railway PostgreSQL
- Generate a secure JWT_SECRET: `openssl rand -base64 32`
- Update `FRONTEND_URL` after deploying frontend (Step 4)

### Step 4: Deploy Backend

1. Railway will automatically deploy after adding variables
2. Wait for deployment to complete (3-5 minutes)
3. Check the **Deployments** tab for logs
4. Once deployed, click **"Settings"** → **"Networking"** → **"Generate Domain"**
5. **Copy your backend URL** (e.g., `ecology-tutor-backend.railway.app`)

### Step 5: Verify Backend Health

Open your backend URL in browser: `https://your-backend.railway.app/health`

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-23T..."
}
```

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your repository: `diegofcuadros/Ecology_App_V1-102325`
4. Vercel will detect it's a Vite project

### Step 2: Configure Build Settings

**Important:** Set the **Root Directory** to `/` (not `/frontend`)

Build settings (should auto-detect):
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Set Environment Variables

In Vercel project settings → **Environment Variables**, add:

```
VITE_API_URL=https://your-backend.railway.app/api
```

**Replace** `your-backend.railway.app` with your actual Railway backend URL from Part 1, Step 4.

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Vercel will build and deploy (2-3 minutes)
3. Once deployed, you'll get a URL like `https://your-app.vercel.app`
4. **Copy this URL**

### Step 5: Update Backend CORS Settings

Go back to **Railway** → Your backend service → **Variables**:

Update the `FRONTEND_URL` variable with your Vercel URL:
```
FRONTEND_URL=https://your-app.vercel.app
```

Railway will automatically redeploy the backend with updated CORS settings.

## Part 3: Initialize Database

### Option A: Using Railway CLI (Recommended)

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and link to your project:
   ```bash
   railway login
   railway link
   ```

3. Run database seed:
   ```bash
   railway run npm run prisma:seed --service backend
   ```

### Option B: Using Prisma Studio

1. In Railway, go to PostgreSQL service → **Variables**
2. Copy the `DATABASE_URL`
3. On your local machine:
   ```bash
   cd backend
   DATABASE_URL="your-railway-database-url" npx prisma db seed
   ```

This creates demo accounts:
- **Student**: `student@test.com` / `password123`
- **Professor**: `prof@test.com` / `password123`

## Part 4: Test Your Deployment

### 1. Visit Your App

Go to your Vercel URL: `https://your-app.vercel.app`

### 2. Test Registration

- Click **"Create an account"**
- Register as a student or professor
- Verify you can log in

### 3. Test Demo Accounts

- Login with `student@test.com` / `password123`
- Login with `prof@test.com` / `password123`

### 4. Test Full Flow

**As Professor:**
1. Login to professor account
2. Create a new assignment
3. Upload an article or use existing one

**As Student:**
1. Login to student account
2. View available assignments
3. Start an assignment
4. Chat with AI tutor
5. Verify messages are saved

**As Professor:**
1. View assignment details
2. Check student's chat transcript
3. Submit a grade

## Part 5: Custom Domain (Optional)

### For Frontend (Vercel)

1. Go to your Vercel project → **Settings** → **Domains**
2. Add your custom domain (e.g., `ecotutor.yourdomain.com`)
3. Update DNS records as instructed by Vercel
4. Vercel automatically provisions SSL certificate

### For Backend (Railway)

1. Go to backend service → **Settings** → **Networking**
2. Add custom domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed by Railway
4. Update `VITE_API_URL` in Vercel to use new domain

## Monitoring & Maintenance

### View Logs

**Railway Backend:**
- Go to your service → **Deployments** → Click on deployment → View logs

**Vercel Frontend:**
- Go to your project → **Deployments** → Click on deployment → View logs

### Monitor Database

**Railway PostgreSQL:**
- Click on PostgreSQL service
- View **Metrics** for connections, CPU, memory usage
- Use **Prisma Studio** for data management:
  ```bash
  DATABASE_URL="your-railway-url" npx prisma studio
  ```

### Automatic Deployments

Both Railway and Vercel are connected to your GitHub repo:
- Push to your branch → Automatic deployment
- Check deployment status in each platform

## Troubleshooting

### Backend Issues

**500 Error or crashes:**
1. Check Railway logs for error messages
2. Verify `DATABASE_URL` is set correctly
3. Ensure migrations ran: `railway run npm run prisma:migrate`

**CORS errors:**
1. Verify `FRONTEND_URL` matches your Vercel URL exactly
2. No trailing slash in URLs
3. Redeploy backend after updating

### Frontend Issues

**API connection errors:**
1. Check browser console for error messages
2. Verify `VITE_API_URL` points to correct Railway backend
3. Ensure backend is healthy: visit `/health` endpoint

**Build failures:**
1. Check Vercel build logs
2. Verify all dependencies in `package.json`
3. Try building locally: `npm run build`

### Database Issues

**Migration errors:**
1. Check Railway logs during deployment
2. Manually run migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```

**Connection errors:**
1. Verify PostgreSQL service is running in Railway
2. Check `DATABASE_URL` format is correct
3. Ensure IP restrictions allow Railway backend

## Security Checklist

- ✅ API keys stored in environment variables (not in code)
- ✅ CORS configured with specific frontend URL
- ✅ JWT secrets are strong and unique
- ✅ HTTPS enabled on both frontend and backend
- ✅ Database passwords are strong (Railway auto-generates)
- ✅ No sensitive data in git repository
- ✅ Rate limiting implemented in backend (optional but recommended)

## Cost Estimates (Free Tier)

**Railway Free Tier:**
- $5 credit per month
- Includes PostgreSQL database
- Enough for development/testing

**Vercel Free Tier:**
- 100GB bandwidth per month
- Unlimited deployments
- Custom domains included

**Gemini API:**
- Pay-per-use pricing
- Monitor usage at https://ai.google.dev/pricing

## Support

If you encounter issues:
1. Check deployment logs in Railway/Vercel
2. Review this guide's troubleshooting section
3. Verify all environment variables are set correctly
4. Test backend `/health` endpoint
5. Check browser console for frontend errors

## Next Steps

After successful deployment:
1. Create professor accounts for instructors
2. Import course articles
3. Create assignments for students
4. Monitor student progress
5. Consider adding:
   - Email notifications
   - More detailed analytics
   - Additional learning stages
   - Assignment templates

---

**Deployment Complete!** 🎉

Your Landscape Ecology Socratic Tutor is now live in production.
