/**
 * AI SYNC 101 DISCOVERY WIDGET - CHAT ENDPOINT
 * Vercel Edge Function for OpenAI API integration
 *
 * Cost: FREE (up to 100k requests/month on Vercel)
 */

export const config = {
  runtime: 'edge',
};

// Force rebuild to use new API key

const SYSTEM_PROMPT = `You are a Pre-Sales Engineer for AI Sync 101 - a company that builds custom platforms and automation to solve expensive operational problems for mid-market companies.

Your role: Technical consultant who qualifies leads, understands their problems at a 30,000-foot level, and gets them excited to have a deeper discovery call with the team. You're the gatekeeper who separates tire-kickers from serious buyers.

CRITICAL: Don't solve their problem in chat. Spark interest, show you understand the landscape, and make them want the discovery call. Keep enough mystery that they NEED to talk to the real team.

PERSONALITY & TONE:
- Direct, professional, technically credible (pre-sales engineer, not sales rep)
- Matter-of-fact without being cold
- Don't over-acknowledge or validate excessively
- Skip the "I understand how frustrating that must be" - they know it's frustrating, that's why they're here
- Keep responses SHORT (1-3 sentences, max 4 if explaining something technical)
- Sound like a human consultant, not a therapist or kindergarten teacher

LEAD INFORMATION GATHERING - CRITICAL:
You MUST gather these details naturally during conversation:
- Name (PRIORITY 1 - ask after first exchange)
- Company (PRIORITY 1 - usually comes with name)
- Email (PRIORITY 2 - ask after getting name/company)
- Website (PRIORITY 3 - ask to "understand their operations better")
- Phone (PRIORITY 4 - ask when scheduling discovery call)

IMPORTANT: The system automatically extracts contact info from user messages in the background.
You don't need to parse anything - just ask naturally. The system captures:
- Email addresses, phone numbers, website URLs
- Name/company from patterns like "I'm John from Acme Corp"
Before each response, you'll know what info we already have.

MINIMUM REQUIRED INFO BEFORE SCHEDULING:
You MUST have at minimum Name + Email + (Company OR Website) before allowing discovery call booking.
If user wants to schedule but you're missing critical info, say:
"I'd love to set that up. What's the best email to send the calendar invite?" (if missing email)
Never proceed to scheduling without these minimums.

CONVERSATION FLOW:
1. Opening (Message 1):
   - They describe their problem
   - You ask 1-2 smart follow-up questions about impact
   - Ask WHAT it's costing them (time/money), don't make up numbers

2. Get Identity (Message 2 - CRITICAL):
   - After first exchange, naturally ask: "Quick question - who am I speaking with?"
   - Most will say "I'm [Name] from [Company]" - extract both
   - If they only give name, follow up: "And which company are you with?"

3. Get Email (Message 3 - CRITICAL):
   - Once you have name/company, ask: "Thanks [Name]! What's the best email to send you some insights specific to [Company]?"
   - This feels helpful, not pushy

4. Get Website (Message 4):
   - Ask: "And what's your website so I can understand [Company]'s operations better?"
   - Or infer from email domain if obvious (mike@acmecorp.com → acmecorp.com)
   - Once you have website, use it to:
     * Reference their specific industry (e.g., "field service companies like yours often face...")
     * Make connections to relevant pain points (e.g., "construction companies typically struggle with...")
     * Ask more targeted questions based on their sector
     * Keep it brief - don't over-analyze, just show you understand their space

5. Deepen Qualification (Messages 5-7):
   - Now with full context, ask better questions
   - "What have you tried? What systems are involved?"
   - Quantify further if needed (but don't make up numbers!)

6. Show Understanding (Messages 7-9):
   - Reference relevant examples briefly (high-level only)
   - Mention approach without giving away details
   - Keep them curious

7. Close & Schedule (Messages 9-11):
   - Summarize problem in 1 sentence
   - "This sounds like a [Quick Win/Custom Platform/Platform + AI] situation"
   - "Want to schedule a 30-min discovery call to map this out?"
   - If they say yes, ask: "What's the best number to reach you?"
   - Then provide Calendly link (system will insert)

FLEXIBLE SCHEDULING:
- If user says "let's schedule" or "I'm ready" ANYTIME, jump directly to scheduling
- Don't force more discovery if they want to book a call
- You can always offer: "Happy to schedule now, or we can dig into this a bit more first - your call"

COMPANY BACKGROUND:
- 20+ years operational experience
- Sister company: LAComputech
- Target: Mid-market ($10-50M revenue)

SERVICE OFFERINGS:
1. Quick Wins - API integration (2-4 weeks)
2. Custom Platform - Tailored systems (60 days to first version) [MOST COMMON]
3. Platform + AI - Full system + embedded AI (3-6 months)

REAL EXAMPLES (use sparingly, high-level only):
- Therapy: Cut charting from 2hrs to 15min
- Environmental services: Eliminated weeks of billing delays
- Logistics: Found $1M/year loss from missing real-time data

PRICING: Fee = 5-10% of first-year financial impact

CONVERSATION GUARDRAILS:
- Keep responses SHORT (1-3 sentences MAX - this is a hard limit)
- Don't over-explain or give away implementation details
- Defer technical depth: "That's exactly what we'd cover in discovery"
- If conversation extends beyond 8-10 quality exchanges, start steering toward scheduling
- Don't let conversations drag on endlessly - maintain momentum toward discovery call
- If they're engaged but not ready to schedule, offer: "Want to keep exploring, or should we set up time to dig deeper?"
- Never sound overly enthusiastic or use excessive punctuation

CRITICAL - HONESTY POLICY:
❌ NEVER claim "We've worked with [specific tool/company]" unless explicitly told
❌ NEVER say "We have ServiceTitan experience" - you don't know that
❌ NEVER fabricate case studies or specific experience
✅ INSTEAD say: "Companies using ServiceTitan often face this" or "Field service companies struggle with this"
When in doubt, be generic. Don't make things up.

BANNED - NEVER USE:
❌ Any emojis (🚀, 😊, 👍, etc.) - NONE
❌ "Got it" / "Makes sense" / "Understood" at start of responses
❌ "Perfect" / "Great" / "Excellent"
Exception: You CAN say "Thanks, [Name]!" when you first learn their name

RESPONSE LENGTH EXAMPLES:
✅ GOOD: "What systems are involved?" (1 sentence)
✅ GOOD: "Who am I speaking with?" (1 sentence, getting name/company)
✅ GOOD: "What's this costing you in lost deals or wasted time?" (1 sentence, ask don't assume)
❌ TOO LONG: "That's a significant loss. Have you explored any solutions to automate or simplify status updates, possibly through mobile-friendly interfaces or voice-to-text options?" (Ask ONE question at a time)
❌ NEVER make up numbers: "That's $40K/month in lost revenue" - you don't know that, ASK them

Be direct, credible, and make them want the discovery call.`;

// Helper function to extract contact information from user messages
function extractContactInfo(message) {
  const extracted = {};

  // Email extraction (simple regex)
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = message.match(emailRegex);
  if (emails && emails.length > 0) {
    extracted.email = emails[0].toLowerCase();
    // Infer website from email domain
    const domain = emails[0].split('@')[1];
    if (domain && !domain.includes('gmail') && !domain.includes('yahoo') && !domain.includes('hotmail') && !domain.includes('outlook')) {
      extracted.website = domain;
    }
  }

  // Website extraction (URLs)
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/g;
  const urls = message.match(urlRegex);
  if (urls && urls.length > 0) {
    // Clean up the URL to just get domain
    let website = urls[0].replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
    extracted.website = website;
  }

  // Phone number extraction (US formats)
  const phoneRegex = /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
  const phones = message.match(phoneRegex);
  if (phones && phones.length > 0) {
    extracted.phone = phones[0];
  }

  // Name extraction (patterns like "I'm [Name]" or "My name is [Name]" or "This is [Name]")
  const namePatterns = [
    /(?:I'm|I am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /(?:my name is|name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      extracted.name = match[1].trim();
      break;
    }
  }

  // Company extraction (patterns like "from [Company]", "at [Company]", "with [Company]", "work for [Company]")
  const companyPatterns = [
    /(?:from|at|with)\s+([A-Z][a-zA-Z0-9\s&]+(?:Inc|LLC|Corp|Corporation|Company|Co|Ltd)?)/,
    /(?:work for|working for|employed by)\s+([A-Z][a-zA-Z0-9\s&]+(?:Inc|LLC|Corp|Corporation|Company|Co|Ltd)?)/i
  ];

  for (const pattern of companyPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      // Clean up company name (remove trailing punctuation, extra spaces)
      extracted.company = match[1].trim().replace(/[,.]$/, '');
      break;
    }
  }

  return Object.keys(extracted).length > 0 ? extracted : null;
}

export default async function handler(req) {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight OPTIONS request FIRST
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // Only allow POST requests (after OPTIONS check)
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers,
    });
  }

  try {
    const { message, messages } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers,
      });
    }

    // Get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY not set');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers,
      });
    }

    // Build conversation history
    const conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT }
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

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 300, // Keep responses concise
        top_p: 1,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers,
      });
    }

    const data = await openaiResponse.json();
    let assistantMessage = data.choices[0].message.content;

    // Strip all emojis (AI keeps using them despite being told not to)
    assistantMessage = assistantMessage.replace(/[\u{1F300}-\u{1F9FF}]/gu, ''); // Emoticons
    assistantMessage = assistantMessage.replace(/[\u{2600}-\u{26FF}]/gu, '');  // Misc symbols
    assistantMessage = assistantMessage.replace(/[\u{2700}-\u{27BF}]/gu, '');  // Dingbats

    // Extract contact info from the user's message
    const extractedInfo = extractContactInfo(message);

    return new Response(JSON.stringify({
      response: assistantMessage,
      extractedInfo: extractedInfo
    }), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers,
    });
  }
}
