import * as SecureStore from 'expo-secure-store';

const useMock = false;

export const API_BASE_URL = 'https://buysite-mocks.tejasvi-kondamuru.workers.dev/';

const JWT_KEY = 'jwt_token';

// Helper function to get JWT token
export const getJwtToken = async () => {
  return await SecureStore.getItemAsync(JWT_KEY);
};

// Helper function to make authenticated API calls
export const authenticatedFetch = async (url, options = {}) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`🚀 [API-${requestId}] Starting API call to: ${url}`);
  console.log(`📋 [API-${requestId}] Method: ${options.method || 'GET'}`);
  console.log(`⏰ [API-${requestId}] Timestamp: ${new Date().toISOString()}`);
  
  try {
    const token = await getJwtToken();
    if (!token) {
      console.error(`❌ [API-${requestId}] No authentication token found`);
      throw new Error('No authentication token found');
    }
    
    console.log(`🔑 [API-${requestId}] Token found, making request...`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      console.error(`❌ [API-${requestId}] Failed (${response.status}) after ${duration}ms: ${url}`);
      throw new Error(`API call failed: ${response.status}`);
    }
    
    console.log(`✅ [API-${requestId}] Success (${response.status}) after ${duration}ms: ${url}`);
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`💥 [API-${requestId}] Error after ${duration}ms: ${error.message}`);
    throw error;
  }
};

const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error('Invalid credentials');
  }
  return response.json(); // { token: ... }
};

const fetchShops = async (username) => {
  const response = await authenticatedFetch(`${API_BASE_URL}api/${username}/shops`);
  return response.json();
};

export const Repository = {
  login,
  fetchShops,
};