import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Button, List, Divider, Chip } from 'react-native-paper';
import { CustomerContext } from '../store/CustomerContext';
import { useOrderContext } from '../store/OrderContext';
import Layout from '../components/Layout';
import ShopSelectorModal from '../components/ShopSelectorModal';
import OrdersHeader from '../components/OrdersHeader';
import OrdersList from '../components/OrdersList';
import OrderHistoryList from '../components/OrderHistoryList';
import ReturnCart from '../components/ReturnCart';
import OrderItemModal from '../components/OrderItemModal';
import OrderHistorySearchModal from '../components/OrderHistorySearchModal';
import ActiveOrdersRepository from '../services/ActiveOrdersRepository';
import OrderHistoryRepository from '../services/OrderHistoryRepository';
import { formatPrice, formatDeparture, searchActiveOrders, searchActiveReturns, searchOrderHistory } from '../utils/ordersUtils';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const OrdersScreen = ({ navigation }) => {
  const { 
    customer, 
    updateSelectedShop, 
    selectedShop,
    addCancelledOrder,
    isItemCancelled,
    clearCancelledOrders,
    selectShopAndNavigateHome
  } = useContext(CustomerContext);
  const {
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
  } = useOrderContext();
  
  // UI State
  const [shopModalVisible, setShopModalVisible] = useState(false);
  const [loadingActiveOrders, setLoadingActiveOrders] = useState(false);
  const [loadingActiveReturns, setLoadingActiveReturns] = useState(false);
  const [loadingOrderHistory, setLoadingOrderHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [pressedItemKey, setPressedItemKey] = useState(null);
  const [selectedGroupItems, setSelectedGroupItems] = useState([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [orderHistorySearchMode, setOrderHistorySearchMode] = useState('data');
  const [returnCartItems, setReturnCartItems] = useState([]);
  const [returnCartVisible, setReturnCartVisible] = useState(false);
  const [orderHistorySearchModalVisible, setOrderHistorySearchModalVisible] = useState(false);
  const [searchingOrderHistory, setSearchingOrderHistory] = useState(false);

  const activeOrdersRepo = new ActiveOrdersRepository();
  const orderHistoryRepo = new OrderHistoryRepository();

  // Check shop ID and clear context if needed
  useEffect(() => {
    if (selectedShop?.shipto) {
      checkAndClearContext(selectedShop.shipto);
    }
  }, []);

  // Smart data loading functions
  const loadActiveOrders = async () => {
    console.log(`🎯 [OrdersScreen] loadActiveOrders called:`, {
      hasShop: !!selectedShop?.shipto,
      shopId: selectedShop?.shipto,
      activeOrdersLoaded,
      activeOrdersLength: activeOrders?.length || 0,
      currentView
    });
    
    if (!selectedShop?.shipto) return;
    
    if (activeOrdersLoaded && activeOrders.length > 0) {
      console.log(`📋 [OrdersScreen] Using cached active orders: ${activeOrders.length} orders`);
      return;
    }
    
    console.log(`📥 [OrdersScreen] Loading active orders from API...`);
    await fetchActiveOrders();
  };

  const loadActiveReturns = async () => {
    console.log(`🎯 [OrdersScreen] loadActiveReturns called:`, {
      hasShop: !!selectedShop?.shipto,
      shopId: selectedShop?.shipto,
      activeReturnsLoaded,
      activeReturnsLength: activeReturns?.length || 0,
      currentView
    });
    
    if (!selectedShop?.shipto) return;
    
    if (activeReturnsLoaded && activeReturns.length > 0) {
      console.log(`📋 [OrdersScreen] Using cached active returns: ${activeReturns.length} returns`);
      return;
    }
    
    console.log(`📥 [OrdersScreen] Loading active returns from API...`);
    await fetchActiveReturns();
  };

  const loadOrderHistory = async () => {
    console.log(`🎯 [OrdersScreen] loadOrderHistory called:`, {
      hasShop: !!selectedShop?.shipto,
      shopId: selectedShop?.shipto,
      orderHistoryLoaded,
      orderHistoryLength: orderHistory?.length || 0,
      currentView
    });
    
    if (!selectedShop?.shipto) return;
    
    if (orderHistoryLoaded && orderHistory.length > 0) {
      console.log(`📋 [OrdersScreen] Using cached order history: ${orderHistory.length} orders`);
      return;
    }
    
    console.log(`📥 [OrdersScreen] Loading order history from API...`);
    await fetchOrderHistory();
  };

  // API fetch functions
  const fetchActiveOrders = async () => {
    if (!selectedShop?.shipto) return;
    
    console.log(`🔄 [OrdersScreen] Fetching active orders for shop: ${selectedShop.shipto}`);
    setLoadingActiveOrders(true);
    
    try {
      const data = await activeOrdersRepo.getActiveOrders(selectedShop.shipto);
      console.log(`✅ [OrdersScreen] Active orders fetched: ${data.orders?.length || 0} orders`);
      setActiveOrders(data.orders || []);
      setActiveOrdersLoaded(true);
    } catch (e) {
      console.error(`❌ [OrdersScreen] Failed to fetch active orders:`, e.message);
      setActiveOrders([]);
    } finally {
      setLoadingActiveOrders(false);
      setRefreshing(false);
    }
  };

  const fetchActiveReturns = async () => {
    if (!selectedShop?.shipto) return;
    
    console.log(`🔄 [OrdersScreen] Fetching active returns for shop: ${selectedShop.shipto}`);
    setLoadingActiveReturns(true);
    
    try {
      const data = await activeOrdersRepo.getActiveReturns(selectedShop.shipto);
      console.log(`✅ [OrdersScreen] Active returns fetched: ${data.returns?.length || 0} returns`);
      setActiveReturns(data.returns || []);
      setActiveReturnsLoaded(true);
    } catch (e) {
      console.error(`❌ [OrdersScreen] Failed to fetch active returns:`, e.message);
      setActiveReturns([]);
    } finally {
      setLoadingActiveReturns(false);
      setRefreshing(false);
    }
  };

  const fetchOrderHistory = async () => {
    if (!selectedShop?.shipto) return;
    
    console.log(`🔄 [OrdersScreen] Fetching order history for shop: ${selectedShop.shipto}`);
    console.log(`📅 [OrdersScreen] Date range: ${orderHistorySearch.startDate} to ${orderHistorySearch.endDate}`);
    setLoadingOrderHistory(true);
    
    try {
      const data = await orderHistoryRepo.getOrderHistory(
        selectedShop.shipto,
        orderHistorySearch.startDate,
        orderHistorySearch.endDate
      );
      console.log(`✅ [OrdersScreen] Order history fetched: ${data.history?.length || 0} orders`);
      setOrderHistory(data.history || []);
      setOrderHistoryLoaded(true);
    } catch (e) {
      console.error(`❌ [OrdersScreen] Failed to fetch order history:`, e.message);
      setOrderHistory([]);
    } finally {
      setLoadingOrderHistory(false);
      setRefreshing(false);
    }
  };

  // Order actions
  const handleCancelOrder = (group) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This will cancel all items in this group.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: async () => {
          try {
            const response = await activeOrdersRepo.cancelActiveOrder(
              group.locationNumber,
              group.shipperNumber,
              -1, // item_uid_no for group cancellation
              -1  // arg_part_no for group cancellation
            );
            if (response.success) {
              await addCancelledOrder(selectedShop.shipto, {
                locationNumber: group.locationNumber,
                shipperNumber: group.shipperNumber,
                itemUIDNumber: -1,
                partDescription: 'ENTIRE_ORDER'
              });
              Alert.alert('Success', response.message || 'Order cancelled successfully');
              fetchActiveOrders();
            } else {
              Alert.alert('Error', response.message || 'Failed to cancel order');
            }
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to cancel order');
          }
        } },
      ]
    );
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item from the order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: async () => {
          try {
            const response = await activeOrdersRepo.cancelActiveOrder(
              item.locationNumber,
              item.shipperNumber,
              item.itemUIDNumber,
              item.partDescription
            );
            if (response.success) {
              await addCancelledOrder(selectedShop.shipto, {
                locationNumber: item.locationNumber,
                shipperNumber: item.shipperNumber,
                itemUIDNumber: item.itemUIDNumber,
                partDescription: item.partDescription
              });
              Alert.alert('Success', response.message || 'Item deleted successfully');
              setItemModalVisible(false);
              fetchActiveOrders();
            } else {
              Alert.alert('Error', response.message || 'Failed to delete item');
            }
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to delete item');
          }
        } },
      ]
    );
  };

  // Helper functions
  const getItemStatus = (item) => {
    if (isItemCancelled(selectedShop.shipto, item.locationNumber, item.shipperNumber, item.itemUIDNumber)) {
      return 'CAN';
    }
    return item.orderStatusCode;
  };

  const isGroupCancelled = (group) => {
    return isItemCancelled(selectedShop.shipto, group.locationNumber, group.shipperNumber, -1);
  };

  const showItemDetails = (item, groupItems = null) => {
    setSelectedItem(item);
    setItemModalVisible(true);
    const itemKey = `${item.locationNumber}-${item.shipperNumber}-${item.itemUIDNumber}`;
    setPressedItemKey(itemKey);
    if (groupItems) {
      setSelectedGroupItems(groupItems);
      setSelectedGroupIndex(groupItems.findIndex(i => i.itemUIDNumber === item.itemUIDNumber));
    } else {
      setSelectedGroupItems([]);
      setSelectedGroupIndex(0);
    }
  };

  const handleModalNav = (direction) => {
    if (!selectedGroupItems.length) return;
    let newIndex = selectedGroupIndex + direction;
    if (newIndex < 0 || newIndex >= selectedGroupItems.length) return;
    const newItem = selectedGroupItems[newIndex];
    setSelectedItem(newItem);
    setSelectedGroupIndex(newIndex);
    const itemKey = `${newItem.locationNumber}-${newItem.shipperNumber}-${newItem.itemUIDNumber}`;
    setPressedItemKey(itemKey);
  };

  // Search functions
  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    if (isSearchMode) {
      setSearchTerm('');
    }
  };

  const handleSearchChange = (text) => {
    setSearchTerm(text);
  };

  const handleOrderHistorySearchModeChange = (mode) => {
    setOrderHistorySearchMode(mode);
    if (mode === 'date') {
      fetchOrderHistory();
    }
  };

  // Return Cart handlers
  const handleAddToReturnCart = (order) => {
    const isAlreadyInCart = returnCartItems.some(item => item.id === order.id);
    if (!isAlreadyInCart) {
      setReturnCartItems([...returnCartItems, order]);
    }
  };

  const handleRemoveFromReturnCart = (order) => {
    setReturnCartItems(returnCartItems.filter(item => item.id !== order.id));
  };

  const handleCreateReturn = () => {
    Alert.alert(
      'Create Return',
      `Create return for ${returnCartItems.length} order(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create', onPress: () => {
          console.log('Creating return for:', returnCartItems);
          setReturnCartItems([]);
          setReturnCartVisible(false);
        } },
      ]
    );
  };

  // Order History search functionality
  const handleOrderHistorySearch = async (searchParams) => {
    if (!selectedShop?.shipto) return;
    setOrderHistorySearchParams(searchParams); // Save last-used params
    setSearchingOrderHistory(true);
    setOrderHistorySearchModalVisible(false);
    
    try {
      const data = await orderHistoryRepo.searchOrderHistory(selectedShop.shipto, searchParams);
      console.log(`✅ [OrdersScreen] Search results: ${data.history?.length || 0} orders`);
      setOrderHistory(data.history || []);
      setOrderHistoryLoaded(true);
    } catch (e) {
      console.error(`❌ [OrdersScreen] Failed to search order history:`, e.message);
      Alert.alert('Search Failed', 'Failed to search order history. Please try again.');
    } finally {
      setSearchingOrderHistory(false);
    }
  };

  const handleOpenOrderHistorySearch = () => {
    setOrderHistorySearchModalVisible(true);
  };

  // Get filtered data based on search
  const getFilteredData = (data, searchFunction) => {
    if (!isSearchMode || !searchTerm.trim()) {
      return data;
    }
    return searchFunction(data, searchTerm);
  };

  // Get filtered order history data
  const getFilteredOrderHistory = () => {
    if (!isSearchMode || !searchTerm.trim()) {
      return orderHistory;
    }
    return searchOrderHistory(orderHistory, searchTerm);
  };

  // UI Components
  const renderActiveOrders = () => {
    const filteredData = getFilteredData(activeOrders, searchActiveOrders);
    
    return (
      <>
        <OrdersHeader 
          title={`Active Orders (${filteredData.length})`} 
          onBackPress={() => setCurrentView('home')}
          showSearch={true}
          showLoading={loadingActiveOrders}
          isSearchMode={isSearchMode}
          onToggleSearch={toggleSearchMode}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search: By any field"
        />
        <OrdersList
          items={filteredData}
          loading={loadingActiveOrders}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setActiveOrdersLoaded(false);
            fetchActiveOrders();
          }}
          onItemPress={showItemDetails}
          onCancelOrder={handleCancelOrder}
          onDeleteItem={handleDeleteItem}
          pressedItemKey={pressedItemKey}
          isActiveOrders={true}
          formatPrice={formatPrice}
          getItemStatus={getItemStatus}
          isGroupCancelled={isGroupCancelled}
          searchTerm={searchTerm}
        />
        <OrderItemModal
          visible={itemModalVisible}
          selectedItem={selectedItem}
          selectedGroupItems={selectedGroupItems}
          selectedGroupIndex={selectedGroupIndex}
          onClose={() => setItemModalVisible(false)}
          onDelete={handleDeleteItem}
          onNavigate={handleModalNav}
          isActiveOrders={true}
          formatPrice={formatPrice}
          formatDeparture={formatDeparture}
          getItemStatus={getItemStatus}
        />
      </>
    );
  };

  const renderActiveReturns = () => {
    const filteredData = getFilteredData(activeReturns, searchActiveReturns);
    
    return (
      <>
        <OrdersHeader 
          title={`Active Returns (${filteredData.length})`} 
          onBackPress={() => setCurrentView('home')}
          showSearch={true}
          showLoading={loadingActiveReturns}
          isSearchMode={isSearchMode}
          onToggleSearch={toggleSearchMode}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search: By any field"
        />
        <OrdersList
          items={filteredData}
          loading={loadingActiveReturns}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setActiveReturnsLoaded(false);
            fetchActiveReturns();
          }}
          onItemPress={showItemDetails}
          onCancelOrder={null}
          onDeleteItem={null}
          pressedItemKey={pressedItemKey}
          isActiveOrders={false}
          formatPrice={formatPrice}
          getItemStatus={getItemStatus}
          isGroupCancelled={isGroupCancelled}
          searchTerm={searchTerm}
        />
        <OrderItemModal
          visible={itemModalVisible}
          selectedItem={selectedItem}
          selectedGroupItems={selectedGroupItems}
          selectedGroupIndex={selectedGroupIndex}
          onClose={() => setItemModalVisible(false)}
          onDelete={null}
          onNavigate={handleModalNav}
          isActiveOrders={false}
          formatPrice={formatPrice}
          formatDeparture={formatDeparture}
          getItemStatus={getItemStatus}
        />
      </>
    );
  };

  const renderOrderHistory = () => {
    return (
      <>
        <OrdersHeader 
          title={`Order History (${orderHistory.length})`} 
          onBackPress={() => setCurrentView('home')}
          showSearch={true}
          showServerSearch={true}
          showLoading={loadingOrderHistory || searchingOrderHistory}
          isSearchMode={isSearchMode}
          onToggleSearch={toggleSearchMode}
          onSearchChange={handleSearchChange}
          onServerSearch={handleOpenOrderHistorySearch}
          searchPlaceholder="Search: Order Number, Date, Status, Total, Items"
        />
        {orderHistoryLoaded && orderHistory.length > 0 ? (
          <OrderHistoryList
            orders={getFilteredOrderHistory()}
            loading={loadingOrderHistory}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setOrderHistoryLoaded(false);
              // Do not auto-fetch; user must search again
            }}
            onOrderPress={(order) => {
              console.log('View order details:', order);
            }}
            onAddToReturnCart={handleAddToReturnCart}
            returnCartItems={returnCartItems}
            searchTerm={searchTerm}
            searchMode={orderHistorySearchMode}
            formatPrice={formatPrice}
            getStatusColor={getStatusColor}
          />
        ) : null}
        <ReturnCart
          returnCartItems={returnCartItems}
          onRemoveFromCart={handleRemoveFromReturnCart}
          onCreateReturn={handleCreateReturn}
          onClose={() => setReturnCartVisible(false)}
          visible={returnCartVisible}
          formatPrice={formatPrice}
        />
        {returnCartItems.length > 0 && !returnCartVisible && (
          <TouchableOpacity 
            style={styles.returnCartToggle}
            onPress={() => setReturnCartVisible(true)}
          >
            <MaterialIcons name="shopping-cart" size={24} color="white" />
            <Text style={styles.returnCartToggleText}>{returnCartItems.length}</Text>
          </TouchableOpacity>
        )}
        <OrderHistorySearchModal
          visible={orderHistorySearchModalVisible}
          onDismiss={() => setOrderHistorySearchModalVisible(false)}
          onSearch={handleOrderHistorySearch}
          loading={searchingOrderHistory}
          initialSearchParams={orderHistorySearchParams}
        />
      </>
    );
  };

  const renderHome = () => {
    
    return (
      <ScrollView style={styles.container}>
        <OrdersHeader 
          title="Orders & Returns"
          onBackPress={() => navigation.goBack()} 
          showSearch={false}
                />
        <Card style={styles.card}>
          <Card.Content>
            <List.Item
              title="Active Orders"
              left={props => <List.Icon {...props} icon="package-variant" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                setCurrentView('activeOrders');
                setTimeout(() => loadActiveOrders(), 0);
              }}
            />
            <Divider />
            <List.Item
              title="Active Returns"
              left={props => <List.Icon {...props} icon="backup-restore" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                setCurrentView('activeReturns');
                setTimeout(() => loadActiveReturns(), 0);
              }}
            />
            <Divider />
            <List.Item
              title="Order History"
              left={props => <List.Icon {...props} icon="history" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                setCurrentView('orderHistory');
                // Do not loadOrderHistory automatically here
              }}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing': return '#FFF3E0';
      case 'shipped': return '#E3F2FD';
      case 'delivered': return '#E8F5E8';
      case 'pending': return '#FFF8E1';
      default: return '#F5F5F5';
    }
  };

  const handleShopSelect = async (shop) => {
    await selectShopAndNavigateHome(shop, navigation);
    setShopModalVisible(false);
  };

  // Show search modal on first entry to Order History if not loaded or empty
  useEffect(() => {
    if (currentView === 'orderHistory' && (!orderHistoryLoaded || orderHistory.length === 0)) {
      setOrderHistorySearchModalVisible(true);
    }
  }, [currentView, orderHistoryLoaded, orderHistory.length]);

  return (
    <Layout 
      navigation={navigation}
      currentRoute="Orders"
      onOpenShopModal={() => setShopModalVisible(true)}
      onBottomNavPress={(route) => {
        if (route !== 'Orders') {
          navigation.navigate(route);
        }
      }}
    >
      <>
        {currentView === 'home' && renderHome()}
        {currentView === 'activeOrders' && renderActiveOrders()}
        {currentView === 'activeReturns' && renderActiveReturns()}
        {currentView === 'orderHistory' && renderOrderHistory()}
        <ShopSelectorModal
          visible={shopModalVisible}
          onDismiss={() => setShopModalVisible(false)}
          onSelect={handleShopSelect}
        />
      </>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  returnCartToggle: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  returnCartToggleText: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f44336',
    color: 'white',
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});

export default OrdersScreen; 