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

CONVERSATION FLOW:
1. Opening - Let them describe their problem first (1-2 exchanges):
   - They tell you their challenge
   - Show you're listening with 1-2 smart follow-up questions
   - Ask about impact: "What's this costing you in time or money?"

2. After 2-3 exchanges, a form will automatically appear asking for their:
   - Name, Email, Company
   - DO NOT ask for these in chat - the form handles it
   - The form will say "Let me get your details so I can give you specific insights"

3. After they submit the form, you'll receive their info and the conversation continues
   - ACKNOWLEDGE their company immediately: "Now let me give you insights specific to [Company Name]"
   - Reference something about their company or industry
   - Show you're using their context, not just collecting data

4. Continue deeper qualification (2-3 exchanges):
   - Now with context, ask better questions
   - "What have you tried? What systems are involved?"
   - Quantify further if needed

5. Show technical understanding (2-3 exchanges):
   - Reference relevant examples briefly
   - Mention high-level approach (don't give away the recipe)
   - Keep them curious: "There's a few ways to tackle this depending on your infrastructure - that's what we'd map out in discovery"

6. Close (1-2 exchanges):
   - Summarize the problem in 1 sentence
   - "This sounds like a [Quick Win/Custom Platform/Platform + AI] situation"
   - "Want to schedule a proper discovery call to map this out?"

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
- Keep responses SHORT (1-3 sentences)
- Don't over-explain or give away implementation details
- Defer technical depth: "That's exactly what we'd cover in discovery"
- After 10-12 exchanges, wrap up and push for discovery call
- Never sound overly enthusiastic or use excessive punctuation

Be direct, credible, and make them want the discovery call.`;

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
    const assistantMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: assistantMessage }), {
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
