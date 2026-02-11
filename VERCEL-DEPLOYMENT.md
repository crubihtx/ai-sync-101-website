# 🚀 VERCEL DEPLOYMENT GUIDE - AI DISCOVERY WIDGET

## ✅ WHAT'S ALREADY DONE

- ✅ Widget UI created (`ai-discovery-widget/`)
- ✅ Vercel Edge Functions created (`/api/chat.js`, `/api/send-summary.js`)
- ✅ Widget configured to use `/api/chat` endpoint
- ✅ `vercel.json` configuration created
- ✅ OpenAI API key available

---

## 📋 DEPLOYMENT STEPS

### **Step 1: Set Up Vercel Environment Variable**

Since your GitHub is already connected to Azure Static Web Apps, we'll deploy the API functions to Vercel while keeping the static site on Azure.

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `ai-sync-101-website`
4. Configure the project:
   - **Framework Preset**: Other (or Next.js)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: Leave empty (we only need the API functions)
   - **Output Directory**: Leave empty

5. **Add Environment Variable**:
   - Click **"Environment Variables"**
   - Add:
     ```
     Name: OPENAI_API_KEY
     Value: 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
     ```
   - Select: **Production, Preview, Development**
   - Click **"Add"**

6. Click **"Deploy"**

---

### **Step 2: Get Your Vercel API URL**

After deployment completes:

1. Vercel will show your deployment URL (e.g., `https://ai-sync-101-website.vercel.app`)
2. Your API endpoints will be:
   - Chat: `https://ai-sync-101-website.vercel.app/api/chat`
   - Summary: `https://ai-sync-101-website.vercel.app/api/send-summary`

3. **Copy this URL** - you'll need it for the next step

---

### **Step 3: Update Widget to Use Vercel API**

Since your **main website** is on Azure Static Web Apps, we need to update the widget to point to your Vercel API:

**Edit:** `/ai-discovery-widget/widget-script.js`

**Find line 8:**
```javascript
apiEndpoint: '/api/chat', // Azure Function endpoint
```

**Replace with:**
```javascript
apiEndpoint: 'https://YOUR-VERCEL-URL.vercel.app/api/chat', // Vercel Edge Function
```

**And update the summary endpoint around line 320:**
```javascript
// Find this line:
const summaryResponse = await fetch('/api/send-summary', {

// Replace with:
const summaryResponse = await fetch('https://YOUR-VERCEL-URL.vercel.app/api/send-summary', {
```

---

### **Step 4: Commit and Push to GitHub**

```bash
cd "/Users/crubi/Desktop/AI Sync 101 Website/ai-sync-101-website"

# Check what will be committed
git status

# Add files
git add api/chat.js
git add api/send-summary.js
git add vercel.json
git add ai-discovery-widget/widget-script.js
git add VERCEL-DEPLOYMENT.md

# Commit
git commit -m "Add Vercel Edge Functions for AI Discovery Widget

- Create /api/chat.js for OpenAI integration
- Create /api/send-summary.js for email summaries
- Add vercel.json configuration
- Update widget to use Vercel API endpoints

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to GitHub
git push
```

This will:
- ✅ Deploy API functions to Vercel (auto-deploys on push)
- ✅ Deploy updated widget to Azure Static Web Apps (your existing setup)

---

### **Step 5: Test the Widget**

1. Go to your website: `https://www.aisync101.com`
2. The widget should appear in the bottom-right corner
3. Click to open and send a test message
4. You should get a real AI response from OpenAI!

**If it doesn't work:**
- Open browser console (F12) and check for errors
- Verify the API URL in widget-script.js is correct
- Check Vercel deployment logs for errors

---

## 💰 COST BREAKDOWN (Monthly)

### **Vercel Edge Functions** (FREE Tier)
- ✅ **100,000 requests/month** - FREE
- ✅ **100 GB-hours** - FREE
- Only pay if you exceed (you won't)

### **OpenAI API** (Pay-as-you-go)
- Model: GPT-4 Turbo
- ~1500 tokens per conversation
- Cost per conversation: ~$0.02-0.04
- **Estimated: $3.60-7.20/month** (for 180 conversations)

### **Azure Static Web Apps** (Your existing hosting)
- You already have this set up
- No additional cost

### **Total Monthly Cost: ~$3.60-7.20** 🎉

**This is WAY cheaper than Azure Functions!**

---

## 🔧 ALTERNATIVE: Simpler Single-Deploy Option

If you want **everything on Vercel** (instead of split between Vercel API + Azure Static Web):

1. In Vercel project settings, change **Output Directory** to: `./`
2. Vercel will host both your static site AND API functions
3. Change `apiEndpoint` back to: `'/api/chat'` (relative path)
4. Your site will be at: `https://ai-sync-101-website.vercel.app`
5. Point your domain `aisync101.com` to Vercel instead of Azure

**Benefits:**
- Simpler setup (one platform)
- Still FREE for API functions
- Better performance (everything on same CDN)

**Trade-off:**
- Need to migrate away from Azure Static Web Apps

---

## 🆘 TROUBLESHOOTING

### **Widget doesn't appear**
- Check browser console for errors
- Verify files deployed to Azure Static Web Apps
- Check that widget-embed.js is loaded in index.html

### **AI not responding**
- Check Vercel deployment logs
- Verify OPENAI_API_KEY environment variable is set
- Check API endpoint URL in widget-script.js
- Test API directly: `curl https://YOUR-VERCEL-URL.vercel.app/api/chat`

### **CORS errors**
- Verify vercel.json has CORS headers
- Check that Vercel deployment picked up vercel.json

### **Emails not sending**
- Check Formspree endpoint is correct
- Verify email address in send-summary.js
- Check Vercel function logs for errors

---

## ✅ SUCCESS CHECKLIST

- [ ] Vercel project created
- [ ] OPENAI_API_KEY environment variable added
- [ ] Vercel deployment successful
- [ ] Widget script updated with Vercel API URL
- [ ] Changes committed and pushed to GitHub
- [ ] Widget appears on website
- [ ] Test conversation works
- [ ] Email summary received

---

## 🎉 YOU'RE DONE!

Your AI Discovery Widget is now live with:
- ✅ Real OpenAI responses
- ✅ FREE API hosting (Vercel Edge Functions)
- ✅ Super affordable ($3-7/month for OpenAI only)
- ✅ iMessage-style UI
- ✅ Lead capture
- ✅ Email summaries

**Time to convert some leads!** 🚀
