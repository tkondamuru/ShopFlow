import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Repository, API_BASE_URL } from '../services/Repository';

export const CustomerContext = createContext();

const JWT_KEY = 'jwt_token';
const JWT_EXP_KEY = 'jwt_exp';
const SHOPS_KEY = 'shops';
const SELECTED_SHOP_KEY = 'selected_shop';
const CANCELLED_ORDERS_KEY = 'cancelled_orders';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]); // Cart items (for badge, always from selectedShop)
  const [shops, setShops] = useState([]); // All shops for user
  const [selectedShop, setSelectedShop] = useState(null); // Currently selected shop
  const [cancelledOrders, setCancelledOrders] = useState({}); // Store cancelled orders per ship_to_no

  useEffect(() => {
    tryAutoLogin();
  }, []);

  // Load cancelled orders from storage
  const loadCancelledOrders = async () => {
    try {
      const cancelledOrdersStr = await SecureStore.getItemAsync(CANCELLED_ORDERS_KEY);
      if (cancelledOrdersStr) {
        setCancelledOrders(JSON.parse(cancelledOrdersStr));
      }
    } catch (error) {
      console.error('Error loading cancelled orders:', error);
    }
  };

  // Save cancelled orders to storage
  const saveCancelledOrders = async (cancelledOrdersData) => {
    try {
      await SecureStore.setItemAsync(CANCELLED_ORDERS_KEY, JSON.stringify(cancelledOrdersData));
    } catch (error) {
      console.error('Error saving cancelled orders:', error);
    }
  };

  // Add cancelled order/item
  const addCancelledOrder = async (shipToNo, cancelledItem) => {
    const updatedCancelledOrders = { ...cancelledOrders };
    
    if (!updatedCancelledOrders[shipToNo]) {
      updatedCancelledOrders[shipToNo] = [];
    }
    
    // Add new cancelled item
    updatedCancelledOrders[shipToNo].push({
      ...cancelledItem,
      cancelledAt: new Date().toISOString()
    });
    
    // Keep only last 20 items
    if (updatedCancelledOrders[shipToNo].length > 20) {
      updatedCancelledOrders[shipToNo] = updatedCancelledOrders[shipToNo].slice(-20);
    }
    
    setCancelledOrders(updatedCancelledOrders);
    await saveCancelledOrders(updatedCancelledOrders);
  };

  // Check if an item is cancelled
  const isItemCancelled = (shipToNo, locationNumber, shipperNumber, itemUIDNumber) => {
    if (!cancelledOrders[shipToNo]) return false;
    
    return cancelledOrders[shipToNo].some(item => 
      item.locationNumber === locationNumber &&
      item.shipperNumber === shipperNumber &&
      (item.itemUIDNumber === itemUIDNumber || item.itemUIDNumber === -1)
    );
  };

  // Clear cancelled orders for a specific shop
  const clearCancelledOrders = async (shipToNo) => {
    const updatedCancelledOrders = { ...cancelledOrders };
    delete updatedCancelledOrders[shipToNo];
    setCancelledOrders(updatedCancelledOrders);
    await saveCancelledOrders(updatedCancelledOrders);
  };

  // Fetch shops for user, add Items array, persist
  const fetchAndStoreShops = async (username) => {
    const shopList = await Repository.fetchShops(username);
    const shopsWithItems = shopList.shops.map(shop => ({ ...shop, Items: [] }));
    setShops(shopsWithItems);
    await SecureStore.setItemAsync(SHOPS_KEY, JSON.stringify(shopsWithItems));
    return shopsWithItems;
  };

  // Persist selected shop
  const persistSelectedShop = async (shop) => {
    setSelectedShop(shop);
    setItems(shop?.Items || []);
    if (shop) {
      await SecureStore.setItemAsync(SELECTED_SHOP_KEY, JSON.stringify(shop));
    } else {
      await SecureStore.deleteItemAsync(SELECTED_SHOP_KEY);
    }
  };

  // Load shops and selected shop from storage
  const loadShopsFromStorage = async () => {
    const shopsStr = await SecureStore.getItemAsync(SHOPS_KEY);
    const selectedShopStr = await SecureStore.getItemAsync(SELECTED_SHOP_KEY);
    let loadedShops = [];
    let loadedSelectedShop = null;
    if (shopsStr) {
      loadedShops = JSON.parse(shopsStr);
      setShops(loadedShops);
    }
    if (selectedShopStr) {
      loadedSelectedShop = JSON.parse(selectedShopStr);
      setSelectedShop(loadedSelectedShop);
      setItems(loadedSelectedShop?.Items || []);
    }
    return { loadedShops, loadedSelectedShop };
  };

  // Clear shops and selected shop from context and storage
  const clearShops = async () => {
    setShops([]);
    setSelectedShop(null);
    setItems([]);
    await SecureStore.deleteItemAsync(SHOPS_KEY);
    await SecureStore.deleteItemAsync(SELECTED_SHOP_KEY);
  };

  // Update selected shop and persist
  const updateSelectedShop = async (shop) => {
    setSelectedShop(shop);
    setItems(shop?.Items || []);
    await SecureStore.setItemAsync(SELECTED_SHOP_KEY, JSON.stringify(shop));
  };

  // Update shops and persist
  const updateShops = async (newShops) => {
    setShops(newShops);
    await SecureStore.setItemAsync(SHOPS_KEY, JSON.stringify(newShops));
    // If selectedShop is in newShops, update it
    if (selectedShop) {
      const updated = newShops.find(s => s.shipto === selectedShop.shipto);
      if (updated) {
        await updateSelectedShop(updated);
      }
    }
  };

  // On login: fetch shops, persist, and set selected shop if exists
  const login = async (username, password) => {
    const result = await Repository.login(username, password);
    const { token } = result;
    const payload = parseJwt(token);
    if (!payload || !payload.sub || !payload.exp) throw new Error('Invalid token');
    setJwt(token);
    setCustomer({ id: payload.sub });
    await SecureStore.setItemAsync(JWT_KEY, token);
    await SecureStore.setItemAsync(JWT_EXP_KEY, String(payload.exp * 1000)); // store as ms
    // Fetch shops and persist
    const shopList = await fetchAndStoreShops(payload.sub);
    setShops(shopList);
    // Try to load previous selected shop
    const selectedShopStr = await SecureStore.getItemAsync(SELECTED_SHOP_KEY);
    let loadedSelectedShop = null;
    if (selectedShopStr) {
      loadedSelectedShop = JSON.parse(selectedShopStr);
      // Find in new shopList
      const found = shopList.find(s => s.shipto === loadedSelectedShop.shipto);
      if (found) {
        await persistSelectedShop(found);
      } else {
        await persistSelectedShop(null);
      }
    } else {
      await persistSelectedShop(null);
    }
    // Load cancelled orders
    await loadCancelledOrders();
  };

  const logout = async () => {
    setJwt(null);
    setCustomer(null);
    setItems([]);
    await SecureStore.deleteItemAsync(JWT_KEY);
    await SecureStore.deleteItemAsync(JWT_EXP_KEY);
    await clearShops();
  };

  // On app start, try auto-login and load shops/selectedShop
  const tryAutoLogin = async () => {
    setLoading(true);
    const token = await SecureStore.getItemAsync(JWT_KEY);
    const exp = await SecureStore.getItemAsync(JWT_EXP_KEY);
    if (token && exp && Date.now() < Number(exp)) {
      const payload = parseJwt(token);
      setJwt(token);
      setCustomer({ id: payload?.sub });
      await loadShopsFromStorage();
      await loadCancelledOrders();
    } else {
      await logout();
    }
    setLoading(false);
  };

  return (
    <CustomerContext.Provider value={{
      customer, setCustomer, jwt, login, logout, tryAutoLogin, loading,
      items, setItems, shops, setShops, selectedShop, setSelectedShop,
      fetchAndStoreShops, updateSelectedShop, updateShops, clearShops, persistSelectedShop,
      cancelledOrders, addCancelledOrder, isItemCancelled, clearCancelledOrders
    }}>
      {children}
    </CustomerContext.Provider>
  );
};