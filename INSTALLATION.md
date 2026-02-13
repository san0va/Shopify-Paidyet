# PaidYET Shopify Plugin - Installation Guide

This guide will walk you through the complete installation and configuration process for the PaidYET Payment Gateway on Shopify.

## Prerequisites

Before you begin, ensure you have:

- A Shopify store
- A PaidYET merchant account
- Node.js 14.0.0 or higher installed
- npm 6.0.0 or higher installed
- A server or hosting platform
- SSL certificate (required for production)

## Step 1: Get PaidYET Credentials

1. Email PaidYET support: support@paidyet.com
2. Request a sandbox account for testing
3. Obtain your Merchant ID, API Key, and Paypage Subdomain

## Step 2: Set Up the Backend Server

### Install Dependencies

```bash
npm install
```

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PAIDYET_MERCHANT_ID=your_merchant_id
PAIDYET_API_KEY=your_api_key
PAIDYET_ENVIRONMENT=sandbox
PORT=3000
ALLOWED_ORIGINS=https://your-store.myshopify.com
```

### Test Locally

```bash
npm run dev
```

### Deploy to Production

Deploy to Heroku, AWS, DigitalOcean, or your preferred platform.

## Step 3: Configure Shopify

### Add Payment Method

1. Shopify Admin > Settings > Payments
2. Add manual payment method
3. Name it "PaidYET Payment Gateway"

### Install Theme Code

1. Online Store > Themes > Edit code
2. Create new snippet: `paidyet-gateway`
3. Copy contents from `paidyet-gateway.liquid`
4. Save

### Update Checkout Template

Add to your checkout template:
```liquid
{% if checkout.payment_gateway_name == "PaidYET Payment Gateway" %}
  {% include 'paidyet-gateway' %}
{% endif %}
```

### Configure Metafields

Set up shop metafields:
- `paidyet.paypage_subdomain`
- `paidyet.merchant_id`
- `paidyet.api_key`
- `paidyet.environment`

## Step 4: Test

Use test cards in sandbox:
- Approved: 4000100011112224, CVV: 123, Exp: 09/32
- Declined: 4000300011112220, CVV: 999, Exp: 09/32

## Step 5: Go Live

1. Update to production credentials
2. Set `PAIDYET_ENVIRONMENT=production`
3. Configure webhooks in PaidYET Dashboard
4. Test with small real transaction

For detailed troubleshooting, see README.md
