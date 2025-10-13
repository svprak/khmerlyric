# Deploy Music Sheet App to Render.com

## Cost Comparison
- **Replit:** $25/month + overages
- **Render Free Tier:** $0/month (app sleeps after 15 min inactivity)
- **Render Starter:** $7/month (always-on, 512MB RAM)

## Prerequisites
1. **Render.com account** - Sign up at https://render.com (free)
2. **GitHub account** - To store your code
3. **MongoDB database** - Keep your existing MongoDB Atlas connection

---

## Step 1: Push Code to GitHub

### Option A: Using Replit's Git (Recommended)
1. In Replit, open the Shell
2. Run these commands:
```bash
git init
git add .
git commit -m "Prepare for Render deployment"
```
3. Create a new repository on GitHub.com
4. Follow GitHub's instructions to push your code

### Option B: Download and Upload Manually
1. Download your project as ZIP from Replit
2. Create new GitHub repository
3. Upload files to GitHub

---

## Step 2: Deploy on Render

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and authorize Render
4. Select your `music-sheet-app` repository
5. Configure the service:
   - **Name:** music-sheet-app (or any name you prefer)
   - **Region:** Choose closest to your users
   - **Branch:** main (or master)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Choose your plan:
   - **Free** - App sleeps after 15 min inactivity ($0/month)
   - **Starter** - Always-on, 512MB RAM ($7/month)

---

## Step 3: Set Environment Variables

In Render dashboard, add these **Environment Variables**:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASEURL` | Your MongoDB connection string | Same as in Replit |
| `SESSION_SECRET` | A random secret key | Generate new one for security |
| `NODE_ENV` | `production` | Set manually for production optimizations |

### To Generate SESSION_SECRET:
Run in any terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 4: Deploy!

1. Click **"Create Web Service"**
2. Wait 2-5 minutes for deployment
3. Your app will be live at: `https://music-sheet-app.onrender.com`

---

## Step 5: Configure Custom Domain (Optional)

On Render free tier, you get:
- `https://your-app.onrender.com` subdomain
- Free SSL certificate

For custom domain (khmerlyric.net):
1. Go to your service → **"Settings"** → **"Custom Domain"**
2. Add your domain
3. Update DNS records at your domain registrar:
   
   **For subdomain (www.khmerlyric.net):**
   ```
   Type: CNAME
   Name: www
   Value: your-app.onrender.com
   ```
   
   **For apex domain (khmerlyric.net):**
   ```
   Type: ALIAS or ANAME (if supported)
   Name: @
   Value: your-app.onrender.com
   ```
   
   If your DNS provider doesn't support ALIAS/ANAME:
   - Use CNAME for www subdomain
   - Set up a redirect from apex to www

---

## Important Notes

### Free Tier Limitations:
- ⚠️ App sleeps after 15 minutes of inactivity
- ⚠️ First request after sleep takes 30-60 seconds to wake up
- ✅ Perfect for low-traffic sites
- ✅ Free SSL included

### Starter Plan ($7/month):
- ✅ Always-on (no sleeping)
- ✅ 512MB RAM
- ✅ Better performance
- ✅ Still 3x cheaper than Replit!

### Database:
- Keep using MongoDB Atlas free tier (512MB)
- Or switch to Render PostgreSQL ($7/month for 1GB)

---

## Troubleshooting

**App won't start:**
- Check logs in Render dashboard
- Verify DATABASEURL is correct
- Ensure MongoDB Atlas allows Render IP addresses (or use 0.0.0.0/0)

**Database connection fails:**
- MongoDB Atlas → Network Access → Add IP: `0.0.0.0/0` (allow all)
- Or add Render's specific IPs

**Port issues:**
- Render automatically sets PORT environment variable
- Your app already uses `process.env.PORT` ✅

---

## Migration Checklist

- [ ] Create GitHub account
- [ ] Push code to GitHub repository
- [ ] Sign up for Render.com
- [ ] Create new Web Service
- [ ] Add environment variables
- [ ] Deploy and test
- [ ] Update DNS (if using custom domain)
- [ ] Cancel Replit subscription (after confirming it works)

---

## Estimated Monthly Cost

**Option 1: Maximum Budget Savings**
- Render Free Tier: $0
- MongoDB Atlas Free: $0
- **Total: $0/month** (saves $25/month!)

**Option 2: Always-On Performance**
- Render Starter: $7
- MongoDB Atlas Free: $0
- **Total: $7/month** (saves $18/month!)

---

## Need Help?

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/

Good luck with your deployment! 🚀
