/**
 * EMAIL SERVICE
 * Sends summary emails using Resend
 */

const { Resend } = require('resend');

// Initialize Resend (API key from environment)
const resend = new Resend(process.env.RESEND_API_KEY);

// Email recipients (from environment or default)
const TEAM_EMAIL = process.env.TEAM_EMAIL || 'team@aisync101.com';

function formatTranscript(messages) {
  return messages
    .map(msg => {
      const role = msg.role === 'user' ? 'VISITOR' : 'AI';
      const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
      return `[${role}${timestamp ? ' - ' + timestamp : ''}]:\n${msg.content}\n`;
    })
    .join('\n');
}

function generateEmailHTML(analysis, messages) {
  const {
    contactInfo,
    mainProblem,
    identifiedProblems,
    currentWorkflow,
    proposedSolution,
    quantifiedImpact,
    engagementLevel,
    wantsToSchedule,
    metadata
  } = analysis;

  const engagementColor = {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#6b7280'
  }[engagementLevel] || '#6b7280';

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
      ${new Date(metadata.timestamp).toLocaleString()} • ${metadata.conversationLength} messages
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

    <!-- Main Problem -->
    ${mainProblem ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">🔥 Main Problem (Their Priority)</h2>
      <p style="margin: 0; font-size: 16px; color: #1f2937;">${mainProblem}</p>
    </div>` : ''}

    <!-- All Identified Problems -->
    ${identifiedProblems.length > 0 ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">🔍 All Identified Problems</h2>
      <ol style="margin: 0; padding-left: 20px;">
        ${identifiedProblems.map(p => `<li style="margin-bottom: 8px;">${p}</li>`).join('')}
      </ol>
    </div>` : ''}

    <!-- Current Workflow -->
    ${currentWorkflow ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">⚙️ Current Workflow</h2>
      <p style="margin: 0; font-family: monospace; background: #f3f4f6; padding: 15px; border-radius: 4px; font-size: 14px;">
        ${currentWorkflow}
      </p>
    </div>` : ''}

    <!-- Proposed Solution -->
    ${proposedSolution ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">💡 Proposed Solution</h2>
      <p style="margin: 0; font-family: monospace; background: #f3f4f6; padding: 15px; border-radius: 4px; font-size: 14px;">
        ${proposedSolution}
      </p>
    </div>` : ''}

    <!-- Quantified Impact -->
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

async function sendSummaryEmail(analysis, messages) {
  const subject = analysis.contactInfo.name && analysis.contactInfo.company
    ? `Discovery: ${analysis.contactInfo.name} from ${analysis.contactInfo.company}`
    : analysis.contactInfo.company
    ? `Discovery: ${analysis.contactInfo.company}`
    : analysis.contactInfo.name
    ? `Discovery: ${analysis.contactInfo.name}`
    : `Discovery Conversation - ${analysis.engagementLevel} engagement`;

  const htmlContent = generateEmailHTML(analysis, messages);

  // Send email via Resend
  const result = await resend.emails.send({
    from: 'AI Discovery Widget <widget@aisync101.com>',
    to: TEAM_EMAIL,
    subject: subject,
    html: htmlContent,
  });

  return result;
}

module.exports = { sendSummaryEmail };
