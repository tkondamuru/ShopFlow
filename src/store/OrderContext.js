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
};

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  // View state
  const [currentView, setCurrentView] = useState('home');
  const [orderHistorySearch, setOrderHistorySearch] = useState(initialOrderHistorySearch);
  
  // Store last-used order history search params
  const [orderHistorySearchParams, setOrderHistorySearchParams] = useState({});
  
  // Shop tracking
  const [currentShopId, setCurrentShopId] = useState(null);
  
  // Active Orders data
  const [activeOrders, setActiveOrders] = useState([]);
  const [activeOrdersLoaded, setActiveOrdersLoaded] = useState(false);
  
  // Active Returns data
  const [activeReturns, setActiveReturns] = useState([]);
  const [activeReturnsLoaded, setActiveReturnsLoaded] = useState(false);
  
  // Order History data
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderHistoryLoaded, setOrderHistoryLoaded] = useState(false);

  // Clear all order context state
  const clearOrderContext = () => {
    console.log(`🧹 [OrderContext] clearOrderContext called - resetting to home`);
    setCurrentView('home');
    setOrderHistorySearch(initialOrderHistorySearch);
    setOrderHistorySearchParams({});
  };

  // Clear everything (for shop changes)
  const clearAllOrderContext = () => {
    console.log(`🧹 [OrderContext] clearAllOrderContext called - resetting everything`);
    setCurrentView('home');
    setOrderHistorySearch(initialOrderHistorySearch);
    setOrderHistorySearchParams({});
    // Clear all cached data
    setActiveOrders([]);
    setActiveOrdersLoaded(false);
    setActiveReturns([]);
    setActiveReturnsLoaded(false);
    setOrderHistory([]);
    setOrderHistoryLoaded(false);
    setCurrentShopId(null);
  };

  // Check and clear context if shop changed
  const checkAndClearContext = (newShopId) => {
    if (currentShopId && currentShopId !== newShopId) {
      console.log(`🔄 [OrderContext] Shop changed from ${currentShopId} to ${newShopId}, clearing context`);
      clearAllOrderContext();
    }
    setCurrentShopId(newShopId);
  };

  return (
    <OrderContext.Provider value={{
      currentView,
      setCurrentView,
      orderHistorySearch,
      setOrderHistorySearch,
      orderHistorySearchParams,
      setOrderHistorySearchParams,
      // Shop tracking
      currentShopId,
      checkAndClearContext,
      // Active Orders data
      activeOrders,
      setActiveOrders,
      activeOrdersLoaded,
      setActiveOrdersLoaded,
      // Active Returns data
      activeReturns,
      setActiveReturns,
      activeReturnsLoaded,
      setActiveReturnsLoaded,
      // Order History data
      orderHistory,
      setOrderHistory,
      orderHistoryLoaded,
      setOrderHistoryLoaded,
      clearOrderContext,
      clearAllOrderContext,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => useContext(OrderContext); 