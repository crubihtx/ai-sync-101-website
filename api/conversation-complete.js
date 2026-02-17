/**
 * CONVERSATION TRACKER - VERCEL SERVERLESS FUNCTION
 * Receives completed conversations and sends summary emails via Resend
 * Using Node.js runtime for reliable environment variable access
 *
 * CRITICAL: Edge Runtime does NOT pass environment variables reliably
 * Switched to Node.js runtime to fix environment variable access
 */

export const config = {
  runtime: 'nodejs',
};

// ==========================================
// CONVERSATION ANALYZER
// ==========================================

function extractContactInfo(text) {
  const extracted = {};

  // Email extraction
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  if (emails && emails.length > 0) {
    extracted.email = emails[0].toLowerCase();
  }

  // Phone number extraction (US formats)
  const phoneRegex = /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
  const phones = text.match(phoneRegex);
  if (phones && phones.length > 0) {
    extracted.phone = phones[0];
  }

  // Website extraction
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/g;
  const urls = text.match(urlRegex);
  if (urls && urls.length > 0) {
    let website = urls[0].replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
    extracted.website = website;
  }

  // Name extraction
  const namePatterns = [
    /(?:I'm|I am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /(?:my name is|name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:speaking with|talking to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      extracted.name = match[1].trim();
      break;
    }
  }

  // Company extraction
  const companyPatterns = [
    /(?:from|at|with)\s+([A-Z][a-zA-Z0-9\s&]+(?:Inc|LLC|Corp|Corporation|Company|Co|Ltd)?)/,
    /(?:work for|working for)\s+([A-Z][a-zA-Z0-9\s&]+(?:Inc|LLC|Corp|Corporation|Company|Co|Ltd)?)/i,
  ];

  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      extracted.company = match[1].trim().replace(/[,.]$/, '');
      break;
    }
  }

  return extracted;
}

function analyzeConversation(messages) {
  const analysis = {
    contactInfo: {},
    mainProblem: null,
    identifiedProblems: [],
    currentWorkflow: null,
    proposedSolution: null,
    quantifiedImpact: [],
    engagementLevel: 'unknown',
    wantsToSchedule: false,
  };

  let allText = '';
  let userMessages = [];
  let aiMessages = [];

  messages.forEach(msg => {
    allText += msg.content + ' ';
    if (msg.role === 'user') {
      userMessages.push(msg.content);
    } else if (msg.role === 'assistant') {
      aiMessages.push(msg.content);
    }
  });

  // Extract contact info
  analysis.contactInfo = extractContactInfo(allText);

  // Detect scheduling intent
  const scheduleKeywords = ['yes', 'schedule', 'book', 'call', 'meeting'];
  const lastFewUserMessages = userMessages.slice(-5).join(' ').toLowerCase();
  analysis.wantsToSchedule = scheduleKeywords.some(kw => lastFewUserMessages.includes(kw));

  // Find identified problems
  const problemListIndex = aiMessages.findIndex(msg =>
    msg.includes('causing you the most pain') || msg.includes('I\'m seeing a few potential gaps')
  );

  if (problemListIndex >= 0) {
    const problemMessage = aiMessages[problemListIndex];
    const problems = problemMessage.match(/\d\.\s+([^\n]+)/g);
    if (problems) {
      analysis.identifiedProblems = problems.map(p => p.replace(/^\d\.\s+/, '').trim());

      // Find which problem user picked
      const userResponseAfterList = userMessages[problemListIndex + 1];
      if (userResponseAfterList) {
        const numberMatch = userResponseAfterList.match(/^(\d)/);
        if (numberMatch) {
          const pickedIndex = parseInt(numberMatch[1]) - 1;
          analysis.mainProblem = analysis.identifiedProblems[pickedIndex] || analysis.identifiedProblems[0];
        } else {
          analysis.mainProblem = userResponseAfterList;
        }
      }
    }
  }

  // Extract workflows
  const workflowIndex = aiMessages.findIndex(msg =>
    msg.includes('CURRENT workflow:') || msg.includes('PROPOSED workflow:')
  );

  if (workflowIndex >= 0) {
    const workflowMessage = aiMessages[workflowIndex];
    const currentMatch = workflowMessage.match(/CURRENT[^:]*:\s*([^.]+(?:\.\s*PROPOSED|$))/i);
    if (currentMatch) {
      analysis.currentWorkflow = currentMatch[1].replace(/PROPOSED.*$/i, '').trim();
    }

    const proposedMatch = workflowMessage.match(/PROPOSED[^:]*:\s*([^.]+\.)/i);
    if (proposedMatch) {
      analysis.proposedSolution = proposedMatch[1].trim();
    }
  }

  // Extract quantified impacts
  const impactPatterns = [
    /\$[\d,]+(?:\s*(?:per|\/)\s*(?:month|year|week))?/gi,
    /\d+\s*(?:hours?|days?|weeks?|months?)/gi,
    /\d+%/g
  ];

  impactPatterns.forEach(pattern => {
    const matches = allText.match(pattern);
    if (matches) {
      analysis.quantifiedImpact.push(...matches);
    }
  });

  // Determine engagement level
  if (analysis.wantsToSchedule && analysis.contactInfo.phone) {
    analysis.engagementLevel = 'high';
  } else if (analysis.wantsToSchedule || analysis.contactInfo.email) {
    analysis.engagementLevel = 'medium';
  } else if (messages.length < 10) {
    analysis.engagementLevel = 'low';
  } else {
    analysis.engagementLevel = 'medium';
  }

  return analysis;
}

// ==========================================
// EMAIL TEMPLATE
// ==========================================

function formatTranscript(messages) {
  return messages
    .map(msg => {
      const role = msg.role === 'user' ? 'VISITOR' : 'AI';
      const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
      return `[${role}${timestamp ? ' - ' + timestamp : ''}]:\n${msg.content}\n`;
    })
    .join('\n');
}

function generateEmailHTML(analysis, messages, metadata) {
  const {
    contactInfo,
    mainProblem,
    identifiedProblems,
    currentWorkflow,
    proposedSolution,
    quantifiedImpact,
    engagementLevel,
    wantsToSchedule,
  } = analysis;

  const engagementColor = {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#6b7280'
  }[engagementLevel] || '#6b7280';

  const timestamp = metadata?.timestamp || new Date().toISOString();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Discovery Conversation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0 0 10px 0; font-size: 28px;">New Discovery Conversation</h1>
    <p style="margin: 0; opacity: 0.9; font-size: 14px;">
      ${new Date(timestamp).toLocaleString()} • ${messages.length} messages
    </p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">

    <!-- Contact Information -->
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">📋 Contact Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${contactInfo.name ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600; width: 120px;">Name:</td>
          <td style="padding: 8px 0;">${contactInfo.name}</td>
        </tr>` : ''}
        ${contactInfo.email ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:${contactInfo.email}" style="color: #667eea; text-decoration: none;">${contactInfo.email}</a></td>
        </tr>` : ''}
        ${contactInfo.phone ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Phone:</td>
          <td style="padding: 8px 0;"><a href="tel:${contactInfo.phone}" style="color: #667eea; text-decoration: none;">${contactInfo.phone}</a></td>
        </tr>` : ''}
        ${contactInfo.company ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Company:</td>
          <td style="padding: 8px 0;">${contactInfo.company}</td>
        </tr>` : ''}
        ${contactInfo.website ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Website:</td>
          <td style="padding: 8px 0;"><a href="http://${contactInfo.website}" target="_blank" style="color: #667eea; text-decoration: none;">${contactInfo.website}</a></td>
        </tr>` : ''}
      </table>
      ${!contactInfo.name && !contactInfo.email && !contactInfo.phone ?
        '<p style="color: #ef4444; margin: 0;">⚠️ No contact information captured</p>' : ''}
    </div>

    <!-- Engagement & Next Steps -->
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${engagementColor};">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">🎯 Engagement Level</h2>
      <div style="display: inline-block; padding: 8px 16px; background: ${engagementColor}; color: white; border-radius: 20px; font-weight: 600; text-transform: uppercase; font-size: 12px; margin-bottom: 10px;">
        ${engagementLevel}
      </div>
      ${wantsToSchedule ? `
      <p style="margin: 10px 0 0 0; color: #10b981; font-weight: 600;">
        ✅ Lead wants to schedule a discovery call
      </p>` : `
      <p style="margin: 10px 0 0 0; color: #6b7280;">
        Did not explicitly request scheduling
      </p>`}
    </div>

    ${mainProblem ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">🔥 Main Problem (Their Priority)</h2>
      <p style="margin: 0; font-size: 16px; color: #1f2937;">${mainProblem}</p>
    </div>` : ''}

    ${identifiedProblems.length > 0 ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">🔍 All Identified Problems</h2>
      <ol style="margin: 0; padding-left: 20px;">
        ${identifiedProblems.map(p => `<li style="margin-bottom: 8px;">${p}</li>`).join('')}
      </ol>
    </div>` : ''}

    ${currentWorkflow ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">⚙️ Current Workflow</h2>
      <p style="margin: 0; font-family: monospace; background: #f3f4f6; padding: 15px; border-radius: 4px; font-size: 14px;">
        ${currentWorkflow}
      </p>
    </div>` : ''}

    ${proposedSolution ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">💡 Proposed Solution</h2>
      <p style="margin: 0; font-family: monospace; background: #f3f4f6; padding: 15px; border-radius: 4px; font-size: 14px;">
        ${proposedSolution}
      </p>
    </div>` : ''}

    ${quantifiedImpact.length > 0 ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">📊 Quantified Impact</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        ${quantifiedImpact.slice(0, 8).map(impact =>
          `<span style="background: #f3f4f6; padding: 8px 12px; border-radius: 4px; font-weight: 600; color: #1f2937;">${impact}</span>`
        ).join('')}
      </div>
    </div>` : ''}

    <!-- Full Transcript -->
    <div style="background: white; padding: 20px; border-radius: 8px;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">💬 Full Transcript</h2>
      <div style="background: #1f2937; color: #f9fafb; padding: 20px; border-radius: 4px; font-family: monospace; font-size: 13px; max-height: 500px; overflow-y: auto; white-space: pre-wrap; line-height: 1.8;">
${formatTranscript(messages)}
      </div>
    </div>

  </div>

  <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      AI Sync 101 Discovery Widget • Conversation Tracker
    </p>
  </div>

</body>
</html>
  `.trim();
}

// ==========================================
// MAIN HANDLER
// ==========================================

export default async function handler(req) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers,
    });
  }

  try {
    // Access environment variables in Edge Runtime
    // Debug: Check all possible variable names
    const RESEND_API_KEY = process.env.RESEND_KEY || process.env.RESEND_API_KEY;
    const TEAM_EMAIL = process.env.TEAM_EMAIL || 'carlos@computech.support';

    // Debug logging (safe - doesn't log actual keys)
    console.log('Environment check:', {
      hasRESEND_KEY: !!process.env.RESEND_KEY,
      hasRESEND_API_KEY: !!process.env.RESEND_API_KEY,
      hasTEAM_EMAIL: !!process.env.TEAM_EMAIL,
      finalKeyPresent: !!RESEND_API_KEY,
      teamEmail: TEAM_EMAIL
    });

    const { messages, metadata } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length < 10) {
      return new Response(JSON.stringify({ error: 'Minimum 10 messages required' }), {
        status: 400,
        headers,
      });
    }

    console.log(`Processing conversation with ${messages.length} messages`);

    // Analyze conversation
    const analysis = analyzeConversation(messages);

    // Generate email subject
    const subject = analysis.contactInfo.name && analysis.contactInfo.company
      ? `Discovery: ${analysis.contactInfo.name} from ${analysis.contactInfo.company}`
      : analysis.contactInfo.company
      ? `Discovery: ${analysis.contactInfo.company}`
      : analysis.contactInfo.name
      ? `Discovery: ${analysis.contactInfo.name}`
      : `Discovery Conversation - ${analysis.engagementLevel} engagement`;

    // Generate email HTML
    const htmlContent = generateEmailHTML(analysis, messages, metadata);

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AI Discovery Widget <widget@aisync101.com>',
        to: [TEAM_EMAIL],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error('Resend API error - Status:', emailResponse.status);
      console.error('Resend API error - Response:', error);

      return new Response(JSON.stringify({
        error: 'Failed to send email',
        status: emailResponse.status,
        details: error,
        apiKeyPresent: !!RESEND_API_KEY,
        teamEmail: TEAM_EMAIL
      }), {
        status: 500,
        headers,
      });
    }

    const result = await emailResponse.json();
    console.log('Email sent successfully:', result);

    return new Response(JSON.stringify({
      success: true,
      message: 'Conversation processed and email sent',
      emailId: result.id
    }), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error processing conversation:', error);
    return new Response(JSON.stringify({
      error: 'Failed to process conversation',
      message: error.message
    }), {
      status: 500,
      headers,
    });
  }
}
