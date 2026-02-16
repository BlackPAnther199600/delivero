# Backend Dockerfile
FROM node:18-alpine

# Use /app as container root
WORKDIR /app

# Copy only backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install --production

# Copy backend source into container
COPY backend/ .

# Make entrypoint script executable
RUN chmod +x scripts/entrypoint.sh

# Set working dir to backend for runtime
WORKDIR /app

EXPOSE 5000

# Use wrapper entrypoint that runs seed-on-start if DB empty
ENTRYPOINT ["./scripts/entrypoint.sh"]
