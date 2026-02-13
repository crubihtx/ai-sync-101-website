/**
 * CONVERSATION TRACKER SERVICE
 * Receives completed conversations from the widget and sends summary emails
 * Deploy to Render.com as a web service
 */

const express = require('express');
const cors = require('cors');
const { analyzeConversation } = require('./services/analyzer');
const { sendSummaryEmail } = require('./services/emailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for long conversations

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'conversation-tracker' });
});

// Main endpoint - receive conversation and send email
app.post('/api/conversation-complete', async (req, res) => {
  try {
    const { messages, metadata } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    console.log(`Processing conversation with ${messages.length} messages`);

    // Analyze the conversation
    const analysis = analyzeConversation(messages);

    // Add metadata (timestamp, etc.)
    analysis.metadata = {
      conversationLength: messages.length,
      timestamp: new Date().toISOString(),
      ...(metadata || {})
    };

    // Send email to team
    const emailResult = await sendSummaryEmail(analysis, messages);

    console.log('Email sent successfully:', emailResult);

    res.json({
      success: true,
      message: 'Conversation processed and email sent',
      emailId: emailResult.id
    });

  } catch (error) {
    console.error('Error processing conversation:', error);
    res.status(500).json({
      error: 'Failed to process conversation',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Conversation tracker service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
