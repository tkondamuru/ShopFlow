import { API_BASE_URL } from './Repository';
import * as SecureStore from 'expo-secure-store';

// Helper function to get JWT token
const getJwtToken = async () => {
  return await SecureStore.getItemAsync('jwt_token');
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API call failed: ${response.status}`);
  }
  
  return response;
};

class ActiveOrdersRepository {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getActiveOrders(shipTono) {
    const url = `${this.baseUrl}api/${shipTono}/activeorders`;
    
    const response = await authenticatedFetch(url, {
      method: 'GET',
    });
    const data = await response.json();
    return data;
  }

  async getActiveReturns(shipTono) {
    const url = `${this.baseUrl}api/${shipTono}/returns`;
    
    const response = await authenticatedFetch(url, {
      method: 'GET',
    });
    const data = await response.json();
    return data;
  }

  async cancelActiveOrder(locNo, shipperNo, itemUidNo, argPartNo) {
    const url = `${this.baseUrl}api/cancel-active-order`;
    
    const requestBody = {
      loc_no: locNo,
      shipper_no: shipperNo,
      item_uid_no: itemUidNo,
      arg_part_no: argPartNo
    };

    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();
    return data;
  }
}

export default ActiveOrdersRepository; 