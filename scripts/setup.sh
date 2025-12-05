#!/bin/bash

echo "================================================"
echo "TopSaúdeHUB - Setup Script"
echo "================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🚀 Starting the application..."
echo ""

# Build and start containers
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "================================================"
echo "✅ Application is ready!"
echo "================================================"
echo ""
echo "🌐 Frontend:      http://localhost:3000"
echo "🔧 API Backend:   http://localhost:8000"
echo "📚 API Docs:      http://localhost:8000/docs"
echo "❤️  Health Check: http://localhost:8000/health"
echo ""
echo "To view logs:     docker-compose logs -f"
echo "To stop:          docker-compose down"
echo "To restart:       docker-compose restart"
echo ""
echo "================================================"
