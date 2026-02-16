#!/bin/sh
# Entrypoint wrapper: run seed-on-start if DB empty, then start server

echo "🔧 Running seed-on-start check..."
node scripts/seed-on-start.js

echo "🚀 Starting backend server..."
exec npm start
