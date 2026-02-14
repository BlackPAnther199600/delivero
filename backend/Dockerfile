# Backend Dockerfile
FROM node:18-alpine

# Use /app as container root
WORKDIR /app

# Copy only backend package files from repo root to ensure correct deps are installed
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install --production

# Copy backend source into container
COPY backend/ ./backend/

# Set working dir to backend for runtime
WORKDIR /app/backend

EXPOSE 5000

CMD ["npm", "start"]
