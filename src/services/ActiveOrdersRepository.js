import { API_BASE_URL, authenticatedFetch } from './Repository';

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

  // Get order history
  async getOrderHistory(shipto, startDate, endDate) {
    try {
      const response = await authenticatedFetch(
        `${this.baseUrl}api/orders/history?shipto=${shipto}&startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response;
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  }
}

export default ActiveOrdersRepository; 