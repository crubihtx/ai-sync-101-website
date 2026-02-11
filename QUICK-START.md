# ⚡ QUICK START - Get Your AI Widget Live in 15 Minutes

## 🎯 What You're Deploying

Your **AI Discovery Widget** that replicates Carlos's discovery meeting style to convert website visitors into qualified leads.

**Monthly Cost: ~$3-7** (just OpenAI API usage, everything else is FREE!)

---

## 📋 Step-by-Step Deployment

### **Step 1: Deploy to Vercel** (5 minutes)

1. **Go to Vercel**: https://vercel.com/dashboard

2. **Click "Add New..." → "Project"**

3. **Import your GitHub repository**:
   - Search for: `ai-sync-101-website`
   - Click "Import"

4. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (default)
   - Leave build settings empty (we only need API functions)

5. **Add Environment Variable**:
   - Click **"Environment Variables"**
   - Name: `OPENAI_API_KEY`
   - Value: `YOUR_OPENAI_API_KEY_HERE`
   - Select: **Production, Preview, Development**
   - Click "Add"

6. **Click "Deploy"**

7. **Wait for deployment** (~2 minutes)

8. **Copy your Vercel URL** (e.g., `https://ai-sync-101-website.vercel.app`)

---

### **Step 2: Update Widget Configuration** (3 minutes)

1. **Open Terminal** and navigate to your project:
   ```bash
   cd "/Users/crubi/Desktop/AI Sync 101 Website/ai-sync-101-website"
   ```

2. **Run the update script** (replace with YOUR Vercel URL):
   ```bash
   ./update-api-endpoints.sh https://ai-sync-101-website.vercel.app
   ```

   This automatically updates the widget to use your Vercel API.

3. **Verify changes**:
   ```bash
   git diff ai-discovery-widget/widget-script.js
   ```

   You should see the endpoints changed to your Vercel URL.

---

### **Step 3: Deploy to Your Website** (5 minutes)

1. **Stage the new files**:
   ```bash
   git add api/
   git add vercel.json
   git add ai-discovery-widget/widget-script.js
   git add VERCEL-DEPLOYMENT.md
   git add QUICK-START.md
   git add update-api-endpoints.sh
   ```

2. **Commit**:
   ```bash
   git commit -m "Add AI Discovery Widget with Vercel Edge Functions

   - Create Vercel Edge Functions for OpenAI integration
   - Update widget to use Vercel API endpoints
   - Add deployment documentation

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

3. **Push to GitHub**:
   ```bash
   git push
   ```

   This will:
   - ✅ Auto-deploy API updates to Vercel
   - ✅ Auto-deploy widget updates to Azure Static Web Apps

---

### **Step 4: Test Your Widget** (2 minutes)

1. **Go to your website**: https://www.aisync101.com

2. **Look for the floating chat button** in the bottom-right corner

3. **Click to open** and send a test message like:
   > "We're struggling with manual data entry"

4. **You should get a real AI response!** 🎉

---

## ✅ Success Checklist

After completing the steps above, verify:

- [ ] Vercel project deployed successfully
- [ ] OPENAI_API_KEY environment variable is set in Vercel
- [ ] Widget script updated with Vercel URL
- [ ] Changes committed and pushed to GitHub
- [ ] Widget appears on website
- [ ] Test conversation works with real AI responses
- [ ] You receive email summary at info@aisync101.com

---

## 🆘 Troubleshooting

### **Widget doesn't appear on website**
```bash
# Check if widget-embed.js is included in your index.html
grep "widget-embed.js" index.html
```

### **AI not responding**
1. Check browser console (F12) for errors
2. Verify Vercel URL in widget-script.js is correct
3. Check Vercel deployment logs: https://vercel.com/dashboard
4. Test API directly:
   ```bash
   curl -X POST https://YOUR-VERCEL-URL.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"test"}]}'
   ```

### **Email summaries not working**
- Check Formspree endpoint in `/api/send-summary.js`
- Verify email address is correct
- Check Vercel function logs

---

## 📊 What Happens Next?

### **Immediate Results**
- Widget appears on your website
- Visitors can start conversations immediately
- AI replicates Carlos's discovery style
- Leads are captured naturally
- Email summaries sent to info@aisync101.com

### **Week 1**
- Monitor first 10-20 conversations
- Review email summaries
- Note common pain points
- Check for any technical issues

### **Month 1**
- Track lead capture rate
- Measure conversation quality
- Optimize system prompt if needed
- A/B test different approaches

---

## 💰 Monthly Costs

| Service | Cost |
|---------|------|
| **Vercel Edge Functions** | FREE (up to 100k requests) |
| **OpenAI API** | ~$3-7 (for 180 conversations) |
| **Azure Static Web Apps** | Already included |
| **Total** | **~$3-7/month** 🎉 |

**ROI**: If 1 conversation converts to 1 client = 🚀🚀🚀

---

## 🎉 You're Done!

Your AI Discovery Widget is now:
- ✅ Live on your website
- ✅ Using real OpenAI AI
- ✅ Costing ~$3-7/month
- ✅ Converting visitors to leads
- ✅ Replicating Carlos's discovery style

**Time to watch the leads roll in!** 🎣💰

---

## 📚 More Documentation

- **VERCEL-DEPLOYMENT.md** - Detailed deployment guide
- **ai-discovery-widget/README.md** - Full technical documentation
- **ai-discovery-widget/PROJECT-SUMMARY.md** - Complete project overview
- **ai-discovery-widget/system-prompt.md** - AI personality documentation

---

## 🔥 Next Level (Optional)

Want to take it further?

- **Add calendar integration** - Book discovery calls directly
- **Connect to CRM** - Auto-create leads in HubSpot/Salesforce
- **Slack notifications** - Get pinged for hot leads
- **A/B testing** - Test different conversation approaches
- **Analytics dashboard** - Track conversion metrics

Let's get this first version live, then we can level up! 🚀
