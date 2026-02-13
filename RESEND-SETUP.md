# Resend Setup for Email Summaries

## Quick Setup (3 minutes)

### 1. Get Resend API Key

1. Go to https://resend.com and sign up
2. Click "API Keys" in sidebar
3. Click "Create API Key"
4. Name it: "AI Discovery Widget"
5. Copy the key (starts with `re_`)

### 2. Add to Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project: `ai-sync-101-website`
3. Go to "Settings" → "Environment Variables"
4. Add two variables:

| Variable | Value | Example |
|----------|-------|---------|
| `RESEND_API_KEY` | Your Resend API key | `re_abc123xyz...` |
| `TEAM_EMAIL` | Your email for summaries | `carlos@computech.support` |

5. Click "Save"
6. Redeploy: Go to "Deployments" → Click "..." on latest → "Redeploy"

### 3. Verify Your Domain in Resend (Optional but Recommended)

**For testing:** Skip this - use their test domain `onboarding.resend.dev`

**For production:**
1. Go to Resend Dashboard → "Domains"
2. Click "Add Domain"
3. Enter: `aisync101.com`
4. Add the DNS records they provide to your domain registrar
5. Wait 5-10 minutes for verification

After verification, emails will come from `widget@aisync101.com` instead of test domain.

---

## Test It

### Method 1: Via Widget (Real Test)
1. Go to your website
2. Open the widget
3. Have a conversation (10+ messages)
4. Say "thanks" or wait 10 minutes
5. Check your email

### Method 2: Via API (Quick Test)

```bash
curl -X POST https://ai-sync-101-website.vercel.app/api/conversation-complete \
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
      {"role": "assistant", "content": "What happens after?"},
      {"role": "user", "content": "We manually enter into QuickBooks"},
      {"role": "assistant", "content": "I am seeing: 1. Delayed timesheets 2. Manual entry. Which is worse?"},
      {"role": "user", "content": "Number 1"},
      {"role": "assistant", "content": "What is this costing you?"},
      {"role": "user", "content": "A few thousand per month. My email is carlos@computech.support"},
      {"role": "assistant", "content": "Want to schedule a call?"},
      {"role": "user", "content": "Yes"},
      {"role": "assistant", "content": "What is the best number?"},
      {"role": "user", "content": "225-892-2135"}
    ]
  }'
```

Check your email - you should receive a summary.

---

## What You'll Receive

**Email Subject:** Discovery: Carlos from LAComputech

**Email Body:**
- 📋 Contact info (name, email, phone, company, website)
- 🎯 Engagement level (HIGH/MEDIUM/LOW badge)
- 🔥 Main problem they prioritized
- 🔍 All identified problems
- ⚙️ Current workflow (as mapped)
- 💡 Proposed solution
- 📊 Quantified impact ($, time, etc.)
- 💬 Full conversation transcript

---

## How It Works

**Conversation ends when:**
- User says: "thanks", "goodbye", "bye", "talk soon"
- Idle for 10 minutes (no user message)
- Max messages reached

**Minimum requirement:**
- 10+ messages (filters out tire-kickers)

**Automatic email sent to:**
- Your `TEAM_EMAIL` from Vercel environment variable
- Within seconds of conversation ending

---

## Cost

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Completely free for your volume

---

## Troubleshooting

**No email received?**

1. Check Vercel logs:
   - Dashboard → Your project → "Logs"
   - Look for errors in `/api/conversation-complete`

2. Check Resend logs:
   - Dashboard → "Logs"
   - See if email was sent successfully

3. Verify environment variables:
   - Vercel → Settings → Environment Variables
   - Confirm `RESEND_API_KEY` and `TEAM_EMAIL` are set

4. Check spam folder

5. Ensure conversation had 10+ messages

**Widget not sending?**

1. Open browser console (F12)
2. Look for "Sending conversation summary"
3. Check Network tab for POST to `/api/conversation-complete`
4. Verify no JavaScript errors

---

## Files

**Backend:** `/api/conversation-complete.js` (Vercel Edge Function)
- Analyzes conversation
- Extracts contact info, problems, solutions
- Sends email via Resend

**Frontend:** `/ai-discovery-widget/widget-script.js`
- Detects conversation end
- POSTs to backend endpoint

---

## Next Steps

1. ✅ Add Resend API key to Vercel
2. ✅ Test with a real conversation
3. ✅ Verify email looks good
4. (Optional) Verify custom domain in Resend
5. Monitor first few conversations

That's it! Your conversation tracking is live.
