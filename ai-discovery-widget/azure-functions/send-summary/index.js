/**
 * AI SYNC 101 DISCOVERY WIDGET - SEND SUMMARY ENDPOINT
 * Azure Function for emailing conversation transcripts
 */

const https = require('https');

module.exports = async function (context, req) {
    context.log('Send summary endpoint called');

    try {
        const { conversationId, messages, leadInfo } = req.body;

        if (!messages || messages.length === 0) {
            context.res = {
                status: 400,
                body: { error: 'Messages are required' }
            };
            return;
        }

        // Generate conversation summary
        const summary = generateSummary(messages, leadInfo);

        // Send email to AI Sync 101
        await sendEmail(summary, context);

        // If lead info provided, send email to lead as well
        if (leadInfo && leadInfo.email) {
            await sendLeadEmail(leadInfo, summary, context);
        }

        context.res = {
            status: 200,
            body: { success: true }
        };

    } catch (error) {
        context.log.error('Error sending summary:', error);
        context.res = {
            status: 500,
            body: { error: 'Failed to send summary', details: error.message }
        };
    }
};

/**
 * Generate conversation summary
 */
function generateSummary(messages, leadInfo) {
    const timestamp = new Date().toISOString();
    let painPoint = 'Not explicitly mentioned';
    let financialImpact = 'Not quantified';
    let companyContext = {};
    let currentSystems = [];

    // Parse conversation for key insights
    messages.forEach((msg, index) => {
        const content = msg.content.toLowerCase();

        // Look for pain points in first few messages
        if (index < 6 && msg.role === 'user') {
            if (content.includes('problem') || content.includes('issue') || content.includes('challenge')) {
                painPoint = msg.content;
            }
        }

        // Look for financial mentions
        if (content.includes('$') || content.includes('hour') || content.includes('time') || content.includes('cost')) {
            if (msg.role === 'user') {
                financialImpact = msg.content;
            }
        }

        // Extract company context
        if (content.includes('employee')) companyContext.employees = msg.content;
        if (content.includes('revenue')) companyContext.revenue = msg.content;
        if (content.includes('location')) companyContext.location = msg.content;
        if (content.includes('industry')) companyContext.industry = msg.content;

        // Extract systems mentioned
        const systemKeywords = ['excel', 'spreadsheet', 'quickbooks', 'salesforce', 'erp', 'crm', 'software', 'platform', 'system'];
        systemKeywords.forEach(keyword => {
            if (content.includes(keyword)) {
                currentSystems.push(msg.content);
            }
        });
    });

    // Build summary
    const transcript = messages.map(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        return `[${time}] ${msg.role.toUpperCase()}: ${msg.content}`;
    }).join('\n\n');

    return {
        timestamp,
        leadInfo,
        painPoint,
        financialImpact,
        companyContext,
        currentSystems: [...new Set(currentSystems)].slice(0, 3),
        messageCount: messages.length,
        transcript
    };
}

/**
 * Send email to AI Sync 101 team
 */
async function sendEmail(summary, context) {
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
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
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

        ${Object.keys(summary.companyContext).length > 0 ? `
        <div class="section">
            <h3>🏢 Company Context</h3>
            ${Object.entries(summary.companyContext).map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`).join('')}
        </div>
        ` : ''}

        ${summary.currentSystems.length > 0 ? `
        <div class="section">
            <h3>🔧 Current Systems Mentioned</h3>
            ${summary.currentSystems.map(sys => `<p>• ${sys}</p>`).join('')}
        </div>
        ` : ''}

        <div class="section">
            <h3>📊 Conversation Stats</h3>
            <p><strong>Total Messages:</strong> ${summary.messageCount}</p>
            <p><strong>User Engagement:</strong> ${Math.round((summary.messageCount / 2) / 15 * 100)}% of typical conversation</p>
        </div>

        <div class="transcript">
            <h3>📝 Full Conversation Transcript</h3>
            <pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px;">${summary.transcript}</pre>
        </div>

        <div class="footer">
            <p>AI Sync 101 Discovery Widget</p>
            <p>This email was automatically generated from a website conversation</p>
        </div>
    </div>
</body>
</html>
    `;

    // Use Formspree or SendGrid for actual email sending
    // For now, we'll use Formspree (same as contact form)
    const formspreeEndpoint = 'https://formspree.io/f/mlgwgavq'; // Your Formspree endpoint

    const emailData = {
        email: 'info@aisync101.com',
        subject: subject,
        message: html,
        _replyto: summary.leadInfo ? summary.leadInfo.email : 'noreply@aisync101.com',
        _format: 'html'
    };

    return sendFormspreeEmail(formspreeEndpoint, emailData, context);
}

/**
 * Send email to lead
 */
async function sendLeadEmail(leadInfo, summary, context) {
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

            <p>Thanks for taking the time to explore how AI Sync 101 can help solve your operational challenges. Based on our conversation, here's what we discussed:</p>

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

    const formspreeEndpoint = 'https://formspree.io/f/mlgwgavq';

    const emailData = {
        email: leadInfo.email,
        subject: subject,
        message: html,
        _replyto: 'info@aisync101.com',
        _format: 'html'
    };

    return sendFormspreeEmail(formspreeEndpoint, emailData, context);
}

/**
 * Send email via Formspree
 */
function sendFormspreeEmail(endpoint, data, context) {
    return new Promise((resolve, reject) => {
        const requestData = JSON.stringify(data);

        const url = new URL(endpoint);
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(requestData)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(responseData));
                } else {
                    context.log.error('Formspree error:', responseData);
                    reject(new Error(`Formspree returned status ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            context.log.error('Email request error:', error);
            reject(error);
        });

        req.write(requestData);
        req.end();
    });
}
