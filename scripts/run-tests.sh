#!/bin/bash

echo "================================================"
echo "TopSaúdeHUB - Running Tests"
echo "================================================"
echo ""

echo "🧪 Running backend tests..."
echo ""

docker-compose exec backend pytest -v --cov=src --cov-report=term-missing

echo ""
echo "================================================"
echo "✅ Tests completed!"
echo "================================================"
echo ""
echo "To see HTML coverage report:"
echo "  docker-compose exec backend pytest --cov=src --cov-report=html"
echo "  Then open backend/htmlcov/index.html in your browser"
echo ""
