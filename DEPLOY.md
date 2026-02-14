# Deployment Guide - Delivero

Complete guide for deploying Delivero to production environments.

## Table of Contents

1. [Docker Compose Deployment](#docker-compose-deployment)
2. [Cloud Deployment (Heroku)](#cloud-deployment-heroku)
3. [AWS Deployment](#aws-deployment)
4. [SSL/TLS Setup](#ssltls-setup)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)

## Docker Compose Deployment

**Recommended for:** Small to medium deployments, on-premise servers

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Server with 4GB RAM minimum
- Port 80/443 available

### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

### Step 2: Clone & Setup

```bash
# Clone repository
git clone https://github.com/yourusername/delivero.git
cd delivero

# Create production .env files
cat > backend/.env << 'EOF'
DB_HOST=postgres
DB_PORT=5432
DB_NAME=delivero
DB_USER=postgres
DB_PASSWORD=change-this-password
NODE_ENV=production
PORT=5000
AUTH_SECRET=your-super-secret-key-change-me
JWT_SECRET=another-secret-key
EOF

cat > frontend/.env << 'EOF'
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENV=production
EOF

# Secure permissions
chmod 600 backend/.env frontend/.env
```

### Step 3: Build & Start

```bash
# Build images
docker-compose build

# Start services (detached)
docker-compose up -d

# Verify all containers running
docker-compose ps
```

**Output should show 3 containers:**
```
NAME            STATUS
postgres        Up 2 minutes
backend         Up 2 minutes
frontend        Up 2 minutes
```

### Step 4: Verify Installation

```bash
# Backend health check
curl http://localhost:5000/health

# Frontend access
curl http://localhost:3000

# Check logs
docker-compose logs -f backend
```

### Scaling the Deployment

**Run multiple backend instances:**

Update `docker-compose.yml`:

```yaml
backend:
  build: ./backend
  deploy:
    replicas: 3
  environment:
    - DB_HOST=postgres
  depends_on:
    - postgres
  networks:
    - delivero-net
```

**Load balance with Nginx:**

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx-lb.conf:/etc/nginx/nginx.conf
  depends_on:
    - backend
```

## Cloud Deployment (Heroku)

**Recommended for:** Rapid deployment, auto-scaling, managed hosting

### Prerequisites

- Heroku Account (free or paid)
- Heroku CLI installed
- Git repository

### Step 1: Heroku Setup

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create delivero-app

# Check app created
heroku apps:info
```

### Step 2: Add PostgreSQL

```bash
# Add PostgreSQL addon (free)
heroku addons:create heroku-postgresql:hobby-dev

# Get database URL
heroku config:get DATABASE_URL
```

### Step 3: Configure Environment

```bash
# Set environment variables
heroku config:set \
  NODE_ENV=production \
  AUTH_SECRET=your-production-secret \
  JWT_SECRET=your-jwt-secret \
  REACT_APP_API_URL=https://delivero-app.herokuapp.com/api

# Verify config
heroku config
```

### Step 4: Create Procfile

```bash
# backend/Procfile
web: node src/app.js
release: node src/config/db.js
```

### Step 5: Deploy

```bash
# Deploy from Git
git push heroku main

# Monitor deployment
heroku logs --tail

# Check status
heroku ps
```

### Scaling on Heroku

```bash
# Scale dynos
heroku ps:scale web=2

# Monitor metrics
heroku metrics
```

## AWS Deployment

**Recommended for:** Enterprise, high-traffic, complex infrastructure

### Architecture

```
Route 53 (DNS)
    ↓
CloudFront (CDN)
    ↓
ALB (Application Load Balancer)
    ↓
ECS (Elastic Container Service)
    ├── backend tasks
    ├── frontend tasks
    └── postgres RDS
```

### Step 1: RDS PostgreSQL Setup

```bash
# Create RDS instance (via AWS Console)
# - Engine: PostgreSQL 15
# - Instance: db.t3.micro
# - Storage: 20GB gp3
# - Backup: 7 days
# - Multi-AZ: Yes (production)
```

### Step 2: ECR (Container Registry)

```bash
# Create ECR repositories
aws ecr create-repository --repository-name delivero-backend
aws ecr create-repository --repository-name delivero-frontend

# Login to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# Build & push backend
docker build -t delivero-backend:latest ./backend
docker tag delivero-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/delivero-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/delivero-backend:latest
```

### Step 3: ECS Deployment

**Create task definition:**

```json
{
  "family": "delivero-backend",
  "containerDefinitions": [{
    "name": "backend",
    "image": "<account-id>.dkr.ecr.<region>.amazonaws.com/delivero-backend:latest",
    "memory": 512,
    "portMappings": [{
      "containerPort": 5000
    }],
    "environment": [
      {"name": "DB_HOST", "value": "rds-endpoint"},
      {"name": "NODE_ENV", "value": "production"}
    ]
  }]
}
```

**Create service:**

```bash
aws ecs create-service \
  --cluster delivero-cluster \
  --service-name delivero-backend \
  --task-definition delivero-backend \
  --desired-count 2 \
  --load-balancers targetGroupArn=<ARN>
```

### Step 4: ALB Configuration

```bash
# Create target groups
aws elbv2 create-target-group \
  --name delivero-backend \
  --protocol HTTP \
  --port 5000 \
  --vpc-id <vpc-id>

# Create load balancer
aws elbv2 create-load-balancer \
  --name delivero-alb \
  --subnets <subnet-1> <subnet-2>
```

### Step 5: CloudFront CDN

```bash
# Create distribution (via AWS Console)
# - Origin: ALB
# - Behaviors: cache static assets
# - TTL: 1 year for /static/*
```

## SSL/TLS Setup

### Nginx with Self-Signed Certificate

```bash
# Generate certificate (dev/test only)
openssl req -x509 -newkey rsa:4096 -nodes \
  -out /etc/nginx/certs/cert.pem \
  -keyout /etc/nginx/certs/key.pem \
  -days 365
```

**nginx.conf:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://frontend:80;
    }

    location /api {
        proxy_pass http://backend:5000;
    }
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Let's Encrypt Certificate

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renew (cron job)
sudo certbot renew --quiet

# Crontab entry
0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring & Maintenance

### Docker Health Checks

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Logging

**Centralized logging with ELK:**

```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
```

### Backup Strategy

**Automated daily backups:**

```bash
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker exec postgres pg_dump -U postgres delivero | \
  gzip > $BACKUP_DIR/delivero_$TIMESTAMP.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/delivero_$TIMESTAMP.sql.gz s3://delivero-backups/

# Keep only last 7 days locally
find $BACKUP_DIR -name "delivero_*.sql.gz" -mtime +7 -delete
```

Schedule with cron:
```
0 2 * * * /scripts/backup.sh
```

### Monitoring with Prometheus

```yaml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
```

## Troubleshooting

### Container "Exiting with code 1"

```bash
# View container logs
docker-compose logs backend

# Check environment variables
docker inspect backend | grep -A 50 "Env"

# Rebuild container
docker-compose build --no-cache backend
```

### Database Connection Failed

```bash
# Test PostgreSQL connection
docker exec postgres psql -U postgres -c "SELECT 1;"

# Check container networking
docker network inspect delivero-net

# Restart services
docker-compose restart postgres
docker-compose restart backend
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port in docker-compose.yml
ports:
  - "5001:5000"
```

### Frontend Shows "Cannot GET"

```bash
# Clear nginx cache
docker-compose exec frontend nginx -s reload

# Check nginx logs
docker-compose logs frontend

# Verify build succeeded
docker build ./frontend --progress=plain
```

### Memory Issues

```bash
# Check memory usage
docker stats

# Limit container memory
# In docker-compose.yml:
services:
  backend:
    mem_limit: 512m
    memswap_limit: 1g
```

## Maintenance Tasks

### Update Containers

```bash
# Pull latest images
docker-compose pull

# Rebuild local images
docker-compose build

# Restart services
docker-compose up -d

# Clean up old images
docker image prune -a
```

### Database Maintenance

```bash
# Run VACUUM to clean up database
docker exec postgres psql -U postgres -d delivero -c "VACUUM ANALYZE;"

# Monitor table sizes
docker exec postgres psql -U postgres -d delivero -c "
  SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
  FROM pg_tables 
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### Security Updates

```bash
# Check for vulnerabilities
docker scout cves delivero-backend:latest

# Update base images
docker pull postgres:15-alpine
docker pull node:18-alpine
docker-compose build --no-cache
```

---

**Last Updated:** 2024
**Delivero Deployment v1.0.0**
