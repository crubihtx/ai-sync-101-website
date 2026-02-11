# 🚀 AI SYNC 101 DISCOVERY WIDGET - DEPLOYMENT CHECKLIST

Use this checklist to deploy the widget to production.

---

## ☑️ PRE-DEPLOYMENT

### **Azure Functions Setup**
- [ ] Install Azure Functions Core Tools (`npm install -g azure-functions-core-tools@4`)
- [ ] Navigate to `azure-functions/` directory
- [ ] Copy `.env.example` to `.env`
- [ ] Add OpenAI API key to `.env` file
- [ ] Test functions locally (`func start`)
- [ ] Verify chat endpoint works (test with Postman/curl)
- [ ] Verify send-summary endpoint works

### **OpenAI Account**
- [ ] Have OpenAI API account set up
- [ ] API key is active and has credits
- [ ] Chosen model: `gpt-4-turbo-preview` (or change to preferred model)

### **Email Configuration**
- [ ] Formspree endpoint is configured (using existing: `mlgwgavq`)
- [ ] Test email delivery to `info@aisync101.com`
- [ ] (Optional) Set up SendGrid if preferred over Formspree

---

## ☑️ DEPLOYMENT

### **Step 1: Deploy Azure Functions**

- [ ] Login to Azure (`az login`)
- [ ] Create Function App (or use existing):
  ```bash
  az functionapp create \
    --resource-group YourResourceGroup \
    --consumption-plan-location eastus \
    --runtime node \
    --runtime-version 18 \
    --functions-version 4 \
    --name aisync101-widget-backend \
    --storage-account yourstorageaccount
  ```
- [ ] Deploy functions:
  ```bash
  cd azure-functions
  func azure functionapp publish aisync101-widget-backend
  ```
- [ ] Set environment variable:
  ```bash
  az functionapp config appsettings set \
    --name aisync101-widget-backend \
    --resource-group YourResourceGroup \
    --settings "OPENAI_API_KEY=sk-your-actual-key"
  ```
- [ ] Enable CORS:
  ```bash
  az functionapp cors add \
    --name aisync101-widget-backend \
    --resource-group YourResourceGroup \
    --allowed-origins https://www.aisync101.com
  ```
- [ ] Note Function App URL: `https://aisync101-widget-backend.azurewebsites.net`

### **Step 2: Update Widget Configuration**

- [ ] Edit `widget-script.js` → Update `apiEndpoint` to Azure Functions URL
- [ ] Edit `widget-embed.js` → Update `apiEndpoint` to Azure Functions URL
- [ ] Verify `autoOpenDelay` is set correctly (default: 5000ms)
- [ ] Verify `leadCaptureThreshold` is set correctly (default: 7 messages)

### **Step 3: Integrate with Website**

**Option A: Embed Script (Recommended)**
- [ ] Add to `index.html` before `</body>`:
  ```html
  <script src="/ai-discovery-widget/widget-embed.js"></script>
  ```

**Option B: Manual Integration**
- [ ] Add CSS link in `<head>`
- [ ] Copy widget HTML into `<body>`
- [ ] Add widget script before `</body>`

### **Step 4: Deploy to Azure Static Web Apps**

- [ ] Commit changes:
  ```bash
  git add ai-discovery-widget/
  git add index.html
  git commit -m "Add AI Discovery Widget"
  ```
- [ ] Push to repository:
  ```bash
  git push origin main
  ```
- [ ] Wait for Azure Static Web Apps to auto-deploy (check GitHub Actions)
- [ ] Verify deployment is complete

---

## ☑️ POST-DEPLOYMENT TESTING

### **Functional Testing**

- [ ] Visit https://www.aisync101.com
- [ ] Widget appears (either auto-opens or floating button visible)
- [ ] Click floating button to open widget
- [ ] Initial greeting message appears
- [ ] Send a test message
- [ ] AI responds appropriately
- [ ] Typing indicator shows before response
- [ ] Messages are formatted correctly (user right, AI left)
- [ ] Scroll works properly
- [ ] Lead capture form appears after 7 user messages
- [ ] Submit lead info successfully
- [ ] Conversation continues after lead capture
- [ ] Conversation ends naturally after ~15 exchanges
- [ ] Close and reopen widget - conversation persists
- [ ] Clear localStorage and refresh - new conversation starts

### **Email Testing**

- [ ] Complete a conversation with lead info
- [ ] Verify summary email sent to `info@aisync101.com`
- [ ] Email contains full transcript
- [ ] Email contains lead contact info
- [ ] Email formatting is correct
- [ ] Lead receives their summary email
- [ ] Lead email contains correct information

### **Mobile Testing**

- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Widget is full-screen on mobile
- [ ] Touch interactions work smoothly
- [ ] Keyboard doesn't break layout
- [ ] Send button works on mobile
- [ ] All features work on mobile

### **Performance Testing**

- [ ] Widget loads in < 2 seconds
- [ ] No console errors
- [ ] AI responses arrive in < 5 seconds
- [ ] Typing indicator shows during AI processing
- [ ] No memory leaks (test long conversation)
- [ ] Page performance not affected by widget

---

## ☑️ MONITORING & OPTIMIZATION

### **Week 1: Monitor Closely**

- [ ] Check emails daily for new conversations
- [ ] Review conversation quality
- [ ] Note any common questions/patterns
- [ ] Check for any error logs in Azure Functions
- [ ] Verify email delivery is 100%
- [ ] Monitor OpenAI API usage/costs

### **Week 2-4: Optimize**

- [ ] Review first 20 conversations
- [ ] Adjust system prompt if needed (tone, length, focus)
- [ ] Adjust lead capture threshold if needed
- [ ] Add industry-specific examples to system prompt
- [ ] Optimize conversation flow based on feedback
- [ ] Consider A/B testing different prompts

### **Ongoing**

- [ ] Set up monthly OpenAI cost alerts
- [ ] Review conversation-to-booking conversion rate
- [ ] Gather feedback from sales team on lead quality
- [ ] Update system prompt with new case studies
- [ ] Monitor for any technical issues

---

## ☑️ OPTIONAL ENHANCEMENTS

### **Analytics (Optional)**

- [ ] Add Google Analytics tracking for widget opens
- [ ] Track conversation start rate
- [ ] Track lead capture rate
- [ ] Track conversation completion rate
- [ ] Set up conversion tracking to discovery calls booked

### **A/B Testing (Optional)**

- [ ] Test different auto-open delays (3s vs 5s vs 10s)
- [ ] Test different lead capture thresholds (5 vs 7 vs 10)
- [ ] Test different initial greetings
- [ ] Test different closing CTAs

### **Advanced Features (Future)**

- [ ] Calendar integration for direct booking
- [ ] Sentiment analysis on conversations
- [ ] Auto-categorize leads by pain point
- [ ] CRM integration (HubSpot, Salesforce, etc.)
- [ ] Slack notifications for high-value leads

---

## 🎯 SUCCESS METRICS

Track these over the first month:

- **Widget Open Rate**: __% of visitors
- **Conversation Start Rate**: __% of opens
- **Lead Capture Rate**: __% of conversations
- **Conversation Completion Rate**: __% finish full conversation
- **Booking Rate**: __% of leads book a call
- **Average Conversation Length**: __ messages
- **Top Pain Points Mentioned**: ________________

---

## 🆘 TROUBLESHOOTING GUIDE

### Widget Not Appearing
1. Check browser console for errors
2. Verify file paths are correct
3. Check if widget files are deployed

### AI Not Responding
1. Check Azure Functions logs
2. Verify OPENAI_API_KEY is set
3. Check CORS settings
4. Test endpoint with curl/Postman

### Emails Not Sending
1. Verify Formspree endpoint
2. Check Azure Functions logs
3. Test endpoint directly

### Performance Issues
1. Check OpenAI API response time
2. Optimize system prompt length
3. Consider switching to gpt-3.5-turbo

---

## ✅ FINAL CHECKS BEFORE GO-LIVE

- [ ] All tests passed
- [ ] No console errors
- [ ] Emails working correctly
- [ ] Mobile experience is great
- [ ] System prompt is refined
- [ ] Team is aware widget is live
- [ ] Monitoring is set up
- [ ] Backup plan if issues arise

---

## 🎉 YOU'RE LIVE!

**Congratulations!** Your AI Discovery Widget is now live and ready to hook prospects and book discovery calls.

**Next Steps:**
1. Monitor conversations closely for first week
2. Share feedback with team
3. Iterate on system prompt based on real conversations
4. Celebrate your success! 🚀

---

**Deployed Date:** _______________
**Deployed By:** Carlos Rubi
**Function App URL:** _______________
**Widget Version:** 1.0.0
