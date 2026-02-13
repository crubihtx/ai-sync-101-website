# Conversation Tracker Service

Backend service that receives completed conversations from the AI Discovery Widget and sends summary emails to the team.

## Features

- Analyzes conversation to extract:
  - Contact info (name, email, phone, company, website)
  - Main problem identified
  - Current workflow
  - Proposed solution
  - Quantified impact (costs, time delays)
  - Engagement level (high/medium/low)

- Sends formatted email summary via Resend
- Full conversation transcript included

## Deployment to Render

### 1. Create Resend Account & API Key

1. Go to https://resend.com and sign up
2. Verify your domain OR use their test domain (onboarding.resend.dev)
3. Go to API Keys → Create API Key
4. Copy the key (starts with `re_`)

### 2. Deploy to Render

1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `conversation-tracker`
   - **Root Directory**: `conversation-tracker`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables:
   - `RESEND_API_KEY`: Your Resend API key
   - `TEAM_EMAIL`: Your email (e.g., carlos@computech.support)

6. Click "Create Web Service"

### 3. Get Your Service URL

After deployment, Render will give you a URL like:
`https://conversation-tracker-xxxx.onrender.com`

Save this URL - you'll need it for the widget configuration.

### 4. Test the Service

```bash
curl https://your-service-url.onrender.com/health
```

Should return:
```json
{"status":"healthy","service":"conversation-tracker"}
```

## Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your RESEND_API_KEY and TEAM_EMAIL

# Run locally
npm start
```

Test locally:
```bash
curl -X POST http://localhost:3000/api/conversation-complete \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "I need help with billing delays"},
      {"role": "assistant", "content": "What is causing the delay?"}
    ]
  }'
```

## API Endpoints

### `GET /health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "service": "conversation-tracker"
}
```

### `POST /api/conversation-complete`
Receives completed conversation and sends summary email

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "message text",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ],
  "metadata": {
    "source": "widget",
    "sessionId": "abc123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation processed and email sent",
  "emailId": "email-id-from-resend"
}
```

## Next Steps

After deploying this service, you need to:

1. Update the widget to detect conversation end (idle timeout)
2. POST conversation data to this service
3. See `../ai-discovery-widget/widget-script.js` for integration

## Email Template

The service sends a beautifully formatted HTML email with:
- Contact information (name, email, phone, company, website)
- Engagement level badge (high/medium/low)
- Main problem (user's priority)
- All identified problems
- Current workflow (as mapped)
- Proposed solution (if discussed)
- Quantified impacts ($ amounts, time delays)
- Full conversation transcript

## Cost

- **Render Free Tier**: 750 hours/month (enough for 24/7 uptime)
- **Resend Free Tier**: 3,000 emails/month, 100 emails/day

Both are more than sufficient for this use case.
