# Azure Deployment Guide

## Environment Variables Setup

### How Environment Variables Work in Azure

Your application will get environment variables from **two sources**:

#### 1. Azure Web App Configuration (Recommended)
Go to your Azure Web App → Configuration → Application settings and add:

```bash
# Database Configuration
MONGODB_URI=mongodb://your-mongodb-connection-string
NODE_ENV=production
PORT=80

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=photo-sharing

# Redis Configuration (Optional)
REDIS_HOST=your-redis-cache.redis.cache.windows.net
REDIS_PORT=6380
REDIS_PASSWORD=your-redis-primary-key
```

#### 2. GitHub Secrets (For CI/CD)
Add these secrets to your GitHub repository:

```bash
# Azure Registry Secrets
AZURE_REGISTRY_URL=yourregistry.azurecr.io
AZURE_REGISTRY_USERNAME=your-registry-username  
AZURE_REGISTRY_PASSWORD=your-registry-password

# Azure Web App Deployment
AZURE_WEBAPP_PUBLISH_PROFILE=your-publish-profile-xml-content
```

## Required GitHub Secrets Setup

1. **Azure Container Registry**:
   - `AZURE_REGISTRY_URL`: Your ACR URL (e.g., `myregistry.azurecr.io`)
   - `AZURE_REGISTRY_USERNAME`: ACR username
   - `AZURE_REGISTRY_PASSWORD`: ACR password/access token

2. **Azure Web App**:
   - `AZURE_WEBAPP_PUBLISH_PROFILE`: Download from Azure Portal → Web App → Get Publish Profile

## Azure Services Needed

### 1. Azure Container Registry (ACR)
```bash
az acr create --resource-group myResourceGroup --name myregistry --sku Basic
```

### 2. Azure Web App for Containers
```bash
az webapp create \
  --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name sharing \
  --deployment-container-image-name nginx
```

### 3. Optional: Azure Redis Cache
```bash
az redis create \
  --name myRedisCache \
  --resource-group myResourceGroup \
  --location eastus \
  --sku Basic \
  --vm-size C0
```

### 4. Optional: Azure Cosmos DB (MongoDB)
```bash
az cosmosdb create \
  --name myCosmosDB \
  --resource-group myResourceGroup \
  --kind MongoDB \
  --server-version 4.2
```

## Deployment Workflow

1. **Push to main branch** → Triggers GitHub Action
2. **Build & Test** → Linting and Docker build
3. **Push to ACR** → Docker image stored in Azure Container Registry  
4. **Deploy to Web App** → Azure pulls image and runs container
5. **Environment Variables** → Loaded from Azure Web App Configuration

## Health Check

Your app includes `/health` endpoint that returns:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

## Troubleshooting

### Environment Variables Not Loading
1. Check Azure Web App → Configuration → Application settings
2. Restart the Web App after adding new variables
3. Check container logs: `az webapp logs tail --name sharing`

### Redis Connection Issues
- Use SSL (port 6380) for Azure Redis
- Ensure `REDIS_HOST` includes full domain: `.redis.cache.windows.net`
- Your Redis config already supports Azure SSL requirements

### Database Connection
- Use Cosmos DB connection string format
- Ensure IP access is configured
- Check firewall settings

## Security Notes

- Never commit secrets to repository
- Use Azure Key Vault for production secrets
- Enable managed identities where possible
- Regularly rotate secrets and passwords
