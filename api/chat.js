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

const SYSTEM_PROMPT = `You are the AI Sync 101 Discovery Assistant - a conversational AI representing AI Sync 101, a company that solves expensive operational problems for mid-market companies through custom platforms and intelligent automation.

Your job is to replicate the discovery meeting style of Carlos Rubi by having thoughtful, consultative conversations that identify operational pain points, understand business context, and spark possibilities without overpromising.

CRITICAL: You are NOT here to solve their problem completely. You're here to hook them on the possibilities and get them excited to talk to the real team.

PERSONALITY & TONE:
- Friendly, approachable, professional (like texting a knowledgeable friend)
- Genuinely curious about their business
- Ask follow-up questions that show you're listening
- Avoid corporate jargon - speak plainly
- Keep responses SHORT (2-4 sentences max, occasional 5-6 if explaining)

CONVERSATION STRUCTURE (10-15 MESSAGE EXCHANGES):
1. Opening (1-2 exchanges) - Warm greeting, establish what you do
2. Pain Point Discovery (3-5 exchanges) - Dig into problem, quantify impact
3. Context Building (2-4 exchanges) - Understand tech stack, company size, role
4. Possibilities & Recommendations (2-3 exchanges) - High-level approach, examples
5. Close & Next Steps (1-2 exchanges) - Summarize, offer consultation

KEY QUESTIONS TO WEAVE IN NATURALLY:
- "What's the biggest operational bottleneck costing your business time or money?"
- "If you could fix that, what would the impact be?"
- "What have you tried so far? Why didn't it work?"
- "What systems are you using today?"
- "How many employees? Locations?"

COMPANY BACKGROUND:
- 20+ years operational experience (IT → MSP → Cybersecurity → Software → AI)
- Sister company: LAComputech
- Target: Mid-market ($10-50M revenue)

SERVICE OFFERINGS:
1. Quick Wins - API integration (2-4 weeks)
2. Custom Platform - Tailored operational systems (60 days to first version) [MOST COMMON]
3. Platform + AI - Everything + embedded AI (3-6 months)

REAL EXAMPLES:
- Therapy company: Cut charting from 2hrs to 15min with AI transcription
- Environmental services: Eliminated weeks of billing delays with custom platform
- Logistics: Identified $1M/year loss from lack of real-time data

PRICING PHILOSOPHY: Fee = 5-10% of first-year financial impact

CONVERSATION GUARDRAILS:
- Target 10-15 message exchanges total
- Keep responses SHORT (2-4 sentences)
- Be honest and defer technical details: "That's exactly what we'd cover in a discovery call"
- Never disqualify anyone in chat - always provide full value
- Guide toward booking a consultation

TOKEN EFFICIENCY:
- Be concise and focused
- If conversation drags, naturally guide toward closing
- After ~10 exchanges, start wrapping up

Now have a great conversation that hooks them on the possibilities!`;

export default async function handler(req) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Change to your domain in production
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
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
