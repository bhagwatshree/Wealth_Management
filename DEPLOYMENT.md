# Deployment Guide

This guide covers deploying the Wealth Management platform in development, staging, and production environments.

---

## Table of Contents

1. [Development Setup](#1-development-setup)
2. [Production Deployment](#2-production-deployment)
3. [Docker Deployment](#3-docker-deployment)
4. [Environment Configuration](#4-environment-configuration)
5. [SSL/TLS Certificates](#5-ssltls-certificates)
6. [Fineract Backend Setup](#6-fineract-backend-setup)
7. [Reverse Proxy (Nginx)](#7-reverse-proxy-nginx)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Development Setup

### Prerequisites

| Requirement | Version |
| ----------- | ------- |
| Node.js     | v18+    |
| npm         | v9+     |
| OpenSSL     | Any     |
| Git         | Any     |

### Step-by-step

```bash
# Clone
git clone https://github.com/bhagwatshree/Wealth_Management.git
cd Wealth_Management

# Generate self-signed SSL certificates
mkdir -p certs
openssl req -x509 -newkey rsa:2048 \
  -keyout certs/key.pem \
  -out certs/cert.pem \
  -days 365 -nodes \
  -subj "/CN=localhost"

# Install all dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Create server environment file
cat > server/.env << 'EOF'
PORT=4000
FINERACT_BASE_URL=https://localhost:8443/fineract-provider/api/v1
FINERACT_USERNAME=mifos
FINERACT_PASSWORD=password
FINERACT_TENANT_ID=default
CORS_ORIGIN=https://localhost:5173
SSL_KEY=../certs/key.pem
SSL_CERT=../certs/cert.pem
EOF

# Start both client and server
npm run dev
```

**Access the application:**
- Frontend: https://localhost:5173
- Backend API: https://localhost:4000
- Health check: https://localhost:4000/api/health

> Accept the browser's self-signed certificate warning to proceed.

---

## 2. Production Deployment

### 2a. Build the Client

```bash
cd client
npm ci
npm run build
```

This produces an optimized static bundle in `client/dist/`.

### 2b. Prepare the Server

```bash
cd server
npm ci --omit=dev
```

### 2c. Configure Production Environment

Create `server/.env` with production values:

```env
PORT=4000
FINERACT_BASE_URL=https://fineract.yourcompany.com/fineract-provider/api/v1
FINERACT_USERNAME=<production-username>
FINERACT_PASSWORD=<production-password>
FINERACT_TENANT_ID=<tenant-id>
CORS_ORIGIN=https://wealth.yourcompany.com
SSL_KEY=/etc/ssl/private/wealth-key.pem
SSL_CERT=/etc/ssl/certs/wealth-cert.pem
```

### 2d. Start the Server

```bash
cd server
NODE_ENV=production node src/index.js
```

### 2e. Serve the Client

**Option A — Serve via Nginx** (recommended, see [Section 7](#7-reverse-proxy-nginx))

**Option B — Serve via a static file server**

```bash
npx serve client/dist -l 5173 --ssl-cert certs/cert.pem --ssl-key certs/key.pem
```

### 2f. Process Manager (PM2)

Use PM2 to keep the server running and auto-restart on failure:

```bash
npm install -g pm2

# Start the server
pm2 start server/src/index.js --name wealth-server --env production

# Save process list for auto-start on reboot
pm2 save
pm2 startup
```

**Useful PM2 commands:**

```bash
pm2 status              # Check running processes
pm2 logs wealth-server  # View logs
pm2 restart wealth-server
pm2 stop wealth-server
```

---

## 3. Docker Deployment

### Dockerfile (Server)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

COPY server/ ./server/

# Copy certs
COPY certs/ ./certs/

# Copy environment
COPY server/.env ./server/.env

EXPOSE 4000

WORKDIR /app/server
CMD ["node", "src/index.js"]
```

### Dockerfile (Client)

```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  server:
    build:
      context: .
      dockerfile: Dockerfile.server
    ports:
      - "4000:4000"
    env_file:
      - server/.env
    volumes:
      - ./certs:/app/certs:ro
    restart: unless-stopped

  client:
    build:
      context: .
      dockerfile: Dockerfile.client
    ports:
      - "443:443"
    volumes:
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - server
    restart: unless-stopped
```

```bash
docker-compose up -d
```

---

## 4. Environment Configuration

### Required Variables

| Variable             | Description                     | Example                              |
| -------------------- | ------------------------------- | ------------------------------------ |
| `PORT`               | Server HTTPS port               | `4000`                               |
| `FINERACT_BASE_URL`  | Fineract API URL                | `https://fineract:8443/.../api/v1`   |
| `FINERACT_USERNAME`  | Fineract auth username          | `mifos`                              |
| `FINERACT_PASSWORD`  | Fineract auth password          | `password`                           |
| `FINERACT_TENANT_ID` | Fineract tenant                 | `default`                            |
| `CORS_ORIGIN`        | Frontend origin for CORS        | `https://wealth.yourcompany.com`     |
| `SSL_KEY`            | Path to SSL private key         | `/etc/ssl/private/key.pem`           |
| `SSL_CERT`           | Path to SSL certificate         | `/etc/ssl/certs/cert.pem`            |

### Optional Variables

| Variable              | Default         | Description                        |
| --------------------- | --------------- | ---------------------------------- |
| `DXL_AUTO_VERIFY_KYC` | `false`         | Auto-verify KYC during onboarding  |
| `NAV_UPDATE_CRON`     | `0 18 * * 1-5`  | NAV update cron (weekdays 6 PM)    |
| `SFTP_DEFAULT_PORT`   | `22`            | SFTP port for fund file ingestion  |
| `SFTP_TIMEOUT`        | `30000`         | SFTP connection timeout (ms)       |
| `BATCH_DATA_DIR`      | `../data`       | Directory for batch data files     |

---

## 5. SSL/TLS Certificates

### Development (Self-Signed)

```bash
mkdir -p certs
openssl req -x509 -newkey rsa:2048 \
  -keyout certs/key.pem \
  -out certs/cert.pem \
  -days 365 -nodes \
  -subj "/CN=localhost"
```

### Production

Use certificates from a trusted CA (e.g., Let's Encrypt, DigiCert):

```bash
# Let's Encrypt with certbot
sudo certbot certonly --standalone -d wealth.yourcompany.com

# Certificates will be at:
# /etc/letsencrypt/live/wealth.yourcompany.com/fullchain.pem
# /etc/letsencrypt/live/wealth.yourcompany.com/privkey.pem
```

Update `server/.env`:
```env
SSL_CERT=/etc/letsencrypt/live/wealth.yourcompany.com/fullchain.pem
SSL_KEY=/etc/letsencrypt/live/wealth.yourcompany.com/privkey.pem
```

### Auto-Renewal (Let's Encrypt)

```bash
# Add to crontab
0 0 1 * * certbot renew --quiet && pm2 restart wealth-server
```

---

## 6. Fineract Backend Setup

The application requires an Apache Fineract instance as its core banking backend.

### Quick Start with Docker

```bash
docker run -d \
  --name fineract \
  -p 8443:8443 \
  apache/fineract:latest
```

### Default Credentials

| Setting    | Value                                                    |
| ---------- | -------------------------------------------------------- |
| URL        | `https://localhost:8443/fineract-provider/api/v1`        |
| Username   | `mifos`                                                  |
| Password   | `password`                                               |
| Tenant ID  | `default`                                                |

### Verify Fineract is Running

```bash
curl -k -u mifos:password \
  -H "Fineract-Platform-TenantId: default" \
  https://localhost:8443/fineract-provider/api/v1/offices
```

---

## 7. Reverse Proxy (Nginx)

For production, use Nginx to serve the client static files and proxy API requests to the Express server.

### nginx.conf

```nginx
server {
    listen 443 ssl http2;
    server_name wealth.yourcompany.com;

    ssl_certificate     /etc/ssl/certs/wealth-cert.pem;
    ssl_certificate_key /etc/ssl/private/wealth-key.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;

    # Serve React client
    root /var/www/wealth-management/client/dist;
    index index.html;

    # Client-side routing — serve index.html for all non-API/non-file routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Express server
    location /api/ {
        proxy_pass https://127.0.0.1:4000;
        proxy_ssl_verify off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name wealth.yourcompany.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 8. Troubleshooting

### Certificate errors in browser

**Cause:** Self-signed certificate not trusted.
**Fix:** Accept the certificate warning, or import `certs/cert.pem` into your browser/OS trust store.

### `ECONNREFUSED` on Fineract calls

**Cause:** Fineract is not running or URL is incorrect.
**Fix:**
```bash
# Verify Fineract is reachable
curl -k https://localhost:8443/fineract-provider/api/v1/offices \
  -u mifos:password -H "Fineract-Platform-TenantId: default"
```

### Port already in use

```bash
# Find process using port 4000
lsof -i :4000    # Linux/Mac
netstat -ano | findstr :4000   # Windows

# Kill the process or change PORT in .env
```

### CORS errors

**Cause:** `CORS_ORIGIN` in `.env` does not match the client URL.
**Fix:** Ensure `CORS_ORIGIN` exactly matches the client origin (protocol + host + port), e.g., `https://localhost:5173`.

### Module not found errors

```bash
# Clean install all dependencies
rm -rf node_modules client/node_modules server/node_modules
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### Client proxy not reaching server

**Cause:** Server is not running or not on port 4000.
**Fix:** Ensure the server is running on the port specified in `client/vite.config.js` proxy target (`https://localhost:4000`).
