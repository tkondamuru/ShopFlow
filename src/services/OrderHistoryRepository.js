import { API_BASE_URL, authenticatedFetch } from './Repository';

class OrderHistoryRepository {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Server-side search for order history
  async searchOrderHistory(shipTono, searchParams) {
    const url = `${this.baseUrl}api/${shipTono}/history`;
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(searchParams),
    });
    const data = await response.json();
    return data;
  }

  // Get order history by date range
  async getOrderHistory(shipTono, startDate, endDate) {
    const url = `${this.baseUrl}api/${shipTono}/history`;
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify({ startDate, endDate }),
    });
    const data = await response.json();
    return data;
  }
}

export default OrderHistoryRepository; 