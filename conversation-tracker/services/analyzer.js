/**
 * CONVERSATION ANALYZER
 * Extracts structured data from conversation messages
 */

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

  // Name extraction (patterns like "I'm [Name]" or "My name is [Name]" or "This is [Name]")
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

  // Company extraction (patterns like "from [Company]", "at [Company]", "with [Company]")
  const companyPatterns = [
    /(?:from|at|with)\s+([A-Z][a-zA-Z0-9\s&]+(?:Inc|LLC|Corp|Corporation|Company|Co|Ltd)?)/,
    /(?:work for|working for|employed by)\s+([A-Z][a-zA-Z0-9\s&]+(?:Inc|LLC|Corp|Corporation|Company|Co|Ltd)?)/i,
    /(?:I'm [A-Z][a-z]+(?:\s+[A-Z][a-z]+)? from)\s+([A-Z][a-zA-Z0-9\s&]+)/
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
    conversationSummary: ''
  };

  let allText = '';
  let userMessages = [];
  let aiMessages = [];

  // Separate messages and build full text
  messages.forEach(msg => {
    allText += msg.content + ' ';

    if (msg.role === 'user') {
      userMessages.push(msg.content);
    } else if (msg.role === 'assistant') {
      aiMessages.push(msg.content);
    }
  });

  // Extract contact info from all text
  analysis.contactInfo = extractContactInfo(allText);

  // Detect if user wants to schedule
  const scheduleKeywords = ['yes', 'schedule', 'book', 'call', 'meeting', 'let\'s talk'];
  const lastFewUserMessages = userMessages.slice(-5).join(' ').toLowerCase();
  analysis.wantsToSchedule = scheduleKeywords.some(kw => lastFewUserMessages.includes(kw));

  // Identify main problem from AI's "which is causing you the most pain" question
  const problemListIndex = aiMessages.findIndex(msg =>
    msg.includes('causing you the most pain') || msg.includes('I\'m seeing a few potential gaps')
  );

  if (problemListIndex >= 0) {
    const problemMessage = aiMessages[problemListIndex];
    const problems = problemMessage.match(/\d\.\s+([^\n]+)/g);
    if (problems) {
      analysis.identifiedProblems = problems.map(p => p.replace(/^\d\.\s+/, '').trim());

      // Find user's response to see which they picked
      const userResponseAfterList = userMessages[problemListIndex + 1];
      if (userResponseAfterList) {
        const numberMatch = userResponseAfterList.match(/^(\d)/);
        if (numberMatch) {
          const pickedIndex = parseInt(numberMatch[1]) - 1;
          analysis.mainProblem = analysis.identifiedProblems[pickedIndex] || analysis.identifiedProblems[0];
        } else {
          // They might have described it instead of picking a number
          analysis.mainProblem = userResponseAfterList;
        }
      }
    }
  }

  // Extract workflow if AI painted it
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

  // Extract quantified impacts (dollar amounts, time delays, percentages)
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

  // Generate brief summary
  const firstUserMessage = userMessages[0] || 'No initial message';
  analysis.conversationSummary = `Started with: "${firstUserMessage.substring(0, 100)}${firstUserMessage.length > 100 ? '...' : ''}"`;

  return analysis;
}

module.exports = { analyzeConversation, extractContactInfo };
