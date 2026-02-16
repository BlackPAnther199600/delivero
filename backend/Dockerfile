# Backend Dockerfile
FROM node:18-alpine

# Use /app as container root
WORKDIR /app

# Copy only backend package files from repo root to ensure correct deps are installed
COPY package*.json ./

# Install backend dependencies
RUN npm install --production

# Copy backend source into container
COPY . .

# Set working dir to backend for runtime
WORKDIR /app

EXPOSE 5000

CMD ["npm", "start"]
