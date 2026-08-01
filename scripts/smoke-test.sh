#!/bin/bash
# Smoke test: Verify the complete docker-compose stack is healthy

set -e

FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8000"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"

echo "=== GestorProyectos Smoke Test ==="
echo ""

# Check if docker-compose is running
echo "Checking docker-compose status..."
docker-compose ps | grep -q "gestor-postgres" || {
  echo "❌ Stack is not running. Run 'docker-compose up -d' first."
  exit 1
}
echo "✓ docker-compose is running"
echo ""

# Check postgres health
echo "Checking PostgreSQL connectivity..."
docker-compose exec -T postgres pg_isready -U gestor -d gestor_proyectos > /dev/null 2>&1 && {
  echo "✓ PostgreSQL is healthy"
} || {
  echo "❌ PostgreSQL is not responding"
  exit 1
}
echo ""

# Check backend health
echo "Checking FastAPI backend..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" || echo "000")
if [ "$response" = "200" ]; then
  health=$(curl -s "$BACKEND_URL/health")
  echo "✓ Backend is responding: $health"
else
  echo "❌ Backend returned HTTP $response (expected 200)"
  exit 1
fi
echo ""

# Check frontend
echo "Checking React frontend..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" || echo "000")
if [ "$response" = "200" ]; then
  echo "✓ Frontend is responding (HTTP 200)"
else
  echo "❌ Frontend returned HTTP $response (expected 200)"
  exit 1
fi
echo ""

# Verify database tables
echo "Checking database schema..."
tables=$(docker-compose exec -T postgres psql -U gestor -d gestor_proyectos -t -c "SELECT string_agg(tablename, ', ') FROM pg_tables WHERE schemaname='public'" 2>/dev/null || echo "")
if [[ "$tables" == *"projects"* ]] && [[ "$tables" == *"tasks"* ]]; then
  echo "✓ Required tables exist"
else
  echo "❌ Missing required tables"
  exit 1
fi
echo ""

echo "=== ✓ All smoke tests passed ==="
echo ""
echo "Stack is ready:"
echo "  Frontend:   $FRONTEND_URL"
echo "  Backend:    $BACKEND_URL"
echo "  Postgres:   $POSTGRES_HOST:$POSTGRES_PORT"
