# Complete Setup Checklist

## ✅ What's Already Done

- ✅ Code deployed to GitHub
- ✅ Vercel connected to GitHub (auto-deploys on push)
- ✅ Widget installed on website
- ✅ System prompt optimized (4,021 words, 29% reduction)
- ✅ Conversation tracker built
- ✅ Resend integration code written
- ✅ Dependencies added (resend package)

---

## ⏳ What You Need to Do

### 1. Verify OpenAI API Key is Set in Vercel

**Check if it's already set:**
1. Go to https://vercel.com/dashboard
2. Select project: `ai-sync-101-website`
3. Settings → Environment Variables
4. Look for: `OPENAI_API_KEY`

**If NOT set:**
1. Get your OpenAI API key from https://platform.openai.com/api-keys
2. Add as environment variable: `OPENAI_API_KEY`
3. Redeploy

**If you don't have an OpenAI key:**
1. Go to https://platform.openai.com
2. Sign up / Log in
3. Go to API Keys → Create new secret key
4. Copy it (starts with `sk-`)
5. Add to Vercel environment variables

---

### 2. Set Up Resend for Email Summaries

**Step A: Get Resend API Key**
1. Go to https://resend.com
2. Sign up with your email
3. Click "API Keys" in sidebar
4. Click "Create API Key"
5. Name it: "AI Discovery Widget"
6. Copy the key (starts with `re_`)

**Step B: Add to Vercel Environment Variables**
1. Go to https://vercel.com/dashboard
2. Select project: `ai-sync-101-website`
3. Settings → Environment Variables
4. Add two new variables:

| Variable Name | Value |
|--------------|-------|
| `RESEND_API_KEY` | Your Resend key (re_xxxxx) |
| `TEAM_EMAIL` | carlos@computech.support |

5. Click "Save"

**Step C: Redeploy**
1. Go to "Deployments" tab
2. Click "..." on the latest deployment
3. Click "Redeploy"
4. Wait ~1 minute for deployment

---

### 3. Configure Resend Email Domain (IMPORTANT)

Right now, emails will come from Resend's test domain. For production, you need to verify your domain.

**Option A: Use Test Domain (Quick, for testing)**
- Emails will come from: `onboarding@resend.dev`
- Works immediately, no setup
- Not professional, but fine for testing

**Option B: Verify Your Domain (Recommended for production)**

1. Go to Resend Dashboard → "Domains"
2. Click "Add Domain"
3. Enter your domain: `aisync101.com`
4. Resend will show you DNS records to add

**DNS Records to Add** (you'll get these from Resend):
```
Type: TXT
Name: _resend (or resend._domainkey)
Value: [provided by Resend]

Type: CNAME
Name: resend
Value: [provided by Resend]
```

5. Add these to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
6. Wait 5-10 minutes for DNS propagation
7. Click "Verify" in Resend dashboard

After verification, emails will come from: `widget@aisync101.com`

**Note:** You can skip this for now and use the test domain. Come back to it when you want professional-looking emails.

---

### 4. Update Email "From" Address (After Domain Verification)

Once your domain is verified in Resend, the current code will automatically use `widget@aisync101.com`.

**If you want a different sender name/email:**

Edit `/api/conversation-complete.js` line 396:
```javascript
from: 'AI Discovery Widget <widget@aisync101.com>',
```

Change to:
```javascript
from: 'AI Sync 101 <team@aisync101.com>',
// or
from: 'Carlos at AI Sync 101 <carlos@aisync101.com>',
```

Then commit and push.

---

## 🧪 Testing

### Test 1: Widget is Working
1. Go to your website
2. Widget should auto-open after 5 seconds
3. Send a message
4. Should get AI response

**If widget not working:**
- Check browser console (F12) for errors
- Verify Vercel deployment is live
- Check that `OPENAI_API_KEY` is set in Vercel

### Test 2: Email Summaries Work

**Quick Test (API endpoint):**
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
      {"role": "assistant", "content": "I see: 1. Delayed timesheets 2. Manual entry. Which?"},
      {"role": "user", "content": "Number 1"},
      {"role": "assistant", "content": "What is this costing you?"},
      {"role": "user", "content": "A few thousand per month. Email: carlos@computech.support"},
      {"role": "assistant", "content": "Want to schedule?"},
      {"role": "user", "content": "Yes"},
      {"role": "assistant", "content": "What is your number?"},
      {"role": "user", "content": "225-892-2135"}
    ]
  }'
```

Check your email (carlos@computech.support) - should receive summary within seconds.

**Real Test (via widget):**
1. Go to your website
2. Have a conversation (10+ messages)
3. Either:
   - Say "thanks" (triggers immediate send)
   - Wait 10 minutes (idle timeout)
4. Check your email

---

## 📊 Monitoring

### Check Vercel Logs
https://vercel.com/dashboard → Your project → Logs

Look for:
- `/api/chat` - Should show conversation requests
- `/api/conversation-complete` - Should show email sends

### Check Resend Logs
https://resend.com/dashboard → Logs

See all sent emails with delivery status.

---

## 🔐 Environment Variables Summary

**What you MUST have in Vercel:**

| Variable | Required | Value | Used By |
|----------|----------|-------|---------|
| `OPENAI_API_KEY` | ✅ YES | sk_xxxxx | Chat endpoint |
| `RESEND_API_KEY` | ✅ YES | re_xxxxx | Email summaries |
| `TEAM_EMAIL` | ✅ YES | carlos@computech.support | Email recipient |

**To check/set these:**
Vercel Dashboard → Your Project → Settings → Environment Variables

---

## 🚨 Troubleshooting

### Widget loads but no AI response
**Issue:** `OPENAI_API_KEY` not set or invalid
**Fix:**
1. Verify key in Vercel environment variables
2. Check Vercel logs for "OPENAI_API_KEY not set" error
3. Redeploy after adding key

### Email not received
**Issue:** `RESEND_API_KEY` not set or email address wrong
**Fix:**
1. Verify both `RESEND_API_KEY` and `TEAM_EMAIL` in Vercel
2. Check Resend logs for send status
3. Check spam folder
4. Ensure conversation had 10+ messages

### Email from "onboarding@resend.dev"
**Issue:** Domain not verified in Resend
**Fix:** This is normal for testing. Follow "Configure Resend Email Domain" section above to use your domain.

### "Internal server error" in widget
**Fix:**
1. Open browser console (F12)
2. Check Network tab for error details
3. Check Vercel logs for stack trace
4. Verify all environment variables are set

---

## ✅ Final Checklist

Before going live, verify:

- [ ] `OPENAI_API_KEY` set in Vercel
- [ ] `RESEND_API_KEY` set in Vercel
- [ ] `TEAM_EMAIL` set in Vercel
- [ ] Redeployed Vercel after adding env vars
- [ ] Tested widget - AI responds
- [ ] Tested email - received summary
- [ ] (Optional) Verified domain in Resend for professional emails

**Once all checked, you're live!** 🚀

---

## 📁 Files You Can Delete (Optional Cleanup)

These were from earlier attempts and are no longer needed:

```
/conversation-tracker/        # Was for Render, now using Vercel
/api/chat-50percent.js       # Backup version
/api/chat-new-condensed.js   # Backup version
/api/chat-verbose.js         # Backup version
/api/chat-verbose-backup.js  # Backup version
/api/send-summary.js         # Old version, replaced by conversation-complete.js
```

**Keep these:**
```
/api/chat.js                      # Active chat endpoint
/api/conversation-complete.js     # Active email sender
/ai-discovery-widget/             # Active widget
RESEND-SETUP.md                   # Setup guide
QUICK-REFERENCE.md                # Quick reference
```
