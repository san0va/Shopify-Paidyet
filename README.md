# PaidYET Payment Gateway for Shopify

A secure and comprehensive payment gateway integration for Shopify using the PaidYET REST API v3.

## Features

- Full PCI DSS compliance through PaidYET's tokenization
- Support for sale and authorization-only transactions
- Refund and void capabilities
- Real-time transaction processing
- Webhook support for asynchronous notifications
- Comprehensive error handling
- Bearer token management with automatic refresh
- Sandbox and production environment support
- Rate limiting and security middleware
- Support for both merchant-level and partner-level API keys

## Prerequisites

- Node.js 14.0.0 or higher
- npm 6.0.0 or higher
- A PaidYET merchant account
- A Shopify store
- PaidYET API credentials (Merchant ID and API Key)

## Installation

### 1. Clone or Download this Repository

```bash
git clone <repository-url>
cd paidyet-shopify-plugin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
# PaidYET Configuration
PAIDYET_MERCHANT_ID=your_merchant_id
PAIDYET_API_KEY=your_api_key
PAIDYET_ENVIRONMENT=sandbox  # Change to 'production' when ready

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS - Your Shopify store URL
ALLOWED_ORIGINS=https://your-store.myshopify.com
```

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Shopify Configuration

### 1. Add Custom Payment Gateway to Shopify

1. Log in to your Shopify admin panel
2. Go to **Settings** > **Payments**
3. Under **Manual payment methods**, click **Add manual payment method**
4. Select **Create custom payment method**
5. Name it "PaidYET Payment Gateway"

### 2. Install the Payment Gateway Template

Add the `paidyet-gateway.liquid` file to your Shopify theme:

1. Go to **Online Store** > **Themes**
2. Click **Actions** > **Edit code**
3. In the **Snippets** folder, create a new snippet called `paidyet-gateway`
4. Copy the contents of `paidyet-gateway.liquid` into the new snippet
5. Save the file

### 3. Add to Checkout Template

In your checkout template (usually `checkout.liquid`), include the snippet:

```liquid
{% if checkout.payment_gateway_name == "PaidYET Payment Gateway" %}
  {% include 'paidyet-gateway' %}
{% endif %}
```

### 4. Configure Shop Metafields

Set up the required metafields in your Shopify admin:

```
paidyet.paypage_subdomain = "your-paypage-subdomain"
paidyet.merchant_id = "your-merchant-id"
paidyet.api_key = "your-api-key"
paidyet.environment = "sandbox" # or "production"
```

## API Endpoints

### Payment Processing

**POST** `/apps/paidyet/process-payment`

Process a payment transaction.

Request body:
```json
{
  "token": "payment_token_from_widget",
  "order_id": "shopify_order_id",
  "amount": "99.99",
  "currency": "USD",
  "billing_address": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal": "10001"
  },
  "customer": {
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

Response:
```json
{
  "success": true,
  "transaction_id": "txn_123456",
  "status": "approved",
  "message": "Payment processed successfully"
}
```

### Refund Transaction

**POST** `/apps/paidyet/refund`

Refund a settled transaction.

Request body:
```json
{
  "transaction_id": "txn_123456",
  "amount": "99.99",
  "order_id": "order_123"
}
```

### Capture Authorization

**POST** `/apps/paidyet/capture`

Capture an authorized transaction.

Request body:
```json
{
  "transaction_id": "txn_123456",
  "amount": "99.99"
}
```

### Void Transaction

**POST** `/apps/paidyet/void`

Void a transaction in the current batch.

Request body:
```json
{
  "transaction_id": "txn_123456"
}
```

### Get Transaction Details

**GET** `/apps/paidyet/transaction/:transaction_id`

Retrieve details of a specific transaction.

### Webhook Endpoint

**POST** `/apps/paidyet/webhook`

Receives webhook notifications from PaidYET.

## Webhook Configuration

### 1. Set Up Webhook in PaidYET Dashboard

1. Log into your PaidYET Dashboard
2. Expand **Account** > **Tools**
3. Click the **Access Points** tab
4. Scroll to **Webhooks** section
5. Click **+ ADD WEBHOOK**
6. Enter your webhook URL: `https://your-server.com/apps/paidyet/webhook`
7. Select the events you want to receive:
   - `transaction.approved`
   - `transaction.declined`
   - `transaction.refunded`
   - `batch.closed`
8. Save the webhook

### 2. Configure Webhook Secret

Add the webhook secret to your `.env` file:

```env
PAIDYET_WEBHOOK_SECRET=your_webhook_secret
```

## Testing

### Using Sandbox Environment

1. Request a sandbox account from PaidYET: support@paidyet.com
2. Set `PAIDYET_ENVIRONMENT=sandbox` in your `.env` file
3. Use the sandbox API endpoint: `https://api.sandbox-paidyet.com/v3`

### Test Cards

Use these test card numbers in sandbox mode:

| Card Number | Status | CVV | Expiration |
|-------------|--------|-----|------------|
| 4000100011112224 | Approved | 123 | 09/32 |
| 4000300011112220 | Declined | 999 | 09/32 |
| 4000301311112225 | CVV Failure | 999 | 09/32 |

Full list of test cards available in PaidYET sandbox documentation.

## Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use HTTPS** - Always serve your application over HTTPS in production
3. **Validate webhook signatures** - Always verify webhook authenticity
4. **Implement rate limiting** - Already included in this plugin
5. **Use environment variables** - Never hardcode credentials
6. **Keep dependencies updated** - Regularly update npm packages
7. **Use partner-level API keys** - If managing multiple merchants

## Transaction Flow

### Standard Sale Transaction

```
Customer → Shopify Checkout
         ↓
PaidYET Widget (Tokenization)
         ↓
Your Backend Server
         ↓
PaidYET API (Authentication)
         ↓
PaidYET API (Create Transaction)
         ↓
Response to Frontend
         ↓
Order Completion
```

### Authorization-Only Transaction

```
Customer → Shopify Checkout
         ↓
PaidYET Widget (Tokenization)
         ↓
Your Backend (Auth-Only Transaction)
         ↓
Authorization Successful
         ↓
Later: Capture Transaction
         ↓
Settlement
```

## Error Handling

The plugin includes comprehensive error handling:

- **Authentication errors**: Invalid API credentials
- **Transaction errors**: Declined cards, insufficient funds
- **Network errors**: API connectivity issues
- **Validation errors**: Missing or invalid data
- **Webhook signature errors**: Invalid webhook requests

All errors are logged and returned with appropriate HTTP status codes and error messages.

## API Rate Limiting

- Default: 100 requests per 15 minutes per IP address
- Configurable in `server.js`
- Returns 429 status when limit exceeded

## Support

### PaidYET Support
- Email: support@paidyet.com
- Documentation: https://paidyet.readme.io
- Sandbox requests: support@paidyet.com

### Plugin Issues
- Check logs in console/terminal
- Verify environment variables are set correctly
- Ensure PaidYET credentials are valid
- Test in sandbox mode first

## API Reference

### PaidYET API v3 Documentation
- Base URL (Production): `https://api.paidyet.com/v3`
- Base URL (Sandbox): `https://api.sandbox-paidyet.com/v3`
- Full documentation: https://paidyet.readme.io/reference

### Key Endpoints Used

- `POST /v3/login` - Obtain bearer token
- `POST /v3/transaction` - Create transaction
- `PUT /v3/transaction/void/{id}` - Void transaction
- `POST /v3/transaction/refund/{id}` - Refund transaction
- `PUT /v3/transaction/capture/{id}` - Capture authorization
- `GET /v3/transaction/{id}` - Get transaction details

## Production Checklist

Before going live:

- [ ] Change `PAIDYET_ENVIRONMENT` to `production`
- [ ] Update to production API credentials
- [ ] Set `NODE_ENV` to `production`
- [ ] Configure production webhook URL
- [ ] Test with real cards (small amounts)
- [ ] Set up SSL/HTTPS
- [ ] Configure proper CORS origins
- [ ] Enable webhook signature verification
- [ ] Set up error monitoring
- [ ] Configure backup/logging
- [ ] Test refund/void operations
- [ ] Verify order status updates in Shopify

## License

MIT License

## Contributing

Contributions are welcome! Please submit pull requests or open issues for bugs and feature requests.

## Changelog

### Version 1.0.0
- Initial release
- Full PaidYET API v3 integration
- Support for sale, auth, capture, refund, and void
- Webhook support
- Bearer token management
- Comprehensive error handling
- Rate limiting and security features
