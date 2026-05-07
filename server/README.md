# Hakaru RSA Backend Server

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
# Windcave Payment Gateway
WINDCAVE_MERCHANT_ID=YOUR_MERCHANT_ID
WINDCAVE_API_KEY=YOUR_API_KEY
WINDCAVE_PAYMENT_URL=https://sec.windcave.co.nz/pxpost.aspx

# Email Configuration (for sending membership confirmations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Hakaru RSA <noreply@hakaru-rsa.org.nz>
EMAIL_TO=admin@hakaru-rsa.org.nz

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173

# Membership Fee
MEMBERSHIP_FEE=50.00
CURRENCY=NZD
```

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

## API Endpoints

### POST /api/membership/create-payment
Creates a Windcave payment request and returns the redirect URL.

### POST /api/membership/webhook
Windcave callback endpoint for payment confirmation.

### POST /api/membership/send-email
Sends confirmation email after successful payment.
