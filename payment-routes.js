const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const router = express.Router();

// PaidYET API Configuration
const PAIDYET_CONFIG = {
  production: {
    baseUrl: 'https://api.paidyet.com/v3',
    loginUrl: 'https://api.paidyet.com/v3/login'
  },
  sandbox: {
    baseUrl: 'https://api.sandbox-paidyet.com/v3',
    loginUrl: 'https://api.sandbox-paidyet.com/v3/login'
  }
};

// Store bearer tokens with expiration (in-memory cache, use Redis in production)
const tokenCache = new Map();

/**
 * Get or refresh bearer token for PaidYET API
 */
async function getBearerToken(merchantId, apiKey, environment = 'production') {
  const cacheKey = `${merchantId}:${apiKey}`;
  
  // Check if we have a valid cached token
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  // Obtain new bearer token
  const config = PAIDYET_CONFIG[environment];
  
  try {
    const response = await axios.post(config.loginUrl, {
      merchant_id: merchantId,
      api_key: apiKey
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const token = response.data.token;
    
    // Cache token for 55 minutes (tokens expire after 1 hour)
    tokenCache.set(cacheKey, {
      token: token,
      expiresAt: Date.now() + (55 * 60 * 1000)
    });

    return token;
  } catch (error) {
    console.error('Failed to obtain bearer token:', error.response?.data || error.message);
    throw new Error('Authentication failed');
  }
}

/**
 * Create a transaction with PaidYET
 */
async function createTransaction(bearerToken, transactionData, environment = 'production') {
  const config = PAIDYET_CONFIG[environment];
  
  try {
    const response = await axios.post(`${config.baseUrl}/transaction`, transactionData, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Transaction failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Process payment endpoint
 */
router.post('/process-payment', async (req, res) => {
  try {
    const {
      token,
      order_id,
      amount,
      currency,
      billing_address,
      customer,
      merchant_uuid // Optional, for partner-level API keys
    } = req.body;

    // Validate required fields
    if (!token || !order_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }

    // Get configuration from environment or shop settings
    const merchantId = process.env.PAIDYET_MERCHANT_ID;
    const apiKey = process.env.PAIDYET_API_KEY;
    const environment = process.env.PAIDYET_ENVIRONMENT || 'production';

    if (!merchantId || !apiKey) {
      console.error('PaidYET credentials not configured');
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not properly configured'
      });
    }

    // Get bearer token
    const bearerToken = await getBearerToken(merchantId, apiKey, environment);

    // Prepare transaction data
    const transactionData = {
      type: 'sale', // Can be 'sale' or 'auth' (auth-only)
      amount: parseFloat(amount),
      credit_card: {
        token: token,
        billing_address: {
          address: billing_address?.address || '',
          city: billing_address?.city || '',
          state: billing_address?.state || '',
          postal: billing_address?.postal || ''
        },
        name: `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim(),
        email: customer?.email || ''
      },
      email: customer?.email || '',
      order_id: order_id,
      invoice: order_id,
      source: 'shopify',
      custom_fields: [
        {
          key: 'platform',
          value: 'shopify'
        },
        {
          key: 'order_id',
          value: order_id
        }
      ]
    };

    // Add merchant UUID if using partner-level API keys
    if (merchant_uuid) {
      transactionData.merchant_uuid = merchant_uuid;
    }

    // Create transaction
    const result = await createTransaction(bearerToken, transactionData, environment);

    // Check transaction status
    if (result.status === 'approved' || result.status === 'accepted') {
      return res.json({
        success: true,
        transaction_id: result.id,
        status: result.status,
        message: 'Payment processed successfully',
        redirect_url: `/checkout/thank_you?order_id=${order_id}`
      });
    } else {
      return res.json({
        success: false,
        status: result.status,
        message: result.message || 'Payment declined',
        error: result.error || {}
      });
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    
    const errorMessage = error.response?.data?.error?.message || 
                        error.response?.data?.message ||
                        'Payment processing failed';

    return res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

/**
 * Refund endpoint
 */
router.post('/refund', async (req, res) => {
  try {
    const {
      transaction_id,
      amount,
      order_id
    } = req.body;

    if (!transaction_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required refund information'
      });
    }

    const merchantId = process.env.PAIDYET_MERCHANT_ID;
    const apiKey = process.env.PAIDYET_API_KEY;
    const environment = process.env.PAIDYET_ENVIRONMENT || 'production';

    const bearerToken = await getBearerToken(merchantId, apiKey, environment);
    const config = PAIDYET_CONFIG[environment];

    const refundData = {
      type: 'refund',
      amount: parseFloat(amount),
      order_id: order_id
    };

    const response = await axios.post(
      `${config.baseUrl}/transaction/refund/${transaction_id}`,
      refundData,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.json({
      success: true,
      refund_id: response.data.id,
      status: response.data.status,
      message: 'Refund processed successfully'
    });

  } catch (error) {
    console.error('Refund error:', error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Refund failed'
    });
  }
});

/**
 * Webhook endpoint for PaidYET notifications
 */
router.post('/webhook', async (req, res) => {
  try {
    // Verify webhook signature if configured
    const signature = req.headers['x-paidyet-signature'];
    const webhookSecret = process.env.PAIDYET_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event = req.body;

    // Handle different event types
    switch (event.event_type) {
      case 'transaction.approved':
        // Handle approved transaction
        console.log('Transaction approved:', event.transaction_id);
        // Update order status in Shopify
        break;

      case 'transaction.declined':
        // Handle declined transaction
        console.log('Transaction declined:', event.transaction_id);
        break;

      case 'transaction.refunded':
        // Handle refund
        console.log('Transaction refunded:', event.transaction_id);
        break;

      case 'batch.closed':
        // Handle batch closed event
        console.log('Batch closed:', event.batch_id);
        break;

      default:
        console.log('Unhandled event type:', event.event_type);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Capture an authorized transaction
 */
router.post('/capture', async (req, res) => {
  try {
    const {
      transaction_id,
      amount
    } = req.body;

    if (!transaction_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing transaction ID'
      });
    }

    const merchantId = process.env.PAIDYET_MERCHANT_ID;
    const apiKey = process.env.PAIDYET_API_KEY;
    const environment = process.env.PAIDYET_ENVIRONMENT || 'production';

    const bearerToken = await getBearerToken(merchantId, apiKey, environment);
    const config = PAIDYET_CONFIG[environment];

    const captureData = amount ? { amount: parseFloat(amount) } : {};

    const response = await axios.put(
      `${config.baseUrl}/transaction/capture/${transaction_id}`,
      captureData,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.json({
      success: true,
      transaction_id: response.data.id,
      status: response.data.status,
      message: 'Transaction captured successfully'
    });

  } catch (error) {
    console.error('Capture error:', error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Capture failed'
    });
  }
});

/**
 * Void a transaction
 */
router.post('/void', async (req, res) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing transaction ID'
      });
    }

    const merchantId = process.env.PAIDYET_MERCHANT_ID;
    const apiKey = process.env.PAIDYET_API_KEY;
    const environment = process.env.PAIDYET_ENVIRONMENT || 'production';

    const bearerToken = await getBearerToken(merchantId, apiKey, environment);
    const config = PAIDYET_CONFIG[environment];

    const response = await axios.put(
      `${config.baseUrl}/transaction/void/${transaction_id}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.json({
      success: true,
      transaction_id: response.data.id,
      status: response.data.status,
      message: 'Transaction voided successfully'
    });

  } catch (error) {
    console.error('Void error:', error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Void failed'
    });
  }
});

/**
 * Get transaction details
 */
router.get('/transaction/:transaction_id', async (req, res) => {
  try {
    const { transaction_id } = req.params;

    const merchantId = process.env.PAIDYET_MERCHANT_ID;
    const apiKey = process.env.PAIDYET_API_KEY;
    const environment = process.env.PAIDYET_ENVIRONMENT || 'production';

    const bearerToken = await getBearerToken(merchantId, apiKey, environment);
    const config = PAIDYET_CONFIG[environment];

    const response = await axios.get(
      `${config.baseUrl}/transaction/${transaction_id}`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        }
      }
    );

    return res.json({
      success: true,
      transaction: response.data
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to retrieve transaction'
    });
  }
});

module.exports = router;
