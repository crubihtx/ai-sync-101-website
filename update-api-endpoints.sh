#!/bin/bash

# ==========================================
# UPDATE WIDGET TO USE VERCEL API ENDPOINTS
# ==========================================

echo "🔧 Updating AI Discovery Widget API endpoints..."

# Check if Vercel URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Vercel URL"
    echo ""
    echo "Usage: ./update-api-endpoints.sh https://your-vercel-url.vercel.app"
    echo ""
    echo "Example: ./update-api-endpoints.sh https://ai-sync-101-website.vercel.app"
    exit 1
fi

VERCEL_URL=$1

# Remove trailing slash if present
VERCEL_URL="${VERCEL_URL%/}"

echo "📝 Vercel URL: $VERCEL_URL"
echo ""

# Backup original file
cp ai-discovery-widget/widget-script.js ai-discovery-widget/widget-script.js.backup
echo "✅ Created backup: ai-discovery-widget/widget-script.js.backup"

# Update chat endpoint (line 8)
sed -i '' "s|apiEndpoint: '/api/chat'|apiEndpoint: '${VERCEL_URL}/api/chat'|g" ai-discovery-widget/widget-script.js
echo "✅ Updated chat endpoint"

# Update send-summary endpoint (line 374)
sed -i '' "s|'/api/send-summary'|'${VERCEL_URL}/api/send-summary'|g" ai-discovery-widget/widget-script.js
echo "✅ Updated send-summary endpoint"

echo ""
echo "🎉 Done! API endpoints updated to use Vercel."
echo ""
echo "Next steps:"
echo "1. Review changes: git diff ai-discovery-widget/widget-script.js"
echo "2. Commit and push to deploy"
echo ""
