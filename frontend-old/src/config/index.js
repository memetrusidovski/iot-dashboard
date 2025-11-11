// This file centralizes all environment-based configuration

const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
    timeout: 10000,
  },
  
  // App Configuration
  app: {
    name: import.meta.env.REACT_APP_APP_NAME || 'Smart Home App',
    environment: import.meta.env.NODE_ENV || 'development', // Use NODE_ENV instead
    version: import.meta.env.REACT_APP_VERSION || '1.0.0',
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${config.api.baseURL}/${cleanEndpoint}`;
};

// Helper to check environment - use NODE_ENV which is built-in
export const isDevelopment = () => import.meta.env.NODE_ENV === 'development';
export const isProduction = () => import.meta.env.NODE_ENV === 'production';

export default config;