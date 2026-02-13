# Conversation Tracker Deployment Guide

## Step-by-Step Deployment to Render

### 1. Get Resend API Key

1. Go to https://resend.com
2. Sign up with your email
3. Click "API Keys" in sidebar
4. Click "Create API Key"
5. Name it: "AI Discovery Widget"
6. Copy the key (starts with `re_`)

**Important:** For production emails, you need to verify your domain:
- Go to "Domains" → "Add Domain"
- Add `aisync101.com` (or your domain)
- Add the DNS records they provide
- Wait for verification (usually 5-10 minutes)

For testing, you can use their onboarding domain: `onboarding.resend.dev`

---

### 2. Deploy to Render

1. Go to https://render.com
2. Sign up / Log in
3. Click "New +" → "Web Service"
4. Choose "Build and deploy from a Git repository"
5. Connect your GitHub account if not connected
6. Select your repository: `ai-sync-101-website`

#### Configuration:

- **Name**: `conversation-tracker`
- **Region**: Choose closest to you (US East recommended)
- **Branch**: `main`
- **Root Directory**: `conversation-tracker`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free` (sufficient for this use case)

#### Environment Variables:

Click "Advanced" → "Add Environment Variable"

Add these two variables:

| Key | Value |
|-----|-------|
| `RESEND_API_KEY` | `re_your_key_from_resend` |
| `TEAM_EMAIL` | `carlos@computech.support` |

7. Click "Create Web Service"

Wait 3-5 minutes for deployment to complete.

---

### 3. Get Your Service URL

After deployment completes, Render will show your service URL:

Example: `https://conversation-tracker-abc123.onrender.com`

**Copy this URL** - you'll need it in the next step.

---

### 4. Update Widget Configuration

Open: `/ai-discovery-widget/widget-script.js`

Find line ~11:
```javascript
trackerEndpoint: 'https://conversation-tracker-xxxx.onrender.com/api/conversation-complete',
```

Replace with your actual Render URL:
```javascript
trackerEndpoint: 'https://conversation-tracker-abc123.onrender.com/api/conversation-complete',
```

Commit and deploy:
```bash
git add ai-discovery-widget/widget-script.js
git commit -m "Update tracker endpoint with Render URL"
git push
```

Vercel will automatically redeploy the widget with the new endpoint.

---

### 5. Test the Integration

#### Test 1: Health Check

```bash
curl https://your-render-url.onrender.com/health
```

Should return:
```json
{"status":"healthy","service":"conversation-tracker"}
```

#### Test 2: Send Test Conversation

```bash
curl -X POST https://your-render-url.onrender.com/api/conversation-complete \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I need help with billing delays"},
      {"role": "assistant", "content": "What is causing the delay?"},
      {"role": "user", "content": "My name is Carlos from LAComputech"},
      {"role": "assistant", "content": "Thanks Carlos! What is your website?"},
      {"role": "user", "content": "computech.support"},
      {"role": "assistant", "content": "How are timesheets submitted?"},
      {"role": "user", "content": "They email them"},
      {"role": "assistant", "content": "What happens after you receive them?"},
      {"role": "user", "content": "We manually enter into QuickBooks"},
      {"role": "assistant", "content": "Seeing gaps: 1. Delayed timesheets 2. Manual entry. Which is worse?"},
      {"role": "user", "content": "Number 1"},
      {"role": "assistant", "content": "What is this costing you in delayed cash flow?"},
      {"role": "user", "content": "A few thousand per month. My email is carlos@computech.support"},
      {"role": "assistant", "content": "Want to schedule a call?"},
      {"role": "user", "content": "Yes"},
      {"role": "assistant", "content": "What is the best number to reach you?"},
      {"role": "user", "content": "225-892-2135"}
    ],
    "metadata": {
      "source": "test",
      "conversationId": "test-123"
    }
  }'
```

Check your email (carlos@computech.support) - you should receive a beautifully formatted summary email with:
- Contact: Carlos from LAComputech
- Email: carlos@computech.support
- Phone: 225-892-2135
- Website: computech.support
- Main problem: Delayed timesheets
- Engagement: HIGH
- Full transcript

---

### 6. Live Widget Test

1. Go to your website: https://aisync101.com
2. Open the widget
3. Have a conversation (at least 10 messages)
4. Either:
   - Say "thanks" or "goodbye" (explicit end)
   - Wait 10 minutes (idle timeout)
5. Check your email for the summary

---

## Monitoring & Logs

### View Render Logs:

1. Go to Render Dashboard
2. Click on "conversation-tracker" service
3. Click "Logs" tab
4. See real-time logs of conversations being processed

### Check Email Delivery:

1. Go to Resend Dashboard
2. Click "Logs" in sidebar
3. See all sent emails with delivery status

---

## Troubleshooting

### Email not received?

1. Check Render logs for errors
2. Check Resend logs - did it send?
3. Check spam folder
4. Verify `TEAM_EMAIL` environment variable is correct
5. If using custom domain, verify DNS records in Resend

### Service returning 500 error?

1. Check Render logs
2. Verify `RESEND_API_KEY` is set correctly
3. Test health endpoint first
4. Check that messages array has at least 10 messages

### Widget not sending conversation?

1. Open browser console (F12)
2. Look for "Sending conversation summary" log
3. Check network tab for POST to tracker endpoint
4. Verify tracker URL in widget-script.js is correct
5. Make sure conversation has 10+ messages

---

## Cost & Limits

**Render Free Tier:**
- 750 hours/month (enough for 24/7)
- Spins down after 15 min idle
- First request after idle takes ~30 seconds (cold start)

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day
- More than enough for this use case

Both are completely free for your volume.

---

## Next Steps

After deployment:

1. ✅ Test with a real conversation
2. ✅ Verify email formatting looks good
3. ✅ Monitor first few conversations in Render logs
4. Consider: Add database to store conversations (optional)
5. Consider: Add Slack integration for instant notifications (optional)

---

## Support

If you need help:
- Render Docs: https://render.com/docs
- Resend Docs: https://resend.com/docs
- Check Render logs for detailed error messages
