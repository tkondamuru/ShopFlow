import React, { createContext, useContext, useState } from 'react';

// Utility to get date string in YYYY-MM-DD format
const defaultDate = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

const initialOrderHistorySearch = {
  endDate: defaultDate(0), // today
  startDate: defaultDate(-30), // 30 days ago
  // Add more search params as needed
};

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'activeOrders', 'activeReturns', 'orderHistory'
  const [orderHistorySearch, setOrderHistorySearch] = useState(initialOrderHistorySearch);

  // Optionally, add more state for active orders/returns search, filters, etc.

  // Clear all order context state
  const clearOrderContext = () => {
    setCurrentView('home');
    setOrderHistorySearch(initialOrderHistorySearch);
  };

  return (
    <OrderContext.Provider value={{
      currentView,
      setCurrentView,
      orderHistorySearch,
      setOrderHistorySearch,
      clearOrderContext,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => useContext(OrderContext); 