# Conversation Tracker - Quick Start

## What This Does

After a discovery conversation ends (either by user saying goodbye or 10 minutes of inactivity), the widget automatically sends a summary email to your team with:

- **Contact Info**: Name, email, phone, company, website
- **Main Problem**: The specific issue they prioritized
- **Proposed Solution**: The workflow you discussed
- **Engagement Level**: High/medium/low
- **Full Transcript**: Every message in the conversation

## 5-Minute Setup

### 1. Get Resend API Key (2 min)
```
→ Go to: https://resend.com
→ Sign up
→ API Keys → Create API Key
→ Copy the key (starts with re_)
```

### 2. Deploy to Render (2 min)
```
→ Go to: https://render.com
→ New + → Web Service
→ Connect GitHub repo: ai-sync-101-website
→ Settings:
   Root Directory: conversation-tracker
   Build: npm install
   Start: npm start
→ Environment Variables:
   RESEND_API_KEY = (your key from step 1)
   TEAM_EMAIL = carlos@computech.support
→ Create Web Service
```

### 3. Update Widget (1 min)
```
→ Copy your Render URL (e.g., https://conversation-tracker-xyz.onrender.com)
→ Edit: ai-discovery-widget/widget-script.js
→ Line 11: Replace tracker URL with your Render URL
→ Commit and push
```

## Test It

### Quick Test (via terminal):
```bash
curl https://YOUR-RENDER-URL.onrender.com/health
```

Should return: `{"status":"healthy"}`

### Real Test (via widget):
1. Go to your website
2. Have a conversation with the widget (10+ messages)
3. Say "thanks" or wait 10 minutes
4. Check your email for the summary

## Email Preview

You'll receive an email like this:

**Subject:** Discovery: Carlos from LAComputech

**Body:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━
NEW DISCOVERY CONVERSATION
Jan 1, 2024 • 17 messages
━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 CONTACT INFORMATION
Name: Carlos
Email: carlos@computech.support
Phone: 225-892-2135
Company: LAComputech
Website: computech.support

🎯 ENGAGEMENT LEVEL
[HIGH] ✅ Lead wants to schedule

🔥 MAIN PROBLEM
Delayed timesheets - Field staff taking weeks

💡 PROPOSED SOLUTION
Tech finishes → mobile app → QuickBooks → invoice
From 1 month to same-day billing

💬 FULL TRANSCRIPT
[Complete conversation...]
```

## What Triggers Summary Email?

1. **User says goodbye**: "thanks", "bye", "talk soon"
2. **Idle for 10 minutes**: No user message for 10 min
3. **Max messages**: Conversation hits limit (rare)

**Minimum**: Must have 10+ messages (filters out "just browsing")

## Files Created

```
conversation-tracker/
├── index.js                    # Express server
├── package.json                # Dependencies
├── services/
│   ├── analyzer.js            # Extract contact info, problems
│   └── emailer.js             # Send beautiful emails
├── README.md                   # Full documentation
├── DEPLOYMENT.md               # Step-by-step deploy guide
└── QUICK-START.md             # This file
```

## Cost

- **Render**: FREE (750 hrs/month = 24/7 uptime)
- **Resend**: FREE (3,000 emails/month)

Both free tiers are more than enough.

## Troubleshooting

**No email received?**
- Check Render logs (Dashboard → conversation-tracker → Logs)
- Check Resend logs (Dashboard → Logs)
- Check spam folder
- Verify TEAM_EMAIL is correct

**Widget not sending?**
- Browser console (F12) → Look for "Sending conversation summary"
- Network tab → Check POST to tracker endpoint
- Verify tracker URL in widget-script.js is correct

## Next Steps

1. Follow DEPLOYMENT.md for detailed setup
2. Test with a real conversation
3. Monitor first few conversations in Render logs
4. Enjoy automated lead tracking!

## Support

Full deployment guide: See `DEPLOYMENT.md`
Render docs: https://render.com/docs
Resend docs: https://resend.com/docs
