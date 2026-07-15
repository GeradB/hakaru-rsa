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

**Do not put real secrets in this file or commit them to git.** Set values in Azure Portal or via CLI from a local secret store / Key Vault.

```bash
az webapp config appsettings set --resource-group RG-HakaruMainWebsite --name hakaru-api --settings \
  STRIPE_SECRET_KEY="<from Stripe Dashboard>" \
  SQL_SERVER_HOST="<your-sql>.database.windows.net" \
  SQL_SERVER_DATABASE="<database>" \
  SQL_SERVER_USER="<user>" \
  SQL_SERVER_PASSWORD="<password>" \
  SQL_SERVER_PORT="1433" \
  SQL_SERVER_ENCRYPT="true" \
  SQL_SERVER_TRUST_CERT="true" \
  AZURE_STORAGE_CONNECTION_STRING="<connection-string>" \
  AZURE_STORAGE_GALLERY_CONTAINER="hakaruweb" \
  ADMIN_USERNAME="<admin-user>" \
  ADMIN_PASSWORD_HASH="<bcrypt hash>" \
  COOKIE_SECURE="true" \
  FRONTEND_URLS="https://www.hakarursa.co.nz,https://hakarursa.co.nz" \
  PUBLIC_SITE_URL="https://www.hakarursa.co.nz" \
  ENTRA_TENANT_ID="0f9e3c4e-92b5-4caf-ae9a-56a7e71882a8" \
  ENTRA_CLIENT_ID="4fafdc19-8a0c-4021-8d27-32a2a1594772" \
  ADMIN_ALLOWED_AAD_OBJECT_IDS="<comma-separated Entra object IDs>"
```

Generate `ADMIN_PASSWORD_HASH` locally:

```bash
cd server && node --input-type=module -e "import bcrypt from 'bcryptjs'; console.log(bcrypt.hashSync('YOUR_PASSWORD', 10));"
```

## Step 5: Deploy from GitHub

Prefer the existing GitHub Actions workflow (`main_hakaru-api.yml`) with a publish profile secret.

## Step 6: Update Frontend

Build with `VITE_API_URL` / `VITE_API_BASE_URL` pointing at the App Service hostname.

Also set Static Web App / SPA CORS origins on the API via `FRONTEND_URLS`.
