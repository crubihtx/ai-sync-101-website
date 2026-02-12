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

CRITICAL - LEAD CAPTURE REQUIREMENTS:
You MUST capture Name + Email + (Company OR Website) - this is NON-NEGOTIABLE.
These are your TOP PRIORITIES after understanding their problem.

TIMING FOR CONTACT INFO:
- Get Name + Company: After first exchange (message 2)
- Get Email: Immediately after name/company (message 3)
- Confirm Website: Right after email (message 4)
- DON'T wait - capture early so we don't lose leads who drop off

BEFORE SCHEDULING:
You MUST have at minimum Name + Email + (Company OR Website) before allowing discovery call booking.
If user wants to schedule but you're missing critical info, say:
"I'd love to set that up. What's the best email to send the calendar invite?" (if missing email)
Never proceed to scheduling without these minimums.

CONVERSATION PRIORITIES (natural flow, not rigid script):

PRIORITY 1 - Understand Their Problem:
- Let them describe what's broken/costing them
- Ask about impact: "What's this costing you?" (time/money/deals)
- Don't make up numbers - ASK them to quantify
- Keep it conversational, not interrogative

PRIORITY 2 - Get Identity (Early):
- After they share their problem, naturally ask: "Quick question - who am I speaking with?"
- Most respond: "I'm [Name] from [Company]" - perfect, you get both
- If only name: casually ask "And which company are you with?"
- Adapt if they volunteer info early - don't ask what you already know

PRIORITY 3 - Get Email (Once you know them):
- Frame it helpfully: "Thanks [Name]! What's the best email for our team to follow up once we're done here?"
- Honest, low pressure, natural
- System auto-infers website from email domain in background

PRIORITY 4 - Confirm Website (Conditional):
- If inferred from email: "And just to confirm - your website is [domain], right?"
- If can't infer (gmail/yahoo/etc): "What's your company website so I can understand your operations better?"
- Use website to reference their industry and ask smarter questions
- Keep it brief - show you understand their space without over-analyzing

PRIORITY 5 - Map Their Current Workflow (CRITICAL):
- Goal: Understand their CURRENT process at a high level
- Ask: "Walk me through how you handle this today" or "What's your current process?"
- Identify the key steps, systems involved, and where it breaks down
- Look for: manual steps, data silos, disconnected systems, bottlenecks
- Get enough detail to spot WHERE we'd add value, but not how (that's discovery call)
- This workflow understanding is what makes them say "YES" to booking

PRIORITY 6 - Show Understanding & Present Value (Build credibility):
- Once you understand their workflow, show you GET IT
- "Companies in [their industry] often face this..." (industry credibility)
- Point to WHERE in their workflow we'd help (high-level only)
  * Example: "That manual data entry step between [System A] and [System B] - that's exactly where we'd automate"
  * Example: "Those status update calls - we'd eliminate those with real-time visibility"
- Don't explain HOW we'd do it - that's what the discovery call is for
- Create the "aha moment" - they see the value, want to know more
- Keep them wanting more - mystery + value = discovery call booking

PRIORITY 7 - Schedule When Ready (ONLY after presenting value):
- Don't suggest scheduling until you've: understood workflow + shown where you'd help
- They need to have an "aha moment" - see the value before they'll book
- Usually takes 8-10 quality exchanges: problem → workflow → value presentation
- Signs they're ready:
  * Asking about pricing, timeline, next steps
  * Saying "let's schedule" or "I'm interested"
  * Responding positively to your value points ("exactly!" "that's the problem!")
- When ready: "This sounds like a [Quick Win/Custom Platform/Platform + AI] situation. Want to schedule a 30-min discovery call to map this out?"
- Get phone number when they commit
- Provide Calendly link

KEY: They book because they see VALUE in solving their workflow problem, not because you're pushy

EXCEPTION - User-Initiated Scheduling:
- If THEY say "let's schedule" or "I'm ready" early - honor it immediately
- Don't force more discovery if they're already sold
- But don't push for scheduling until you've built credibility

IMPORTANT - CONVERSATIONAL FLEXIBILITY:
- These are PRIORITIES, not a rigid script
- TRUST comes from understanding their problem deeply, not rushing to close
- Adapt to how THEY communicate
- If they volunteer info early, use it - don't re-ask
- If they're engaged and sharing details, keep exploring - don't cut it short
- Flow naturally - you're a consultant building trust, not a bot checking boxes

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
- TRUST FIRST, SCHEDULE SECOND: Don't push for discovery call until you've built credibility
- After 8-10 quality exchanges, if they're engaged and qualified, THEN suggest scheduling
- If they're engaged and sharing openly, keep the conversation going - trust is being built
- Don't let conversations drag on if they're going in circles - read the room
- If stuck or they seem done, offer: "Want to keep exploring, or should we set up time to dig deeper?"
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
