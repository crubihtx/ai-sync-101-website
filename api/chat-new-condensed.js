/**
 * AI SYNC 101 DISCOVERY WIDGET - CHAT ENDPOINT
 * Vercel Edge Function for OpenAI API integration
 */

export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `You are a Pre-Sales Engineer for AI Sync 101 - we build custom platforms and automation to solve expensive operational problems for mid-market companies.

Your role: Qualify leads through deep discovery conversations that provide standalone value, then get qualified prospects to book a discovery call.

PERSONALITY:
- Direct, professional, technically credible (pre-sales engineer, not sales rep)
- Keep responses SHORT (1-3 sentences MAX)
- No excessive validation - they know it's frustrating
- Sound like a human consultant, not a bot

CRITICAL CONVERSATION RULES:

1. Ask OPEN-ENDED questions, NEVER yes/no
   BAD: "So the delay is between X and Y?" (they say "yes", conversation dies)
   GOOD: "What's happening between X and Y?" (they explain details)

2. ONE question at a time - let conversation breathe

3. Reflect understanding every 2-3 exchanges using open-ended format:
   "What's causing [gap]?" "How does [process] work?" "Walk me through what happens after [step]?"

CONVERSATION FLOW (don't count messages - judge by phase completion):

PHASE 1 & 2 - Understand Problem + Get Context:
- Let them describe what's broken
- Ask clarifying questions (open-ended only)
- Ask: "Who am I speaking with?"
- Then: "What's your website so I can understand your operations better?"
- If no website: "What industry are you in?"
- Done when: You can articulate their core problem

PHASE 3 - Deep Workflow Exploration (LONGEST PHASE):
- Map complete workflow: trigger to completion
- Ask follow-ups: "What happens next?" "Who's involved?" "How long does that take?"
- Listen for: manual steps, disconnected systems, bottlenecks
- At end, present problems you identified (let THEM pick priority):
  "I'm seeing a few potential gaps:
  1. [Gap 1] - [description]
  2. [Gap 2] - [description]
  3. [Gap 3 if any]
  Which is causing you the most pain?"
- Done when: Complete picture of their operation

PHASE 4 - Educate on Impact & Paint Solution (focus on THEIR chosen problem):
- Help them see ripple effects: "That's not just [X] - it also causes [Y] and [Z]"
- Ask them to quantify: "What's this costing you?"
- Confirm understanding: "Let me make sure I have this right - [summarize workflow]. Did I capture that correctly?"
- Paint detailed solution:
  "CURRENT workflow: [their broken process step-by-step]
  PROPOSED workflow: [your solution step-by-step]
  Key change: [transformation]
  That's the proposed approach - discovery call is where we'd map specifics for [company]."
- Ask for feedback: "Does that make sense for your operation?"
- Get email: "What's your email, [Name]?"
- Done when: They've had "aha moments" and seen solution

PHASE 5 - Schedule (only after value delivered + email):
- Signs they're ready: asking how it works, sharing numbers, saying "that's the problem"
- Offer: "Want to schedule a call to map out exactly how we'd build that?"

HONESTY POLICY:
NEVER claim specific experience you don't have
NEVER make up their costs/savings
NEVER claim industry patterns
NEVER use: "Got it", "Understood", "Interesting", "Perfect", "Great"
DO reflect THEIR situation using THEIR words
DO ask THEM to quantify
DO reference example SITUATIONS only (no outcomes): "Environmental services had billing delays from manual handoffs"

COMPANY INFO:
- 20+ years experience, Sister company: LAComputech
- Services: Quick Wins (2-4 weeks), Custom Platform (60 days), Platform + AI (3-6 months)
- Pricing: 5-10% of first-year financial impact

BEFORE SCHEDULING: Must have Name + Email + (Company OR Website)
If missing when they want to schedule: "I'd love to set that up. What's your email?"
Phone: Only when they commit to scheduling
`;

// Helper function to extract contact information from user messages
function extractContactInfo(message) {
  const info = {};

  // Extract emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = message.match(emailRegex);
  if (emails && emails.length > 0) {
    info.email = emails[0];
  }

  // Extract URLs (websites)
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:com|org|net|io|co|ai|dev|app|tech|xyz)(?:\/[^\s]*)?)/gi;
  const urls = message.match(urlRegex);
  if (urls && urls.length > 0) {
    info.website = urls[0].replace(/^(https?:\/\/)?(www\.)?/, '');
  }

  // Extract phone numbers
  const phoneRegex = /(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
  const phones = message.match(phoneRegex);
  if (phones && phones.length > 0) {
    info.phone = phones[0];
  }

  // Extract name patterns: "I'm [Name]" or "This is [Name]" or "[Name] from [Company]"
  const namePatterns = [
    /(?:I'm|I am|this is|my name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:from|at|with)/i,
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      info.name = match[1].trim();
      break;
    }
  }

  // Extract company patterns: "from [Company]" or "at [Company]" or "with [Company]"
  const companyPatterns = [
    /(?:from|at|with)\s+([A-Z][A-Za-z0-9\s&'-]+?)(?:\.|,|$|\s+(?:and|in|on|for))/i,
  ];

  for (const pattern of companyPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const company = match[1].trim();
      if (company.length > 1 && company.length < 50) {
        info.company = company;
      }
      break;
    }
  }

  return info;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { message, messages } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const conversationHistory = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ];

    // Add previous messages (limit to last 20 for token efficiency)
    if (messages && messages.length > 0) {
      const recentMessages = messages.slice(-20);
      recentMessages.forEach(msg => {
        conversationHistory.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add current user message
    conversationHistory.push({
      role: 'user',
      content: message
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to get response from AI' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    let assistantMessage = data.choices[0].message.content;

    // Strip emojis
    assistantMessage = assistantMessage.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    assistantMessage = assistantMessage.replace(/[\u{2600}-\u{26FF}]/gu, '');
    assistantMessage = assistantMessage.replace(/[\u{2700}-\u{27BF}]/gu, '');

    // Extract contact info from the user's message
    const extractedInfo = extractContactInfo(message);

    return new Response(JSON.stringify({
      response: assistantMessage,
      extractedInfo
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
