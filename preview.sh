#!/bin/bash

# AI Sync 101 - Local UI Preview
# This starts a local server to preview UI changes before deploying

echo "🎨 Starting local UI preview server..."
echo ""
echo "📍 Open in browser: http://localhost:8000"
echo "💡 Note: Widget will show UI but chat won't work (no backend locally)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
python3 -m http.server 8000
