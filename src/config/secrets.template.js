// Secrets Template
// Copy this file to secrets.js and fill in your actual API keys
// NEVER commit the actual secrets.js file to version control

export const SECRETS = {
  // OpenAI Configuration
  OPENAI_API_KEY: 'your-openai-api-key-here',
  
  // Google Maps Configuration
  GOOGLE_MAPS_API_KEY: 'your-google-maps-api-key-here',
  
  // Backend API Configuration
  API_ENDPOINTS: {
    DEVELOPMENT: 'http://localhost:3000/api',
    STAGING: 'https://staging-api.yourapp.com/api',
    PRODUCTION: 'https://api.yourapp.com/api'
  },
  
  // Authentication Secrets
  AUTH: {
    JWT_SECRET: 'your-jwt-secret-here',
    DEMO_CREDENTIALS: {
      EMAIL: 'demo@yourapp.com',
      PASSWORD: 'demo123'
    }
  },
  
  // Third-party Services
  THIRD_PARTY: {
    // Analytics
    MIXPANEL_TOKEN: '',
    SENTRY_DSN: '',
    
    // Social Media
    FACEBOOK_APP_ID: '',
    TWITTER_API_KEY: '',
    
    // Push Notifications
    FCM_SERVER_KEY: '',
    APNS_KEY: '',
  },
  
  // Environment-specific configurations
  ENVIRONMENT: __DEV__ ? 'development' : 'production',
};

// Helper function to get the appropriate API endpoint
export const getAPIEndpoint = () => {
  if (__DEV__) {
    return SECRETS.API_ENDPOINTS.DEVELOPMENT;
  }
  return SECRETS.API_ENDPOINTS.PRODUCTION;
};

// Helper function to validate required secrets
export const validateSecrets = () => {
  const requiredSecrets = [
    'OPENAI_API_KEY',
    'GOOGLE_MAPS_API_KEY'
  ];
  
  const missing = requiredSecrets.filter(key => !SECRETS[key] || SECRETS[key].includes('your-') || SECRETS[key] === '');
  
  if (missing.length > 0) {
    console.warn('Missing or template secrets detected:', missing);
    console.warn('Please copy secrets.template.js to secrets.js and add your actual API keys');
    return false;
  }
  
  return true;
};

export default SECRETS;