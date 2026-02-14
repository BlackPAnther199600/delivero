#!/bin/bash

# Script to setup the project locally

echo "🚀 Setting up Delivero..."

# Create .env files
echo "📝 Creating .env file..."
cp backend/.env.example backend/.env

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your database and Stripe credentials"
echo "2. Create PostgreSQL database: psql -U postgres -d delivero -f backend/src/config/database.sql"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm start"
echo ""
echo "Or use Docker Compose:"
echo "docker-compose up -d"
