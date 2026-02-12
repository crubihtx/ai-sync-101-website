# AI Discovery Widget - Conversation Logic & Customization Guide

## For: Nate (to adjust AI conversation behavior)

---

## Overview

The AI Discovery Widget uses **GPT-4 Turbo** with a detailed system prompt that defines how it conducts discovery conversations. The AI is designed to replicate Carlos's discovery meeting style - conversational, consultative, and focused on identifying operational pain points.

---

## Where to Find the AI Logic

### **Primary Location: `/api/chat.js`**

This is the Vercel Edge Function that handles all AI responses. The conversation logic is defined in the `SYSTEM_PROMPT` constant (lines 4-70).

**File Path:** `/api/chat.js`

---

## Current Conversation Structure

### **The AI follows this flow:**

```
1. OPENING (1-2 exchanges)
   └─> Warm greeting, establish what AI Sync 101 does

2. PAIN POINT DISCOVERY (3-5 exchanges)
   └─> Dig into problem, quantify impact

3. CONTEXT BUILDING (2-4 exchanges)
   └─> Understand tech stack, company size, role

4. POSSIBILITIES & RECOMMENDATIONS (2-3 exchanges)
   └─> High-level approach, examples

5. CLOSE & NEXT STEPS (1-2 exchanges)
   └─> Summarize, offer consultation
```

### **Total Target:** 10-15 message exchanges (20-30 total messages)

---

## Key Behavioral Rules (Current Settings)

### **Conversation Guardrails:**

1. **Keep responses SHORT** - 2-4 sentences max
2. **Be honest and defer technical details** - "That's exactly what we'd cover in a discovery call"
3. **Never disqualify anyone** - Always provide full value
4. **Guide toward booking a consultation** - Not solving problems completely
5. **Token efficiency** - Be concise to avoid high OpenAI costs

### **Key Questions the AI Weaves In:**

- "What's the biggest operational bottleneck costing your business time or money?"
- "If you could fix that, what would the impact be?"
- "What have you tried so far? Why didn't it work?"
- "What systems are you using today?"
- "How many employees? Locations?"

---

## Conversation Triggers & Behaviors

### **Lead Capture:**
- **Trigger:** After user sends 7 messages (`leadCaptureThreshold: 7` in `/ai-discovery-widget/widget-script.js` line 11)
- **Action:** Shows form asking for name and email (now REQUIRED - no skip button)
- **After Capture:** Sends email summary immediately

### **Conversation End:**
- **Trigger:** After 30 total messages (`maxMessages: 30` in `/ai-discovery-widget/widget-script.js` line 10)
- **Action:** Sends conversation summary email

### **Email Summary:**
- **Sent To:**
  - You at `info@aisync101.com` (full transcript + insights)
  - Lead at their email (thank you + CTA)
- **Handler:** `/api/send-summary.js`

---

## How to Adjust the AI Behavior

### **Option 1: Modify the System Prompt (Recommended)**

**File:** `/api/chat.js` (lines 4-70)

**What you can change:**

1. **Conversation Flow/Structure** (lines 25-30)
   - Change the number of exchanges per phase
   - Reorder the phases
   - Add/remove phases

2. **Tone & Personality** (lines 8-23)
   - Current: Conversational, consultative, like Carlos
   - Can adjust: More formal, more casual, more technical, etc.

3. **Key Questions** (lines 32-38)
   - Add new discovery questions
   - Remove questions
   - Change question phrasing

4. **Response Length** (line 58)
   - Current: "2-4 sentences"
   - Can change: "1-2 sentences", "3-5 sentences", etc.

5. **Call-to-Action Approach** (lines 60-61)
   - Current: "Guide toward booking a consultation"
   - Can change: More aggressive, softer, different CTA

**Example Modifications:**

```javascript
// CURRENT (line 58):
"- Keep responses SHORT (2-4 sentences)"

// CHANGE TO (for longer responses):
"- Keep responses conversational (3-6 sentences)"

// ---

// CURRENT (line 25):
"1. Opening (1-2 exchanges) - Warm greeting, establish what you do"

// CHANGE TO (skip intro, go straight to pain):
"1. Pain Point Discovery (immediate) - Jump right into their challenge"
```

---

### **Option 2: Adjust Conversation Limits**

**File:** `/ai-discovery-widget/widget-script.js` (lines 8-12)

```javascript
this.config = {
    apiEndpoint: 'https://ai-sync-101-website.vercel.app/api/chat',
    autoOpenDelay: 5000,                    // When widget auto-opens (ms)
    maxMessages: 30,                         // Max conversation length
    leadCaptureThreshold: 7,                 // When to ask for email
    typingDelay: { min: 800, max: 2000 },   // Typing indicator timing
};
```

**What you can change:**

- `maxMessages: 30` → Change to 40, 50, etc. for longer conversations
- `leadCaptureThreshold: 7` → Change to 5 for earlier capture, 10 for later
- `autoOpenDelay: 5000` → Change to 0 (instant), 10000 (10 sec delay), etc.

---

### **Option 3: Change Initial Greeting**

**File:** `/ai-discovery-widget/widget-script.js` (lines 460-462)

```javascript
getInitialGreeting() {
    return "Hey! I'm with AI Sync 101. We help mid-market companies solve expensive operational problems through custom platforms and automation.\n\nQuick question to get started - what's the biggest operational bottleneck that's costing your business time or money right now?";
}
```

**Change this to:**
- Different opening question
- Different tone (more formal, more casual)
- Shorter/longer introduction

---

## Temperature & Creativity Settings

**File:** `/api/chat.js` (line 135)

```javascript
temperature: 0.7,       // Controls randomness (0.0 = deterministic, 1.0 = creative)
max_tokens: 300,        // Max response length
```

**Adjustments:**

- `temperature: 0.5` → More consistent, less creative
- `temperature: 0.9` → More varied, more creative
- `max_tokens: 500` → Allow longer responses (costs more)
- `max_tokens: 150` → Force shorter responses (costs less)

---

## Example Prompt Modifications

### **Make the AI More Direct/Aggressive:**

```javascript
// Change line 8-10 from:
"You are a discovery assistant for AI Sync 101..."

// To:
"You are a direct, results-focused sales assistant for AI Sync 101.
Your goal is to quickly identify if the prospect has a real problem worth
solving and book a discovery call within 5 exchanges. Be assertive but
friendly."
```

### **Make the AI More Educational:**

```javascript
// Add to the system prompt (around line 60):
"- Provide 1-2 concrete examples of how similar companies solved this
- Share brief insights about common pitfalls
- Position yourself as an expert advisor, not just a sales assistant"
```

### **Make the AI Focus on Qualification:**

```javascript
// Add to CONVERSATION GUARDRAILS (around line 56):
"- Qualify budget early: 'Our engagements typically start at $X - does that align with your thinking?'
- Confirm decision-making authority: 'Are you the one who makes the call on initiatives like this?'
- Establish timeline: 'What's your timeline for getting this solved?'"
```

---

## Email Summary Customization

**File:** `/api/send-summary.js`

### **Email to You (info@aisync101.com):**
- Lines 117-166: HTML template for summary email
- **Customize:** Subject line (115), content sections, formatting

### **Email to Lead:**
- Lines 195-258: HTML template for thank-you email
- **Customize:** Subject (193), call-to-action (236), next steps (227-234)

---

## Testing Your Changes

### **After modifying the AI logic:**

1. **Save the file** (`/api/chat.js`)
2. **Commit changes:**
   ```bash
   git add api/chat.js
   git commit -m "Update AI conversation logic"
   git push origin main
   ```
3. **Wait 1-2 minutes** for Vercel to deploy
4. **Test on website:**
   - Hard refresh (Cmd+Shift+R)
   - Click refresh button in widget to start fresh
   - Test the new conversation flow

### **To see AI responses in real-time:**
- Open browser DevTools (F12)
- Go to Network tab
- Watch `/api/chat` requests to see prompts and responses

---

## Cost Considerations

### **Current Cost per Conversation:**
- Model: GPT-4 Turbo (`gpt-4-turbo-preview`)
- ~1500 tokens per 15-message conversation
- Cost: ~$0.02-0.04 per conversation

### **If you make conversations longer:**
- 30 messages → ~$0.06-0.08 per conversation
- 50 messages → ~$0.10-0.15 per conversation

### **To reduce costs:**
1. Keep `max_tokens: 300` or lower
2. Keep `maxMessages: 30` or lower
3. Use shorter system prompt
4. Consider switching to GPT-4 (cheaper but less capable)

---

## Quick Reference: Files to Edit

| What You Want to Change | File to Edit | Line Numbers |
|------------------------|--------------|--------------|
| **AI personality/tone** | `/api/chat.js` | 8-23 |
| **Conversation structure** | `/api/chat.js` | 25-30 |
| **Key questions** | `/api/chat.js` | 32-38 |
| **Response length** | `/api/chat.js` | 58 |
| **Temperature/creativity** | `/api/chat.js` | 135 |
| **Max conversation length** | `/ai-discovery-widget/widget-script.js` | 10 |
| **When to capture email** | `/ai-discovery-widget/widget-script.js` | 11 |
| **Initial greeting** | `/ai-discovery-widget/widget-script.js` | 460-462 |
| **Email templates** | `/api/send-summary.js` | 117-166, 195-258 |

---

## Support

If you need help with modifications or want to test different approaches:

1. **Make small changes first** - test one thing at a time
2. **Use version control** - commit before major changes
3. **Monitor Vercel logs** - see what the AI is actually saying
4. **A/B test different prompts** - try 2-3 variations and see what converts better

---

**Last Updated:** Feb 11, 2026
**AI Model:** GPT-4 Turbo Preview
**Monthly Cost:** ~$3-7 (based on ~180 conversations/month)
