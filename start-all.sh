#!/bin/bash

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║          SpeedTest Pro - Starting Application        ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🚀 Starting Backend..."
./start-backend.sh > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start. Check backend.log for details."
    exit 1
fi

# Check backend health
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Backend health check failed!"
    cleanup
fi

echo ""
echo "🚀 Starting Frontend..."
./start-frontend.sh > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a bit for frontend to start
sleep 5

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║          SpeedTest Pro is now running!               ║"
echo "║                                                       ║"
echo "║  Frontend: http://localhost:5173                     ║"
echo "║  Backend:  http://localhost:8080                     ║"
echo "║  Health:   http://localhost:8080/actuator/health     ║"
echo "║                                                       ║"
echo "║  Press Ctrl+C to stop all services                   ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Keep script running
wait
