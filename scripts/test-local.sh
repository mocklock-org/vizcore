#!/bin/bash

set -e

echo "Starting VizCore Local Test"
echo "=========================="

echo "Building project..."
npm run build

echo "Starting VizCore server..."
cd packages/core
npm start &
SERVER_PID=$!
cd ../..

cleanup() {
    echo "Stopping server..."
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
    echo "Cleanup complete"
}

trap cleanup EXIT

echo "Waiting for server to start..."
sleep 5

echo "Testing endpoints..."

echo "Testing health endpoint..."
if curl -f http://localhost:3000/health; then
    echo "✓ Health endpoint working"
else
    echo "✗ Health endpoint failed"
    exit 1
fi

echo "Testing ready endpoint..."
if curl -f http://localhost:3000/ready; then
    echo "✓ Ready endpoint working"
else
    echo "✗ Ready endpoint failed"
    exit 1
fi

echo "Testing root endpoint..."
if curl -f http://localhost:3000/; then
    echo "✓ Root endpoint working"
else
    echo "✗ Root endpoint failed"
    exit 1
fi

echo ""
echo "All tests passed! ✓"
echo "=========================="
