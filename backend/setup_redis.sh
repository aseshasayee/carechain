#!/bin/bash
# Redis Setup Script for CareChain Real-time Messaging

echo "🚀 CareChain Real-time Messaging Setup"
echo "======================================"

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "❌ Redis is not installed on your system"
    echo "Please install Redis from: https://redis.io/download"
    echo ""
    echo "For Windows:"
    echo "1. Download and install Redis from Microsoft or use WSL"
    echo "2. Or use Docker: docker run -d -p 6379:6379 redis:latest"
    echo ""
    echo "For macOS:"
    echo "brew install redis"
    echo ""
    echo "For Ubuntu/Debian:"
    echo "sudo apt update && sudo apt install redis-server"
    exit 1
fi

# Check if Redis is running
if ! redis-cli ping &> /dev/null; then
    echo "⚠️  Redis is not running, starting Redis server..."
    
    # Start Redis in background
    redis-server --daemonize yes --port 6379
    
    # Wait a moment for Redis to start
    sleep 2
    
    # Check again
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis server started successfully!"
    else
        echo "❌ Failed to start Redis server"
        echo "Please start Redis manually:"
        echo "redis-server"
        exit 1
    fi
else
    echo "✅ Redis is already running!"
fi

# Test Redis connection
echo ""
echo "🔧 Testing Redis connection..."
REDIS_RESPONSE=$(redis-cli ping)
if [ "$REDIS_RESPONSE" = "PONG" ]; then
    echo "✅ Redis connection test successful!"
else
    echo "❌ Redis connection test failed"
    exit 1
fi

# Test Redis channels (used by Django Channels)
echo ""
echo "🔧 Testing Redis channels..."
redis-cli config set notify-keyspace-events Ex > /dev/null
echo "✅ Redis channels configured!"

# Display Redis info
echo ""
echo "📊 Redis Information:"
echo "Port: 6379"
echo "Host: localhost"
echo "Database 0: Celery & Channel Layers"
echo "Database 1: Cache"

echo ""
echo "🎉 Redis setup complete!"
echo ""
echo "Next steps:"
echo "1. Start your Django development server: python manage.py runserver"
echo "2. Open candidate_chat.html or recruiter_chat.html"
echo "3. Test real-time messaging!"
echo ""
echo "To stop Redis: redis-cli shutdown"
