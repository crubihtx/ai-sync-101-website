# AI Discovery Widget - Quick Reference

## Setup Checklist

### ✅ Resend Email Summaries (3 minutes)

1. **Get Resend API Key**
   - https://resend.com → Sign up → API Keys → Create
   - Copy the key (starts with `re_`)

2. **Add to Vercel**
   - https://vercel.com/dashboard → Your project
   - Settings → Environment Variables
   - Add: `RESEND_API_KEY` = your key
   - Add: `TEAM_EMAIL` = carlos@computech.support
   - Save → Redeploy

3. **Test**
   - Have a 10+ message conversation on your widget
   - Say "thanks" or wait 10 min
   - Check email

**See RESEND-SETUP.md for detailed instructions**

---

## System Prompt Improvements (Already Deployed)

### Recent Changes:
- ✅ 29% smaller (5,690 → 4,021 words)
- ✅ Get Name/Company/Website in first 2-4 exchanges
- ✅ Removed Calendly (personal follow-up instead)
- ✅ Full conversation memory (no 20-message limit)
- ✅ Removed conflicting instructions

### Email When User Agrees to Schedule:
"Perfect. Someone from our team will reach out to [email] and [phone] within 24 hours to coordinate a time that works for you."

---

## Conversation Flow

**PHASE 1 (Messages 1-4):** Get identity EARLY
- Problem → "Who am I speaking with?" → Get company → Get website

**PHASE 2 (Messages 5-10):** Deep problem exploration
- Now ask industry-specific questions with context

**PHASE 3 (Messages 11-20):** Workflow mapping
- Map entire process, present 2-3 problems, let them pick

**PHASE 4 (Messages 20-30):** Value delivery
- Confirm understanding → Paint solution → Get email

**PHASE 5 (After value):** Confirm interest
- "Want to schedule?" → Get phone → "We'll reach out"

---

## Email Summary Triggers

**Sent automatically when:**
1. User says: "thanks", "goodbye", "bye", "talk soon"
2. Idle for 10 minutes
3. Max messages reached

**Minimum:** 10+ messages (filters short conversations)

**Email includes:**
- Contact info (name, email, phone, company, website)
- Engagement level (HIGH/MEDIUM/LOW)
- Main problem (their priority)
- All identified problems
- Current workflow
- Proposed solution
- Quantified impact
- Full transcript

---

## Files & Endpoints

**Backend:**
- `/api/chat.js` - OpenAI conversation (4,021-word prompt)
- `/api/conversation-complete.js` - Email summary sender

**Frontend:**
- `/ai-discovery-widget/widget-script.js` - Main widget
- `/ai-discovery-widget/widget-simple-embed.js` - Embed code

**Endpoints:**
- Chat: `https://ai-sync-101-website.vercel.app/api/chat`
- Tracker: `https://ai-sync-101-website.vercel.app/api/conversation-complete`

---

## Cost

**OpenAI (GPT-4 Turbo):**
- ~10,000 tokens per conversation
- ~$0.10 per conversation
- Estimate: ~$30/month for 300 conversations

**Resend:**
- FREE: 3,000 emails/month
- More than enough

**Vercel:**
- FREE: Hobby plan sufficient

**Total:** ~$30/month (just OpenAI)

---

## Troubleshooting

**Email not received?**
- Check Vercel logs (Dashboard → Logs)
- Check Resend logs (Dashboard → Logs)
- Verify `TEAM_EMAIL` environment variable
- Check spam folder
- Ensure conversation had 10+ messages

**AI not getting identity early?**
- Check system prompt in `/api/chat.js`
- PHASE 1 should say "IMMEDIATELY get identity"
- Latest version deployed: Yes ✅

**Widget not loading?**
- Check browser console (F12)
- Verify script URLs in embed code
- Check Vercel deployment status

---

## Next Steps

1. ✅ Deploy code (done - just pushed)
2. ⏳ Add Resend API key to Vercel
3. ⏳ Test with real conversation
4. ⏳ Monitor first few emails
5. ⏳ (Optional) Verify custom domain in Resend

---

## Support Resources

- **Resend Setup:** RESEND-SETUP.md
- **Conversation Tracker (old):** conversation-tracker/ (can delete - using Vercel now)
- **Vercel Docs:** https://vercel.com/docs
- **Resend Docs:** https://resend.com/docs
