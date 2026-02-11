/**
 * AI SYNC 101 DISCOVERY WIDGET - SEND SUMMARY ENDPOINT
 * Vercel Edge Function for emailing conversation summaries
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

    // Generate summary
    const summary = generateSummary(messages, leadInfo);

    // Send email via Formspree
    await sendEmail(summary);

    // Send email to lead if they provided contact info
    if (leadInfo && leadInfo.email) {
      await sendLeadEmail(leadInfo, summary);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error sending summary:', error);
    return new Response(JSON.stringify({ error: 'Failed to send summary' }), {
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

async function sendEmail(summary) {
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
        .transcript { background: white; padding: 15px; border-left: 4px solid #00A3FF; margin-top: 15px; }
        .lead-info { background: #e8f4fd; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🚀 New Discovery Conversation</h2>
            <p>Date: ${new Date(summary.timestamp).toLocaleString()}</p>
        </div>

        ${summary.leadInfo ? `
        <div class="lead-info">
            <h3>📋 Lead Contact Information</h3>
            <p><strong>Name:</strong> ${summary.leadInfo.name}</p>
            <p><strong>Email:</strong> ${summary.leadInfo.email}</p>
        </div>
        ` : '<p><em>No contact information captured yet.</em></p>'}

        <div class="section">
            <h3>💡 Pain Point Identified</h3>
            <p>${summary.painPoint}</p>
        </div>

        <div class="section">
            <h3>💰 Financial Impact</h3>
            <p>${summary.financialImpact}</p>
        </div>

        <div class="section">
            <h3>📊 Conversation Stats</h3>
            <p><strong>Total Messages:</strong> ${summary.messageCount}</p>
        </div>

        <div class="transcript">
            <h3>📝 Full Conversation Transcript</h3>
            <pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px;">${summary.transcript}</pre>
        </div>
    </div>
</body>
</html>
  `;

  // Send via Formspree
  const formspreeResponse = await fetch('https://formspree.io/f/mlgwgavq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      email: 'info@aisync101.com',
      subject: subject,
      message: html,
      _replyto: summary.leadInfo ? summary.leadInfo.email : 'noreply@aisync101.com',
      _format: 'html'
    }),
  });

  if (!formspreeResponse.ok) {
    throw new Error('Failed to send email');
  }

  return true;
}

async function sendLeadEmail(leadInfo, summary) {
  const subject = `Your AI Sync 101 Discovery Summary`;

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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thanks for chatting with us, ${leadInfo.name}!</h1>
            <p>Here's a summary of our conversation</p>
        </div>

        <div class="content">
            <p>Hi ${leadInfo.name},</p>

            <p>Thanks for taking the time to explore how AI Sync 101 can help solve your operational challenges.</p>

            <h3>What We Learned:</h3>
            <ul>
                <li><strong>Your Challenge:</strong> ${summary.painPoint}</li>
                <li><strong>Potential Impact:</strong> ${summary.financialImpact}</li>
            </ul>

            <h3>Next Steps:</h3>
            <p>Our team will review your conversation and put together some tailored recommendations. We typically respond within 24 hours with:</p>
            <ul>
                <li>High-level approach for your specific situation</li>
                <li>Timeline and investment estimate</li>
                <li>Real examples from similar projects</li>
            </ul>

            <p style="text-align: center;">
                <a href="https://www.aisync101.com#contact" class="cta-button">Schedule a Discovery Call</a>
            </p>

            <p>In the meantime, feel free to reply to this email with any questions!</p>

            <p>Looking forward to working with you,<br>
            <strong>The AI Sync 101 Team</strong></p>
        </div>

        <div class="footer">
            <p><strong>AI Sync 101</strong></p>
            <p>20 Years Building Systems That Work. Now Powered by AI.</p>
            <p><a href="https://www.aisync101.com">www.aisync101.com</a></p>
        </div>
    </div>
</body>
</html>
  `;

  // Send via Formspree
  const formspreeResponse = await fetch('https://formspree.io/f/mlgwgavq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      email: leadInfo.email,
      subject: subject,
      message: html,
      _replyto: 'info@aisync101.com',
      _format: 'html'
    }),
  });

  if (!formspreeResponse.ok) {
    throw new Error('Failed to send lead email');
  }

  return true;
}
