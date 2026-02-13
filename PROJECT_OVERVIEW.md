# PaidYET Shopify Payment Gateway - Complete Plugin

## Overview

This is a production-ready Shopify payment gateway plugin for the PaidYET payment processing platform. The plugin provides a complete integration between Shopify and PaidYET's REST API v3, enabling secure credit card processing with full PCI DSS compliance.

## What's Included

### Core Files

1. **paidyet-gateway.liquid** - Frontend payment form for Shopify checkout
   - PaidYET JavaScript widget integration
   - Tokenization and secure card handling
   - Real-time form validation
   - Error handling and user feedback

2. **payment-routes.js** - Backend API routes for payment processing
   - Transaction creation (sale/auth)
   - Refunds and voids
   - Transaction capture
   - Webhook handling
   - Bearer token management

3. **server.js** - Express.js server configuration
   - Security middleware (Helmet, CORS, Rate Limiting)
   - Route mounting
   - Error handling
   - Health check endpoint

4. **config.js** - Comprehensive configuration settings
   - API configuration
   - Transaction settings
   - Security options
   - Error/success messages
   - Fraud prevention settings

### Documentation Files

1. **README.md** - Complete documentation including:
   - Feature list
   - Installation instructions
   - API endpoint documentation
   - Testing guide
   - Security best practices
   - Production checklist

2. **INSTALLATION.md** - Step-by-step installation guide
   - Prerequisites
   - Server setup
   - Shopify configuration
   - Testing procedures
   - Troubleshooting

3. **.env.example** - Environment variable template
   - All required configuration variables
   - Comments explaining each setting

### Supporting Files

1. **package.json** - Node.js dependencies and scripts
2. **.gitignore** - Git ignore rules for security

## Key Features

### Payment Processing
✅ Credit card payment processing (sale transactions)
✅ Authorization-only transactions
✅ Transaction capture
✅ Refunds for settled transactions
✅ Void for unsettled transactions
✅ Transaction lookup and retrieval

### Security & Compliance
✅ PCI DSS Level 1 compliance through PaidYET tokenization
✅ Bearer token authentication with auto-refresh
✅ HTTPS/SSL enforcement
✅ CORS protection
✅ Rate limiting (100 req/15 min per IP)
✅ Webhook signature verification
✅ Environment variable security

### Integration Features
✅ Sandbox and production environments
✅ Support for merchant-level API keys
✅ Support for partner-level API keys
✅ Webhook notifications
✅ Comprehensive error handling
✅ Logging and monitoring ready

### Developer Experience
✅ Well-documented code
✅ Modular architecture
✅ Easy configuration
✅ Test card support
✅ Development mode with auto-reload
✅ Health check endpoint

## Technology Stack

- **Backend**: Node.js with Express.js
- **HTTP Client**: Axios
- **Security**: Helmet, CORS, express-rate-limit
- **Frontend**: Liquid (Shopify), JavaScript
- **Payment Widget**: PaidYET JavaScript Widget v3

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Shopify Checkout                         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  paidyet-gateway.liquid                              │ │
│  │  • PaidYET Widget (Tokenization)                     │ │
│  │  • Form Handling                                     │ │
│  │  • Error Display                                     │ │
│  └──────────────────┬───────────────────────────────────┘ │
└────────────────────┼────────────────────────────────────────┘
                     │ Token
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Server (Express.js)                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  payment-routes.js                                    │ │
│  │  • Bearer Token Management                           │ │
│  │  • Transaction Processing                            │ │
│  │  • Refund/Void/Capture                              │ │
│  │  • Webhook Handler                                   │ │
│  └──────────────────┬───────────────────────────────────┘ │
└────────────────────┼────────────────────────────────────────┘
                     │ API Calls
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   PaidYET REST API v3                       │
│                                                             │
│  • Authentication (Bearer Token)                           │
│  • Transaction Processing                                  │
│  • Card Tokenization                                       │
│  • Webhook Events                                          │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

### POST /apps/paidyet/process-payment
Process a payment transaction (sale or auth)

### POST /apps/paidyet/refund
Refund a settled transaction

### POST /apps/paidyet/capture
Capture an authorized transaction

### POST /apps/paidyet/void
Void a transaction in the current batch

### GET /apps/paidyet/transaction/:id
Get transaction details

### POST /apps/paidyet/webhook
Receive webhook notifications from PaidYET

### GET /health
Health check endpoint

## Configuration

All configuration is done through environment variables (`.env` file):

### Required Variables
- `PAIDYET_MERCHANT_ID` - Your PaidYET merchant ID
- `PAIDYET_API_KEY` - Your PaidYET API key
- `PAIDYET_ENVIRONMENT` - 'sandbox' or 'production'

### Optional Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - 'development' or 'production'
- `ALLOWED_ORIGINS` - CORS allowed origins
- `PAIDYET_WEBHOOK_SECRET` - Webhook signature verification
- `PAIDYET_MERCHANT_UUID` - For partner-level API keys

## Installation Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start server**
   ```bash
   npm run dev  # Development
   npm start    # Production
   ```

4. **Configure Shopify**
   - Add payment method
   - Install liquid template
   - Set up metafields
   - Update checkout template

5. **Test with sandbox**
   - Use test cards
   - Verify transactions in PaidYET dashboard

6. **Go live**
   - Switch to production credentials
   - Set up webhooks
   - Test with real transaction

## Testing

### Test Cards (Sandbox)

| Status | Card Number | CVV | Exp |
|--------|-------------|-----|-----|
| Approved | 4000100011112224 | 123 | 09/32 |
| Declined | 4000300011112220 | 999 | 09/32 |
| CVV Fail | 4000301311112225 | 999 | 09/32 |

See PaidYET sandbox documentation for complete test card list.

## Security Considerations

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Always use HTTPS in production** - Required for payment processing
3. **Verify webhook signatures** - Prevent unauthorized webhook requests
4. **Keep dependencies updated** - Regular security patches
5. **Use strong API keys** - Generate secure credentials
6. **Enable rate limiting** - Prevent abuse
7. **Monitor logs** - Watch for suspicious activity

## Production Deployment

### Deployment Options

1. **Heroku** - Simple deployment with add-ons
2. **AWS/DigitalOcean** - Full control, requires SSL setup
3. **Vercel/Netlify** - Serverless (may require adaptation)

### Pre-deployment Checklist

- [ ] Production API credentials configured
- [ ] SSL certificate installed
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] Webhook URL updated
- [ ] Rate limiting configured
- [ ] Logging enabled
- [ ] Error monitoring set up
- [ ] Backup strategy in place
- [ ] Test transactions successful

## Support & Resources

### PaidYET Resources
- Documentation: https://paidyet.readme.io
- Support Email: support@paidyet.com
- Sandbox Access: Request via support email

### Plugin Support
- Review README.md for detailed documentation
- Check INSTALLATION.md for step-by-step setup
- Review server logs for debugging
- Test in sandbox before production

## License

MIT License - See LICENSE file

## Credits

Built based on PaidYET REST API v3 documentation (https://paidyet.readme.io)

## Version

1.0.0 - Initial Release

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Full PaidYET API v3 integration
- Support for all major transaction types
- Webhook support
- Comprehensive error handling
- Bearer token management
- Rate limiting and security features
- Complete documentation

## Future Enhancements

Potential additions for future versions:
- ACH payment support
- Recurring billing integration
- Multi-currency support
- Enhanced fraud detection
- Admin dashboard
- Transaction reporting
- Customer payment profiles
- Saved cards (tokenization)
- 3D Secure integration
- Apple Pay / Google Pay support

## File Structure

```
paidyet-shopify-plugin/
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── README.md                # Main documentation
├── INSTALLATION.md          # Installation guide
├── package.json             # Node.js dependencies
├── server.js                # Express server
├── config.js                # Configuration settings
├── payment-routes.js        # API routes
└── paidyet-gateway.liquid   # Shopify frontend template
```

## Important Notes

1. **PCI Compliance**: This plugin uses PaidYET's tokenization, so you don't handle raw card data
2. **Sandbox Testing**: Always test thoroughly in sandbox before going live
3. **API Keys**: Keep API keys secure and never commit them to version control
4. **SSL Required**: Production requires HTTPS/SSL certificate
5. **Webhooks**: Configure webhooks for real-time transaction updates
6. **Bearer Tokens**: Automatically managed with caching and refresh
7. **Rate Limiting**: Built-in protection against abuse
8. **Error Handling**: Comprehensive error messages for debugging

## Getting Started

The fastest way to get started:

1. Read README.md for overview
2. Follow INSTALLATION.md step-by-step
3. Configure .env with your credentials
4. Test in sandbox mode
5. Deploy to production
6. Go live!

This plugin is production-ready and includes all necessary features for secure payment processing through PaidYET on Shopify.
