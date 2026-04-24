#!/bin/bash

set -e

echo "============================================"
echo "  AI Genealogy DNA Insight Analyzer"
echo "  Starting Application..."
echo "============================================"

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# Function to clean up ports
cleanup_ports() {
  echo ""
  echo "[*] Cleaning up ports $BACKEND_PORT and $FRONTEND_PORT..."
  lsof -ti:$BACKEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
  lsof -ti:$FRONTEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
  echo "[✓] Ports cleaned"
}

# Function to cleanup on exit
cleanup() {
  echo ""
  echo "[*] Shutting down..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  cleanup_ports
  echo "[✓] Shutdown complete"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Clean up any processes on our ports
cleanup_ports

# Check if PostgreSQL is running
echo ""
echo "[*] Checking PostgreSQL..."
if ! pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} > /dev/null 2>&1; then
  echo "[!] PostgreSQL is not running. Attempting to start..."
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || {
    echo "[✗] Could not start PostgreSQL. Please start it manually."
    exit 1
  }
  sleep 2
fi
echo "[✓] PostgreSQL is running"

# Create database if it doesn't exist
echo ""
echo "[*] Setting up database..."
psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME:-genealogy_dna}'" 2>/dev/null | grep -q 1 || \
  createdb -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} ${DB_NAME:-genealogy_dna} 2>/dev/null || true
echo "[✓] Database ready"

# Install backend dependencies
echo ""
echo "[*] Installing backend dependencies..."
cd backend
npm install --silent
echo "[✓] Backend dependencies installed"

# Run seed script
echo ""
echo "[*] Seeding database..."
node seed.js
echo "[✓] Database seeded"

# Start backend with nodemon (hot reload)
echo ""
echo "[*] Starting backend on port $BACKEND_PORT with hot reload..."
npx nodemon server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "[*] Waiting for backend..."
for i in {1..30}; do
  if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
    echo "[✓] Backend is ready"
    break
  fi
  sleep 1
done

# Install frontend dependencies
echo ""
echo "[*] Installing frontend dependencies..."
cd frontend
npm install --silent
echo "[✓] Frontend dependencies installed"

# Start frontend with Vite (hot reload built-in)
echo ""
echo "[*] Starting frontend on port $FRONTEND_PORT with hot reload..."
npx vite --port $FRONTEND_PORT --host &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================"
echo "  Application is running!"
echo "  Frontend: http://localhost:$FRONTEND_PORT"
echo "  Backend:  http://localhost:$BACKEND_PORT"
echo "  Press Ctrl+C to stop"
echo "============================================"
echo ""

# Wait for both processes
wait
