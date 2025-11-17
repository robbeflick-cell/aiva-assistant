# AIVA Deployment Guide

This document provides step-by-step instructions for deploying AIVA to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Prerequisites

### Required Access
- [ ] Databricks workspace access with SQL warehouse permissions
- [ ] SharePoint site access with read permissions
- [ ] Azure AD app registration capabilities
- [ ] Production hosting environment (AWS, Azure, or on-premises)

### Required Software
- [ ] Python 3.8+
- [ ] pip package manager
- [ ] Git
- [ ] SSL certificates for HTTPS
- [ ] Web server (nginx, Apache, or cloud equivalent)

---

## Environment Setup

### 1. Create Production Environment File

```bash
cp .env.example .env.production
```

### 2. Configure Production Variables

Edit `.env.production` with production values:

```bash
# Databricks - Production
DATABRICKS_SERVER_HOSTNAME=prod-databricks.cloud.databricks.com
DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/prod-warehouse-id
DATABRICKS_ACCESS_TOKEN=<production-token>

# SharePoint - Production
SHAREPOINT_SITE_URL=https://frontiercorp1.sharepoint.com/sites/FoneRepository
SHAREPOINT_CLIENT_ID=<production-client-id>
SHAREPOINT_CLIENT_SECRET=<production-client-secret>
SHAREPOINT_TENANT_ID=<tenant-id>

# Application - Production
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5000
ALLOWED_ORIGINS=https://aiva.frontier.com
```

### 3. Secure Secrets Management

**Option A: Environment Variables (recommended for cloud)**
```bash
# AWS Systems Manager Parameter Store
aws ssm put-parameter --name /aiva/prod/databricks-token --value "..." --type SecureString

# Azure Key Vault
az keyvault secret set --vault-name aiva-vault --name databricks-token --value "..."

# Google Cloud Secret Manager
gcloud secrets create databricks-token --data-file=-
```

**Option B: Secrets File (for on-premises)**
- Store `.env.production` in a secure location
- Set proper file permissions: `chmod 600 .env.production`
- Restrict access to application user only

---

## Database Configuration

### 1. Verify Databricks Table

```sql
-- Check table exists and has data
SELECT COUNT(*) FROM hackathon.hackathon_hack_it.fictitious_customer_data_3;

-- Verify columns
DESCRIBE hackathon.hackathon_hack_it.fictitious_customer_data_3;

-- Test query performance
EXPLAIN SELECT * FROM hackathon.hackathon_hack_it.fictitious_customer_data_3 
WHERE btn = '2436476063';
```

### 2. Create Indexes (if needed)

```sql
-- Create index on BTN column for faster lookups
CREATE INDEX IF NOT EXISTS idx_btn 
ON hackathon.hackathon_hack_it.fictitious_customer_data_3(btn);
```

### 3. Set Up Service Account

Create a dedicated Databricks service account with read-only access:

```sql
-- Grant SELECT permission only
GRANT SELECT ON TABLE hackathon.hackathon_hack_it.fictitious_customer_data_3 
TO SERVICE PRINCIPAL aiva-prod-user;
```

---

## Backend Deployment

### Option 1: AWS EC2 / Azure VM

#### 1. Provision Server

```bash
# Ubuntu 22.04 LTS recommended
# Minimum: 2 vCPU, 4GB RAM, 20GB storage
```

#### 2. Install Dependencies

```bash
sudo apt update
sudo apt install -y python3.11 python3-pip python3-venv nginx
```

#### 3. Deploy Application

```bash
# Clone repository
cd /opt
sudo git clone <repository-url> aiva
cd aiva

# Create virtual environment
sudo python3 -m venv venv
sudo chown -R aiva-user:aiva-user /opt/aiva

# Switch to application user
sudo su - aiva-user
cd /opt/aiva
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn
```

#### 4. Create Systemd Service

```bash
sudo nano /etc/systemd/system/aiva-backend.service
```

```ini
[Unit]
Description=AIVA Backend API
After=network.target

[Service]
Type=notify
User=aiva-user
WorkingDirectory=/opt/aiva/backend
Environment="PATH=/opt/aiva/venv/bin"
ExecStart=/opt/aiva/venv/bin/gunicorn --workers 4 --bind 0.0.0.0:5000 app:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 5. Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable aiva-backend
sudo systemctl start aiva-backend
sudo systemctl status aiva-backend
```

### Option 2: Docker Container

#### 1. Create Dockerfile

```dockerfile
# /workspace/backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 5000

CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "app:app"]
```

#### 2. Build and Run

```bash
# Build image
docker build -t aiva-backend:latest -f backend/Dockerfile .

# Run container
docker run -d \
  --name aiva-backend \
  -p 5000:5000 \
  --env-file .env.production \
  --restart unless-stopped \
  aiva-backend:latest
```

### Option 3: Cloud Platform (Azure App Service)

```bash
# Login to Azure
az login

# Create resource group
az group create --name aiva-prod --location eastus

# Create App Service plan
az appservice plan create \
  --name aiva-backend-plan \
  --resource-group aiva-prod \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --name aiva-backend \
  --resource-group aiva-prod \
  --plan aiva-backend-plan \
  --runtime "PYTHON:3.11"

# Configure environment variables
az webapp config appsettings set \
  --name aiva-backend \
  --resource-group aiva-prod \
  --settings @production-settings.json

# Deploy code
cd backend
zip -r ../backend.zip .
az webapp deployment source config-zip \
  --name aiva-backend \
  --resource-group aiva-prod \
  --src ../backend.zip
```

---

## Frontend Deployment

### Option 1: Static Hosting (AWS S3 + CloudFront)

#### 1. Update API URL

Edit `frontend/app.js`:

```javascript
const API_BASE_URL = 'https://api.aiva.frontier.com/api';
```

#### 2. Upload to S3

```bash
# Create S3 bucket
aws s3 mb s3://aiva-frontend-prod

# Enable static website hosting
aws s3 website s3://aiva-frontend-prod \
  --index-document index.html

# Upload files
aws s3 sync frontend/ s3://aiva-frontend-prod/ \
  --exclude ".git/*" \
  --cache-control "public, max-age=3600"

# Set public read policy
aws s3api put-bucket-policy \
  --bucket aiva-frontend-prod \
  --policy file://s3-policy.json
```

#### 3. Configure CloudFront

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name aiva-frontend-prod.s3.amazonaws.com \
  --default-root-object index.html
```

### Option 2: Nginx Web Server

#### 1. Configure Nginx

```nginx
# /etc/nginx/sites-available/aiva
server {
    listen 80;
    server_name aiva.frontier.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aiva.frontier.com;

    ssl_certificate /etc/ssl/certs/aiva.frontier.com.crt;
    ssl_certificate_key /etc/ssl/private/aiva.frontier.com.key;

    root /var/www/aiva/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 2. Deploy Files

```bash
# Create directory
sudo mkdir -p /var/www/aiva/frontend

# Copy files
sudo cp -r frontend/* /var/www/aiva/frontend/

# Set permissions
sudo chown -R www-data:www-data /var/www/aiva
sudo chmod -R 755 /var/www/aiva

# Enable site
sudo ln -s /etc/nginx/sites-available/aiva /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 3: Azure Static Web Apps

```bash
# Create static web app
az staticwebapp create \
  --name aiva-frontend \
  --resource-group aiva-prod \
  --location eastus2 \
  --source https://github.com/frontier/aiva \
  --branch main \
  --app-location "/frontend" \
  --api-location "" \
  --output-location ""
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Backend health check
curl https://api.aiva.frontier.com/api/health

# Expected response:
# {"status":"healthy","timestamp":"2025-11-17T10:30:00"}
```

### 2. Test Customer Lookup

```bash
# Test with sample BTN
curl https://api.aiva.frontier.com/api/customer/2436476063

# Verify response contains customer data
```

### 3. Frontend Verification

- [ ] Open https://aiva.frontier.com
- [ ] Verify AIVA icon loads correctly
- [ ] Test daily greeting appears
- [ ] Search for customer by BTN
- [ ] Verify popup displays correctly
- [ ] Test article links open properly
- [ ] Verify timeout (wait 10 minutes)

### 4. Cross-Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)

### 5. Performance Testing

```bash
# Load test with Apache Bench
ab -n 1000 -c 10 https://api.aiva.frontier.com/api/customer/2436476063

# Monitor response times
# Target: < 500ms average response time
```

---

## Monitoring and Maintenance

### 1. Set Up Application Monitoring

#### CloudWatch (AWS)

```bash
# Create log group
aws logs create-log-group --log-group-name /aiva/backend

# Create alarm for errors
aws cloudwatch put-metric-alarm \
  --alarm-name aiva-high-error-rate \
  --alarm-description "Alert when error rate exceeds 5%" \
  --metric-name ErrorRate \
  --namespace AIVA \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

#### Application Insights (Azure)

```bash
# Enable Application Insights
az monitor app-insights component create \
  --app aiva-backend \
  --location eastus \
  --resource-group aiva-prod
```

### 2. Log Aggregation

Configure centralized logging:

```python
# backend/app.py - Add logging configuration
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler(
        'logs/aiva.log', 
        maxBytes=10240000, 
        backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
```

### 3. Backup Strategy

```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backup/aiva"

# Backup application files
tar -czf $BACKUP_DIR/aiva-app-$DATE.tar.gz /opt/aiva

# Backup database (if applicable)
# Databricks handles its own backups

# Backup configuration
tar -czf $BACKUP_DIR/aiva-config-$DATE.tar.gz /opt/aiva/.env.production

# Rotate old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### 4. Update Procedure

```bash
# 1. Pull latest code
cd /opt/aiva
git pull origin main

# 2. Update dependencies
source venv/bin/activate
pip install -r requirements.txt

# 3. Run tests (if available)
pytest tests/

# 4. Restart service
sudo systemctl restart aiva-backend

# 5. Verify health
curl http://localhost:5000/api/health

# 6. Update frontend (if changed)
rsync -av frontend/ /var/www/aiva/frontend/

# 7. Clear CDN cache (if using CloudFront/CDN)
aws cloudfront create-invalidation \
  --distribution-id XXXXXXXXXXXX \
  --paths "/*"
```

### 5. Security Monitoring

- [ ] Set up SSL certificate auto-renewal
- [ ] Configure WAF rules (if applicable)
- [ ] Enable DDoS protection
- [ ] Set up security scanning (e.g., Snyk, Dependabot)
- [ ] Regular security audits
- [ ] Monitor for unauthorized access attempts

---

## Rollback Procedure

If issues occur after deployment:

```bash
# 1. Stop current service
sudo systemctl stop aiva-backend

# 2. Restore previous version
cd /opt/aiva
git reset --hard <previous-commit-hash>

# 3. Restore dependencies
source venv/bin/activate
pip install -r requirements.txt

# 4. Restart service
sudo systemctl start aiva-backend

# 5. Verify
curl http://localhost:5000/api/health
```

---

## Troubleshooting Production Issues

### High Response Times

1. Check Databricks warehouse status
2. Verify network connectivity
3. Review application logs
4. Scale up resources if needed

### SharePoint Connection Failures

1. Verify Azure AD token hasn't expired
2. Check SharePoint service status
3. Verify network connectivity
4. Review application logs

### Frontend Not Loading

1. Check CDN/web server status
2. Verify SSL certificates
3. Check DNS resolution
4. Review browser console errors

---

## Support Contacts

- **Infrastructure**: IT Operations Team
- **Databricks**: Data Platform Team
- **SharePoint**: Collaboration Services Team
- **Security**: InfoSec Team
- **Application Support**: Development Team

---

## Compliance and Governance

- [ ] PII data handling procedures reviewed
- [ ] Security assessment completed
- [ ] Change management approval obtained
- [ ] Disaster recovery plan documented
- [ ] SLA requirements defined
- [ ] Compliance requirements verified

---

<div align="center">
  <p><strong>For questions or issues, contact the AIVA Support Team</strong></p>
</div>
