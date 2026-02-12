# AI Sales Logic - Simple Guide for Nate

**What You Need to Know:** The AI salesperson follows a script (called a "system prompt"). You can edit this script to change how it sells.

---

## 📍 Where to Find It

**File:** `/api/chat.js`

**Lines:** 4 to 70 (everything between the backticks starting with `SYSTEM_PROMPT`)

---

## 🎯 Current Sales Strategy

The AI currently follows **Carlos's discovery meeting style**:

### **Phase 1: Opening** (1-2 back-and-forth messages)
- Quick intro: "Hey! I'm with AI Sync 101..."
- Immediately asks about their biggest operational problem

### **Phase 2: Pain Discovery** (3-5 messages)
- Digs into their problem
- Asks about impact: "What's this costing you?"
- Gets them to quantify pain

### **Phase 3: Context** (2-4 messages)
- Company size, tech stack, role
- What they've tried before

### **Phase 4: Recommendations** (2-3 messages)
- High-level solutions
- Real examples from similar companies

### **Phase 5: Close** (1-2 messages)
- Summary of what was discussed
- Push for discovery call booking

**Total:** 10-15 exchanges before wrapping up

---

## 🔧 Recommended Adjustments

Based on typical conversion patterns, here are my recommendations:

### **Option A: More Aggressive (Higher Volume, Lower Quality)**

**Goal:** Get more discovery calls booked, faster

**Changes:**
1. **Shorten discovery phase** - Skip some context questions
2. **Ask for the call earlier** - After 5 messages instead of 10
3. **Use urgency** - "Most companies we work with see ROI within 60 days"
4. **Qualify faster** - Ask about budget/timeline upfront

**Trade-off:** More calls, but lower quality leads

---

### **Option B: More Educational (Build Trust)**

**Goal:** Position as expert, warmer leads

**Changes:**
1. **Share more examples** - Give 2-3 specific case studies
2. **Provide mini-insights** - "Here's a common mistake we see..."
3. **Longer conversation** - Let it go 15-20 exchanges
4. **Softer close** - "When you're ready to explore this further..."

**Trade-off:** Fewer calls, but higher quality leads

---

### **Option C: Qualification-Focused (Best Fit Leads)**

**Goal:** Only book calls with qualified prospects

**Changes:**
1. **Ask qualifying questions early:**
   - "What's your rough budget for solving this?"
   - "What's your timeline?"
   - "Are you the decision-maker?"
2. **Disqualify politely** - "Sounds like our solution might be overkill for your needs"
3. **Shorter for unqualified** - 3-5 messages then graceful exit
4. **Deeper for qualified** - Full discovery if they pass filters

**Trade-off:** Much fewer calls, but highly qualified

---

## 💡 My Recommendation

**Go with Option B (Educational) for 2 weeks, then test Option C.**

**Why:**
- You're targeting mid-market companies ($10-50M revenue)
- These buyers do research before calls
- Trust matters more than speed
- Quality > quantity for your deal size

**Test this approach:**
1. Let AI share more examples
2. Longer conversations (15-20 exchanges)
3. Add one qualifying question: "What's your timeline for getting this solved?"
4. Softer close, focus on value delivery

---

## 📝 Specific Script Changes to Make

### **Change #1: Make Opening More Helpful**

**Current (line 461 in `/ai-discovery-widget/widget-script.js`):**
```
"Hey! I'm with AI Sync 101. We help mid-market companies solve
expensive operational problems through custom platforms and automation.

Quick question to get started - what's the biggest operational
bottleneck that's costing your business time or money right now?"
```

**Recommended:**
```
"Hey! I'm with AI Sync 101 - we've helped companies like [similar company]
cut operational costs by 40-60% through custom automation.

I'm here to understand your challenges and share what's worked for
companies in similar situations. What's your biggest operational headache
right now?"
```

---

### **Change #2: Add Case Study Sharing**

**Add to system prompt (around line 60 in `/api/chat.js`):**

```
AFTER understanding their pain point, share 1-2 relevant examples:
- Therapy company: Cut charting from 2hrs to 15min with AI transcription
- Environmental services: Eliminated weeks of billing delays with custom platform
- Logistics: Identified $1M/year loss from lack of real-time data

Say: "We've seen this before. For example, [relevant case] - does that
sound similar to what you're dealing with?"
```

---

### **Change #3: Add Soft Qualification**

**Add after context phase (around line 29 in `/api/chat.js`):**

```
4. SOFT QUALIFICATION (1 exchange)
   - "What's your timeline for getting this solved - urgent or just exploring?"
   - Don't disqualify, just note urgency level
```

---

### **Change #4: Warmer Close**

**Current (lines 60-61 in `/api/chat.js`):**
```
"- Guide toward booking a consultation"
```

**Change to:**
```
"- After providing value, offer discovery call naturally:
  'Based on what you've shared, I think a 30-minute call with our team
  would be valuable. We can map out a specific approach for your situation
  and you'll walk away with concrete next steps - even if we don't end up
  working together. Sound good?'"
```

---

## 🎚️ Easy Settings to Adjust

**File:** `/ai-discovery-widget/widget-script.js` (lines 8-12)

```javascript
maxMessages: 30,              // ← Change to 40 for longer conversations
leadCaptureThreshold: 7,      // ← Change to 5 (earlier) or 10 (later)
```

**My recommendation:**
- Set `maxMessages: 40` (allow longer, more educational conversations)
- Keep `leadCaptureThreshold: 7` (current timing is good)

---

## 📊 What to Track

After making changes, watch these metrics:

1. **Conversation length** - Are people engaging longer?
2. **Email capture rate** - % who provide email
3. **Discovery call booking rate** - % who actually book
4. **Show-up rate** - % who attend the call
5. **Close rate** - % who become customers

**Good benchmarks:**
- Email capture: 40-60%
- Discovery call booking: 15-25%
- Show-up rate: 70-80%
- Close rate: 20-30%

---

## 🚀 Quick Start: Make These 3 Changes Today

### **1. Extend conversation length**
File: `/ai-discovery-widget/widget-script.js` line 10
```javascript
maxMessages: 40,  // was 30
```

### **2. Add case study sharing**
File: `/api/chat.js` after line 60, add:
```
- After understanding pain, share 1 relevant case study
- Ask: "Sound similar to what you're dealing with?"
```

### **3. Softer close**
File: `/api/chat.js` line 61, change to:
```
"- Close warmly: 'I think a quick call would be valuable. You'll get
  concrete recommendations even if we don't work together. Worth 30 minutes?'"
```

---

## 💰 Cost Impact

**Current:** ~$0.03 per conversation

**After changes:**
- Longer conversations: ~$0.05 per conversation
- Still very affordable at ~$5-9/month total

**ROI:** If one extra qualified lead converts = 🚀🚀🚀

---

## ⚠️ Don't Change These

These are working well:

1. ✅ Short responses (2-4 sentences) - keeps it conversational
2. ✅ Token efficiency - keeps costs low
3. ✅ Lead capture at 7 messages - good timing
4. ✅ Email summary feature - great for follow-up

---

## 🆘 Need Help?

If you want to make changes but aren't sure how:

1. **Find the file** (I listed file paths above)
2. **Find the line number** (I gave you exact lines)
3. **Copy the example text** I provided
4. **Save and push to GitHub** (your normal process)
5. **Wait 2 minutes** for auto-deployment
6. **Test it** on the live site

**Test link:** https://www.aisync101.com

---

## 📈 Testing Roadmap

**Week 1-2:** Educational approach (Option B)
- Longer conversations
- More case studies
- Softer close
- **Track:** Email capture rate, call booking rate

**Week 3-4:** Add qualification (Option C)
- Keep educational style
- Add: "What's your timeline?"
- **Track:** Lead quality, show-up rate

**Month 2:** Optimize based on data
- Double down on what's working
- A/B test different approaches

---

**Last Updated:** Feb 11, 2026
**Current Conversion:** Test for baseline first
**Goal:** 20%+ of conversations → booked discovery calls
