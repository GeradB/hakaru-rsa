# Deploy Backend to Azure App Service

## Prerequisites
- Azure CLI installed (`az`)
- Azure subscription

## Step 1: Create Resource Group
```bash
az group create --name hakaru-rg --location australiaeast
```

## Step 2: Create App Service Plan
```bash
az appservice plan create --name hakaru-plan --resource-group hakaru-rg --sku B1 --is-linux
```

## Step 3: Create Web App
```bash
az webapp create --resource-group hakaru-rg --plan hakaru-plan --name hakaru-api --runtime "NODE:20-lts"
```

## Step 4: Configure App Settings
```bash
az webapp config appsettings set --resource-group hakaru-rg --name hakaru-api --settings \
  STRIPE_SECRET_KEY="sk_test_51TTsTdEOZAorwg9FR5tyKaml1z8i4GJb3UX9dovCa07C6QsTuiz5JZFtzfU02sOYdq98Oiy4BNOYNk7EEHejFhiO00rwU35x9V" \
  SQL_SERVER_HOST="hakarusql.database.windows.net" \
  SQL_SERVER_DATABASE="HakaruMainWebTrafiic" \
  SQL_SERVER_USER="HakaruWebUser" \
  SQL_SERVER_PASSWORD="DBoHakaruW3b!@#" \
  SQL_SERVER_PORT="1433" \
  SQL_SERVER_ENCRYPT="true" \
  SQL_SERVER_TRUST_CERT="true" \
  AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=hakaruweb;AccountKey=xg0wG8lhfZpjdaZ5SdWHSkipuR/7u6yjsAIEQjoMH0pdTxYNwwq5wF8ouItwYfVfL+3bTT55fDiu+ASty+UjXQ==;EndpointSuffix=core.windows.net" \
  AZURE_STORAGE_GALLERY_CONTAINER="hakaruweb" \
  ADMIN_USERNAME="HakWEB1" \
  ADMIN_PASSWORD_HASH='$2b$10$kepdiYQkli.RHN3ZjHG6YuhCUYADzZC05c8YCqn2Ad0SYgV2BRf0W' \
  COOKIE_SECURE="true" \
  FRONTEND_URLS="https://black-smoke-0c7710210.7.azurestaticapps.net"
```

## Step 5: Deploy from GitHub
```bash
az webapp deployment source config --name hakaru-api --resource-group hakaru-rg --repo-url https://github.com/GeradB/hakaru-rsa --branch main --manual-integration
```

Or deploy using ZIP:
```bash
cd server
zip -r deploy.zip *
az webapp deployment source config-zip --resource-group hakaru-rg --name hakaru-api --src deploy.zip
```

## Step 6: Update Frontend
In your Static Web App, set build environment variable or update `.env`:
```
VITE_API_BASE_URL=https://hakaru-api.azurewebsites.net
```

Rebuild and redeploy frontend.
