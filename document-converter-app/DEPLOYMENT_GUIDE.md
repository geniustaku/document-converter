# 🚀 Complete Vercel Deployment Guide

## Step 1: Login to Vercel

You're currently at the login screen. Choose your preferred method:

```bash
# The CLI is showing login options:
❯ Continue with GitHub (Recommended)
  Continue with Email
  Continue with GitLab
  Continue with Bitbucket
```

**Select your option using arrow keys and press Enter.**

## Step 2: Deploy Your App

After login, run:

```bash
npx vercel --prod
```

## Step 3: Configure Environment Variables

When prompted, set up these environment variables:

**Required Environment Variable:**
```
LIBREOFFICE_SERVICE_URL = http://libreoffice-v2-1750071134.eastus.azurecontainer.io:3000
```

## Step 4: Deployment Process

Vercel will ask you these questions:

1. **"Set up and deploy?"** → `Y` (Yes)
2. **"Which scope?"** → Choose your account
3. **"Link to existing project?"** → `N` (No, create new)
4. **"What's your project's name?"** → `document-converter-pro` (or your choice)
5. **"In which directory is your code located?"** → `./` (current directory)

## Step 5: Configure Production Settings

After initial deployment, go to your Vercel dashboard:

1. **Visit**: https://vercel.com/dashboard
2. **Find your project**: `document-converter-pro`
3. **Go to Settings** → **Environment Variables**
4. **Add this variable:**
   - **Name**: `LIBREOFFICE_SERVICE_URL`
   - **Value**: `http://libreoffice-v2-1750071134.eastus.azurecontainer.io:3000`
   - **Environment**: Production

## Step 6: Redeploy with Environment Variables

```bash
npx vercel --prod
```

## Step 7: Configure Custom Domain (Optional)

In Vercel dashboard:
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed

## Step 8: Google AdSense Setup

1. **Replace Placeholder**: In your deployed app, replace `ca-pub-XXXXXXXXX` with your actual AdSense publisher ID
2. **Update AdSense Code**: In `src/pages/_document.tsx` and `src/components/AdSenseAd.tsx`
3. **Apply for AdSense**: Submit your deployed site to Google AdSense
4. **Add Ad Units**: Create specific ad units and replace placeholder slot IDs

## 🎯 Expected Result

Your app will be deployed at:
```
https://document-converter-pro.vercel.app
```

Or with your custom domain:
```
https://yourdomain.com
```

## 📋 Post-Deployment Checklist

- [ ] App loads correctly
- [ ] All conversion pages work
- [ ] PDF to Word conversion functions
- [ ] Word to PDF conversion functions  
- [ ] Image conversion works
- [ ] Privacy and Terms pages load
- [ ] SEO meta tags are correct
- [ ] AdSense placeholders are ready

## 🔧 Troubleshooting

### If deployment fails:
```bash
# Clear Vercel cache
npx vercel --prod --force

# Check logs
npx vercel logs
```

### If environment variables don't work:
1. Double-check the variable name in Vercel dashboard
2. Ensure the LibreOffice service URL is accessible
3. Redeploy after adding variables

## 💰 Revenue Optimization

After deployment:
1. **Apply for Google AdSense** with your live site
2. **Submit to Google Search Console** for SEO
3. **Monitor performance** with analytics
4. **A/B test ad placements** for maximum revenue

## 🚀 You're Ready!

Once deployed, your Document Converter Pro will be live and ready to compete with iLovePDF and Adobe Acrobat! 

**Start earning ad revenue immediately!** 💰