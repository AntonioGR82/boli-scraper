#!/bin/bash

echo "🌐 Getting Public URL for Customer Access"
echo "========================================"
echo ""

# Check if app is running
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000)
if [ "$STATUS" != "200" ]; then
    echo "❌ App not running on port 3000. Start with 'npm run dev' first."
    exit 1
fi

echo "✅ FormBuilder is running locally"
echo ""

echo "🔗 Choose your option:"
echo ""
echo "1️⃣  QUICK & FREE (Temporary URL):"
echo "   Run: npx localtunnel --port 3000"
echo "   Gets: https://random-name.loca.lt"
echo ""

echo "2️⃣  NGROK (Better for demos):"
echo "   Install: curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null"
echo "   Run: ngrok http 3000"
echo "   Gets: https://random.ngrok.io"
echo ""

echo "3️⃣  PRODUCTION DEPLOYMENT:"
echo "   • Deploy to Vercel, Netlify, or your server"
echo "   • Get permanent domain like: https://your-formbuilder.com"
echo ""

echo "🎯 For immediate customer access, try option 1:"
echo "   npx localtunnel --port 3000"
echo ""