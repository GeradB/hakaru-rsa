# Hakaru RSA - Deployment Guide

## Azure Static Web Apps Deployment

This project is configured for deployment to Azure Static Web Apps with the backend API hosted as an Azure Function.

### Prerequisites

1. Azure account with subscription
2. Azure Static Web App resource created
3. Azure SQL Database (for backend data)
4. Azure Blob Storage (for gallery images)
5. Stripe account (for payments)

### Environment Configuration

#### Frontend (.env)
Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Required variables:
- `VITE_API_BASE_URL` - Backend API URL (Azure Function URL in production)
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `VITE_CURRENCY` - Default currency (NZD)

#### Backend (server/.env)
Copy `server/.env.example` to `server/.env`:

```bash
cp server/.env.example server/.env
```

Required variables:
- `AZURE_STORAGE_CONNECTION_STRING` - Azure Blob storage connection
- `AZURE_STORAGE_GALLERY_CONTAINER` - Blob container name (default: gallery)
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD_HASH` - Bcrypt hash of admin password
- `COOKIE_SECURE` - Set `true` for HTTPS production
- `FRONTEND_URLS` - Comma-separated allowed origins
- `STRIPE_SECRET_KEY` - Stripe secret key
- `SQL_SERVER_HOST` - Azure SQL server hostname
- `SQL_SERVER_USER` - SQL database user
- `SQL_SERVER_PASSWORD` - SQL database password
- `SQL_SERVER_DATABASE` - Database name

### GitHub Actions Deployment

The workflow file `.github/workflows/azure-static-web-apps-thankful-moss-002241200.yml` handles CI/CD:

1. On push to `main`: builds and deploys to Azure
2. On PR: creates preview deployment
3. On PR close: cleans up preview

#### Required GitHub Secrets

- `AZURE_STATIC_WEB_APPS_API_TOKEN_THANKFUL_MOSS_002241200` - Azure Static Web Apps deployment token

### Database Setup

Run the SQL migration scripts in order:

1. `server/create-table.sql` - Core tables
2. `server/create-gallery-albums-table.sql` - Gallery albums
3. `server/create-donations-table.sql` - Donations

### Azure Static Web App Configuration

In the Azure Portal, configure:

1. **Build Configuration**
   - App location: `/`
   - API location: `/server`
   - Output location: `/dist`

2. **Environment Variables**
   - Add all server `.env` variables as Application Settings

3. **CORS**
   - Add your production domain to `FRONTEND_URLS`

4. **Admin Entra security (required for Microsoft login)**
   - `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID` (SPA app registration IDs)
   - `ADMIN_ALLOWED_AAD_OBJECT_IDS` — comma-separated Entra user object IDs allowed to call `/api/admin/*` (falls back to `AGENT_ALLOWED_AAD_OBJECT_IDS` if set)

5. **Dataverse membership sync (optional)**
   - Syncs each new membership application to table `cre8c_membershiprecord10` in [org0edbfb3b](https://org0edbfb3b.api.crm6.dynamics.com).
   - Create an Entra app registration (client secret) and a Dataverse **application user** with a security role that can Create on that table ([docs](https://learn.microsoft.com/power-apps/developer/data-platform/authenticate-oauth#connect-as-an-app)).
   - App Service settings: `DATAVERSE_URL`, `DATAVERSE_TENANT_ID`, `DATAVERSE_CLIENT_ID`, `DATAVERSE_CLIENT_SECRET` (optional `DATAVERSE_MEMBERSHIP_ENTITY`).

### Teams content agent (optional)

See [docs/CONTENT_AGENT.md](docs/CONTENT_AGENT.md) for full setup. Summary:

1. Run `server/migrations/004_cms_agent_audit.sql` on Azure SQL.
2. Run `server/migrations/005_newsletters.sql` on Azure SQL (newsletter PDF library).
3. Create Azure OpenAI + Azure Bot (Teams channel); messaging endpoint `https://<hakaru-api>/api/messaging`.
4. Add App Service settings: `MICROSOFT_APP_*`, `AZURE_OPENAI_*`, `AGENT_ALLOWED_AAD_OBJECT_IDS`, `PUBLIC_SITE_URL`.
5. Install the bot in Teams and allowlist Entra user object IDs.

### Local Development

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Set up environment files
cp .env.example .env
cp server/.env.example server/.env

# Start development servers
npm run dev        # Frontend (port 5173)
cd server && node server.js  # Backend (port 3001)
```

### Production URLs

After deployment, update:
1. `VITE_API_BASE_URL` in `.env` to the Azure Function API URL
2. `FRONTEND_URLS` in `server/.env` to the production Static Web App URL
