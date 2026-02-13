/**
 * PaidYET Configuration Settings
 * 
 * This file contains configuration constants for the PaidYET Shopify plugin.
 * Modify these values according to your business requirements.
 */

module.exports = {
  // API Configuration
  api: {
    // Request timeout in milliseconds
    timeout: 30000,
    
    // Retry configuration for failed requests
    retry: {
      attempts: 3,
      delay: 1000 // milliseconds
    }
  },

  // Bearer Token Configuration
  bearerToken: {
    // Cache duration in minutes (55 minutes, tokens expire after 60)
    cacheDuration: 55,
    
    // Refresh token X minutes before expiration
    refreshBeforeExpiry: 5
  },

  // Transaction Configuration
  transaction: {
    // Default transaction type: 'sale' or 'auth'
    defaultType: 'sale',
    
    // Authorization validity period in days
    authValidityDays: 25,
    
    // Supported transaction types
    supportedTypes: ['sale', 'auth', 'refund', 'void', 'capture']
  },

  // Security Configuration
  security: {
    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100
    },
    
    // Webhook signature verification
    webhookSignatureVerification: true,
    
    // CORS configuration
    cors: {
      credentials: true,
      optionsSuccessStatus: 200
    }
  },

  // Logging Configuration
  logging: {
    // Log levels: 'error', 'warn', 'info', 'debug'
    level: process.env.LOG_LEVEL || 'info',
    
    // Log sensitive data (DO NOT enable in production)
    logSensitiveData: false,
    
    // Log API requests
    logRequests: true,
    
    // Log API responses
    logResponses: true
  },

  // Error Messages
  errorMessages: {
    authentication: 'Authentication failed. Please check your API credentials.',
    invalidCard: 'Invalid card information. Please check and try again.',
    declined: 'Transaction declined. Please try a different payment method.',
    insufficientFunds: 'Insufficient funds. Please try a different card.',
    networkError: 'Network error. Please check your connection and try again.',
    serverError: 'Server error. Please try again later.',
    invalidRequest: 'Invalid request. Please check your information and try again.',
    transactionNotFound: 'Transaction not found.',
    refundFailed: 'Refund failed. Please contact support.',
    voidFailed: 'Void failed. Transaction may have already settled.',
    captureFailed: 'Capture failed. Please verify the authorization is still valid.'
  },

  // Success Messages
  successMessages: {
    transactionApproved: 'Payment processed successfully',
    refundProcessed: 'Refund processed successfully',
    transactionVoided: 'Transaction voided successfully',
    transactionCaptured: 'Transaction captured successfully'
  },

  // Webhook Events
  webhookEvents: {
    transactionApproved: 'transaction.approved',
    transactionDeclined: 'transaction.declined',
    transactionRefunded: 'transaction.refunded',
    transactionVoided: 'transaction.voided',
    batchClosed: 'batch.closed'
  },

  // Custom Fields
  customFields: {
    // Add custom fields to include in all transactions
    default: [
      {
        key: 'platform',
        value: 'shopify'
      }
    ]
  },

  // Payment Form Styling (for JavaScript Widget)
  widgetStyle: {
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '12px',
    paddingRight: '12px',
    borderRadius: '4px',
    borderWidth: '1px',
    borderColor: '#ced4da',
    cvv: {
      display: 'block',
      paddingTop: '10px',
      paddingBottom: '10px',
      paddingLeft: '12px',
      paddingRight: '12px',
      borderRadius: '4px',
      borderWidth: '1px',
      borderColor: '#ced4da'
    }
  },

  // AVS (Address Verification System) Configuration
  avs: {
    // Require AVS match
    required: false,
    
    // Accepted AVS response codes
    acceptedCodes: ['M', 'Y', 'X', 'A', 'Z']
  },

  // CVV Configuration
  cvv: {
    // Require CVV
    required: true,
    
    // Accepted CVV response codes
    acceptedCodes: ['M']
  },

  // Fraud Prevention
  fraudPrevention: {
    // Enable velocity checks
    velocityChecks: true,
    
    // Maximum transaction amount without additional verification
    maxAmountWithoutVerification: 10000,
    
    // Require 3D Secure for high-value transactions
    require3DSecure: false,
    threshold3DSecure: 5000
  },

  // Shopify Integration
  shopify: {
    // Order status to set on successful payment
    successOrderStatus: 'paid',
    
    // Order status to set on failed payment
    failedOrderStatus: 'pending',
    
    // Automatically fulfill orders on successful payment
    autoFulfill: false
  }
};
