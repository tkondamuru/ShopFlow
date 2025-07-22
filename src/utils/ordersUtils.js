import { format } from 'date-fns';

// Helper to format price
export const formatPrice = (value) => {
  if (value == null || value === '') return '';
  const num = Number(value);
  if (isNaN(num)) return value;
  return `$${num.toFixed(2)}`;
};

// Helper to format date
export const formatDeparture = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return format(date, 'dd-MMM-yyyy hh:mm:ss a');
  } catch {
    return dateString;
  }
};

// Search functionality for Active Orders
export const searchActiveOrders = (activeOrders, term) => {
  if (!term.trim()) {
    return activeOrders;
  }
  
  return activeOrders.filter(item => {
    const searchLower = term.toLowerCase();
    return (
      String(item.locationNumber || '').toLowerCase().includes(searchLower) ||
      String(item.shipperNumber || '').toLowerCase().includes(searchLower) ||
      String(item.customerPONumber || '').toLowerCase().includes(searchLower) ||
      String(item.partDescription || '').toLowerCase().includes(searchLower) ||
      String(item.shipQuantity || '').toLowerCase().includes(searchLower) ||
      String(item.totalPrice || '').toLowerCase().includes(searchLower) ||
      String(item.unitPrice || '').toLowerCase().includes(searchLower) ||
      String(item.departureDateTime || '').toLowerCase().includes(searchLower) ||
      String(item.callerName || '').toLowerCase().includes(searchLower) ||
      String(item.lineItemPoNumber || '').toLowerCase().includes(searchLower)
    );
  });
};

// Search functionality for Active Returns
export const searchActiveReturns = (activeReturns, term) => {
  if (!term.trim()) {
    return activeReturns;
  }
  
  return activeReturns.filter(item => {
    const searchLower = term.toLowerCase();
    return (
      String(item.locationNumber || '').toLowerCase().includes(searchLower) ||
      String(item.shipperNumber || '').toLowerCase().includes(searchLower) ||
      String(item.customerPONumber || '').toLowerCase().includes(searchLower) ||
      String(item.partDescription || '').toLowerCase().includes(searchLower) ||
      String(item.shipQuantity || '').toLowerCase().includes(searchLower) ||
      String(item.orderType || '').toLowerCase().includes(searchLower) ||
      String(item.customerItemPONumber || '').toLowerCase().includes(searchLower) ||
      String(item.purchaseLocationNumber || '').toLowerCase().includes(searchLower) ||
      String(item.purchaseShipperNumber || '').toLowerCase().includes(searchLower) ||
      String(item.callerName || '').toLowerCase().includes(searchLower)
    );
  });
};

// Group order history items by locationNumber + shipperNumber
export const groupOrderHistory = (orderHistory) => {
  const groups = {};
  
  orderHistory.forEach(item => {
    const key = `${item.locationNumber}-${item.shipperNumber}`;
    if (!groups[key]) {
      groups[key] = {
        locationNumber: item.locationNumber,
        shipperNumber: item.shipperNumber,
        customerPONumber: item.customerPONumber,
        items: []
      };
    }
    groups[key].items.push(item);
  });
  
  return Object.values(groups);
};

// Search functionality for Order History
export const searchOrderHistory = (orderHistory, term) => {
  if (!term.trim()) {
    return orderHistory;
  }
  
  return orderHistory.filter(item => {
    const searchLower = term.toLowerCase();
    return (
      String(item.locationNumber || '').toLowerCase().includes(searchLower) ||
      String(item.shipperNumber || '').toLowerCase().includes(searchLower) ||
      String(item.customerPONumber || '').toLowerCase().includes(searchLower) ||
      String(item.partDescription || '').toLowerCase().includes(searchLower) ||
      String(item.shipQuantity || '').toLowerCase().includes(searchLower) ||
      String(item.sellingPrice || '').toLowerCase().includes(searchLower) ||
      String(item.orderDate || '').toLowerCase().includes(searchLower) ||
      String(item.unitPrice || '').toLowerCase().includes(searchLower) ||
      String(item.returnedQuantity || '').toLowerCase().includes(searchLower)
    );
  });
}; 