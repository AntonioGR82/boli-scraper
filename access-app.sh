#!/bin/bash

echo "🚀 FormBuilder Unlimited - Access Helper"
echo "========================================"
echo ""

# Check if servers are running
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000)
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/health)

echo "📊 Server Status:"
echo "Frontend (3000): $FRONTEND_STATUS"
echo "Backend (5000): $BACKEND_STATUS"
echo ""

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Your FormBuilder is READY!"
    echo ""
    echo "🌐 Try these URLs:"
    echo "   • http://127.0.0.1:3000"
    echo "   • http://localhost:3000"
    echo "   • http://172.17.0.2:3000"
    echo ""
    
    # Check for cloud environment
    if [ -n "$CODESPACES" ]; then
        echo "🚀 GitHub CodeSpaces detected!"
        echo "   Look for the 'Ports' tab and open port 3000"
    elif [ -n "$GITPOD_WORKSPACE_URL" ]; then
        echo "🚀 Gitpod detected!"
        echo "   Your URL: ${GITPOD_WORKSPACE_URL/https:/https://3000-}"
    else
        echo "💡 In cloud IDEs: Look for 'Ports' tab or 'Preview' button"
    fi
    
    echo ""
    echo "📱 Access your FormBuilder now and start creating unlimited forms!"
else
    echo "❌ Frontend not responding. Run 'npm run dev' to start servers."
fi