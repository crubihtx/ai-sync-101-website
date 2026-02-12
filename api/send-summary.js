/**
 * AI SYNC 101 DISCOVERY WIDGET - SEND SUMMARY ENDPOINT
 * Vercel Edge Function for emailing conversation summaries via Resend
 */

export const config = {
  runtime: 'edge',
};

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
    const { messages, leadInfo } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers,
      });
    }

    // Get Resend API key from environment
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not set');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers,
      });
    }

    // Generate summary
    const summary = generateSummary(messages, leadInfo);
    console.log('Generated summary for:', leadInfo);

    // Send email to you (info@aisync101.com)
    console.log('Sending email to info@aisync101.com...');
    await sendEmailToYou(summary, resendApiKey);
    console.log('Email sent to info@aisync101.com successfully');

    // Send email to lead if they provided contact info
    if (leadInfo && leadInfo.email) {
      console.log('Sending email to lead:', leadInfo.email);
      await sendEmailToLead(leadInfo, summary, resendApiKey);
      console.log('Email sent to lead successfully');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error sending summary:', error);
    return new Response(JSON.stringify({ error: 'Failed to send summary', details: error.message }), {
      status: 500,
      headers,
    });
  }
}

function generateSummary(messages, leadInfo) {
  const timestamp = new Date().toISOString();
  let painPoint = 'Not explicitly mentioned';
  let financialImpact = 'Not quantified';

  // Parse conversation for key insights
  messages.forEach((msg, index) => {
    const content = msg.content.toLowerCase();

    if (index < 6 && msg.role === 'user') {
      if (content.includes('problem') || content.includes('issue') || content.includes('challenge')) {
        painPoint = msg.content;
      }
    }

    if (content.includes('$') || content.includes('hour') || content.includes('time') || content.includes('cost')) {
      if (msg.role === 'user') {
        financialImpact = msg.content;
      }
    }
  });

  const transcript = messages.map(msg => {
    const time = new Date(msg.timestamp).toLocaleTimeString();
    return `[${time}] ${msg.role.toUpperCase()}: ${msg.content}`;
  }).join('\n\n');

  return {
    timestamp,
    leadInfo,
    painPoint,
    financialImpact,
    messageCount: messages.length,
    transcript
  };
}

async function sendEmailToYou(summary, apiKey) {
  const subject = `New Discovery Conversation${summary.leadInfo ? ` - ${summary.leadInfo.name}` : ''}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00A3FF 0%, #FF1F8F 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { background: #f5f5f5; padding: 15px; margin-bottom: 15px; border-radius: 6px; }
        .section h3 { margin-top: 0; color: #00A3FF; }
        .transcript { background: white; padding: 15px; border-left: 4px solid #00A3FF; margin-top: 15px; white-space: pre-wrap; }
        .lead-info { background: #e8f4fd; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 New Discovery Conversation</h1>
            <p>Someone just chatted with your AI Discovery Widget</p>
        </div>

        ${summary.leadInfo ? `
        <div class="lead-info">
            <h3>📧 Lead Contact Information</h3>
            <p><strong>Name:</strong> ${summary.leadInfo.name}</p>
            <p><strong>Email:</strong> ${summary.leadInfo.email}</p>
        </div>
        ` : ''}

        <div class="section">
            <h3>🔍 Key Insights</h3>
            <p><strong>Pain Point:</strong> ${summary.painPoint}</p>
            <p><strong>Financial Impact:</strong> ${summary.financialImpact}</p>
            <p><strong>Messages Exchanged:</strong> ${summary.messageCount}</p>
            <p><strong>Timestamp:</strong> ${new Date(summary.timestamp).toLocaleString()}</p>
        </div>

        <div class="section">
            <h3>💬 Full Conversation</h3>
            <div class="transcript">${summary.transcript}</div>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; text-align: center;">
            <p style="color: #666; margin: 0;">This summary was generated by your AI Discovery Widget</p>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Powered by AI Sync 101</p>
        </div>
    </div>
</body>
</html>
  `;

  // Send via Resend
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AI Discovery Widget <onboarding@resend.dev>',
      to: ['info@aisync101.com'],
      subject: subject,
      html: html,
      reply_to: summary.leadInfo ? summary.leadInfo.email : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return true;
}

async function sendEmailToLead(leadInfo, summary, apiKey) {
  const subject = `Thanks for chatting with AI Sync 101!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00A3FF 0%, #FF1F8F 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
        .content { padding: 20px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #00A3FF 0%, #FF1F8F 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        .summary-box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thanks for chatting, ${leadInfo.name}!</h1>
            <p>Here's what we discussed</p>
        </div>

        <div class="content">
            <p>Hi ${leadInfo.name},</p>

            <p>Thanks for taking the time to explore how AI Sync 101 can help solve your operational challenges. I wanted to send you a quick summary of our conversation.</p>

            <div class="summary-box">
                <h3 style="margin-top: 0; color: #00A3FF;">What We Learned:</h3>
                <p><strong>Your Challenge:</strong> ${summary.painPoint}</p>
                <p><strong>Potential Impact:</strong> ${summary.financialImpact}</p>
            </div>

            <p><strong>Next Steps:</strong></p>
            <p>Based on our conversation, I think there's a real opportunity to help streamline your operations and save significant time/money. The best way forward is a quick 30-minute discovery call with our team to:</p>
            <ul>
                <li>Dive deeper into your specific challenges</li>
                <li>Explore potential solutions tailored to your needs</li>
                <li>Give you concrete examples of how we've solved similar problems</li>
                <li>Outline a clear path forward (if it makes sense)</li>
            </ul>

            <div style="text-align: center;">
                <a href="https://www.aisync101.com#contact" class="cta-button">Schedule a Discovery Call</a>
            </div>

            <p>Looking forward to continuing the conversation!</p>

            <p>Best regards,<br>
            <strong>The AI Sync 101 Team</strong></p>
        </div>

        <div class="footer">
            <p><strong>AI Sync 101</strong><br>
            Custom platforms and intelligent automation for mid-market companies<br>
            Sister company to LAComputech</p>
            <p style="margin-top: 15px;">
                <a href="https://www.aisync101.com" style="color: #00A3FF; text-decoration: none;">www.aisync101.com</a> |
                <a href="mailto:info@aisync101.com" style="color: #00A3FF; text-decoration: none;">info@aisync101.com</a>
            </p>
        </div>
    </div>
</body>
</html>
  `;

  // Send via Resend
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AI Sync 101 <onboarding@resend.dev>',
      to: [leadInfo.email],
      subject: subject,
      html: html,
      reply_to: 'info@aisync101.com',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return true;
}
