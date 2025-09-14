#!/bin/bash

echo "🎵 Setting up Music Community Database..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "DATABASE_URL=\"file:./dev.db\"" > .env
  echo "PORT=3001" >> .env
  echo "CORS_ORIGIN=\"http://localhost:3000\"" >> .env
  echo "📝 Created .env file with default configuration"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma db push

# Seed the database
echo "🌱 Seeding database with 120 musician profiles..."
npm run seed

echo "✅ Database setup complete!"
echo ""
echo "🚀 To start the server:"
echo "   npm run dev"
echo ""
echo "📡 Available endpoints:"
echo "   http://localhost:3001/api/health      - Health check"
echo "   http://localhost:3001/api/users       - User management"
echo "   http://localhost:3001/api/search      - Search musicians"
echo "   http://localhost:3001/api/messages    - Messaging system"
echo ""
echo "🗄️ Database file location: ./dev.db"