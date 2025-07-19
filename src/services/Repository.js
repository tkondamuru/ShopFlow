import * as SecureStore from 'expo-secure-store';

const useMock = false;

export const API_BASE_URL = 'https://buysite-mocks.tejasvi-kondamuru.workers.dev/';

const JWT_KEY = 'jwt_token';

// Helper function to get JWT token
const getJwtToken = async () => {
  return await SecureStore.getItemAsync(JWT_KEY);
};

// Helper function to make authenticated API calls
const authenticatedFetch = async (url, options = {}) => {
  const token = await getJwtToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return response;
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