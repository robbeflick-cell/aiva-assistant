#!/bin/bash

# AIVA Application Startup Script
# This script starts both the backend API and frontend server

echo "======================================="
echo "  Starting AIVA Virtual Assistant"
echo "======================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file based on .env.example"
    echo "and configure your Databricks and SharePoint credentials."
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if Python dependencies are installed
echo "📦 Checking Python dependencies..."
if ! pip show flask > /dev/null 2>&1; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
else
    echo "✓ Python dependencies already installed"
fi

echo ""
echo "🚀 Starting Backend API..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

echo ""
echo "🌐 Starting Frontend Server..."
cd frontend
python -m http.server 8080 &
FRONTEND_PID=$!
cd ..

echo ""
echo "======================================="
echo "  ✓ AIVA is now running!"
echo "======================================="
echo ""
echo "Backend API:  http://localhost:5000"
echo "Frontend UI:  http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping AIVA services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✓ All services stopped"
    exit 0
}

# Register cleanup function
trap cleanup INT TERM

# Wait for user interrupt
wait
