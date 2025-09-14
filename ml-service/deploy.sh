#!/bin/bash

# Music Query Parser - Quick Deploy Script
# Deploys the service in under 30 minutes

echo "🎵 Music Query Parser - Quick Deploy"
echo "=================================="

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🔧 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Run setup script
echo "🔧 Running setup..."
python3 setup.py

# Check if .env file has OpenAI key
if [ -f ".env" ]; then
    if grep -q "your_openai_api_key_here" .env; then
        echo "⚠️  WARNING: Please update your OpenAI API key in .env file"
        echo "The service will run with spaCy fallback only"
    fi
else
    echo "⚠️  WARNING: .env file not found. Creating from template..."
    cp .env.example .env
    echo "Please update your OpenAI API key in .env file"
fi

# Start the service
echo ""
echo "🚀 Starting Music Query Parser service..."
echo "Service will be available at: http://localhost:5002"
echo ""
echo "Available endpoints:"
echo "- POST /parse - Parse music queries"
echo "- GET /examples - View sample queries"
echo "- GET /health - Health check"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

# Load environment variables and start
export $(cat .env | grep -v '^#' | xargs)
python3 app.py