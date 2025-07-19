import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { Card, Button, List, Divider, IconButton, Chip, Searchbar } from 'react-native-paper';
import { CustomerContext } from '../store/CustomerContext';
import { useOrderContext } from '../store/OrderContext';
import Layout from '../components/Layout';
import ShopSelectorModal from '../components/ShopSelectorModal';
import ActiveOrdersRepository from '../services/ActiveOrdersRepository';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

const OrdersScreen = ({ navigation }) => {
  const { 
    customer, 
    updateSelectedShop, 
    selectedShop,
    addCancelledOrder,
    isItemCancelled,
    clearCancelledOrders
  } = useContext(CustomerContext);
  const {
    currentView,
    setCurrentView,
    orderHistorySearch,
    setOrderHistorySearch,
    clearOrderContext,
  } = useOrderContext();
  const [shopModalVisible, setShopModalVisible] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [loadingActiveOrders, setLoadingActiveOrders] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [pressedItemKey, setPressedItemKey] = useState(null);
  const [selectedGroupItems, setSelectedGroupItems] = useState([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [activeReturns, setActiveReturns] = useState([]);
  const [activeReturnsCount, setActiveReturnsCount] = useState(0);
  const [loadingActiveReturns, setLoadingActiveReturns] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredActiveOrders, setFilteredActiveOrders] = useState([]);
  const [filteredActiveReturns, setFilteredActiveReturns] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const activeOrdersRepo = new ActiveOrdersRepository();

  // Fetch active orders when entering the view
  React.useEffect(() => {
    if (currentView === 'activeOrders') {
      fetchActiveOrders();
    }
    // eslint-disable-next-line
  }, [currentView, selectedShop]);

  // Fetch active returns when entering the view
  React.useEffect(() => {
    if (currentView === 'activeReturns') {
      fetchActiveReturns();
    }
    // eslint-disable-next-line
  }, [currentView, selectedShop]);

  // Clear order context when shop changes
  React.useEffect(() => {
    if (selectedShop) {
      clearOrderContext();
    }
  }, [selectedShop]);

  const fetchActiveOrders = async () => {
    if (!selectedShop?.shipto) return;
    setLoadingActiveOrders(true);
    try {
      const data = await activeOrdersRepo.getActiveOrders(selectedShop.shipto);
      setActiveOrders(data.orders || []);
      setActiveOrdersCount(data.count || 0);
    } catch (e) {
      setActiveOrders([]);
      setActiveOrdersCount(0);
    } finally {
      setLoadingActiveOrders(false);
      setRefreshing(false);
    }
  };

  const fetchActiveReturns = async () => {
    if (!selectedShop?.shipto) return;
    setLoadingActiveReturns(true);
    try {
      const data = await activeOrdersRepo.getActiveReturns(selectedShop.shipto);
      setActiveReturns(data.returns || []);
      setActiveReturnsCount(data.count || 0);
    } catch (e) {
      setActiveReturns([]);
      setActiveReturnsCount(0);
    } finally {
      setLoadingActiveReturns(false);
      setRefreshing(false);
    }
  };

  // Group orders by locationNumber + shipperNumber
  const groupActiveOrders = (orders) => {
    const groups = {};
    orders.forEach(item => {
      const groupKey = `${item.locationNumber}-${item.shipperNumber}`;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          locationNumber: item.locationNumber,
          shipperNumber: item.shipperNumber,
          customerPONumber: item.customerPONumber,
          items: [],
        };
      }
      groups[groupKey].items.push(item);
    });
    return Object.values(groups);
  };

  // Group returns by locationNumber + shipperNumber
  const groupActiveReturns = (returns) => {
    const groups = {};
    returns.forEach(item => {
      const groupKey = `${item.locationNumber}-${item.shipperNumber}`;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          locationNumber: item.locationNumber,
          shipperNumber: item.shipperNumber,
          customerPONumber: item.customerPONumber,
          items: [],
        };
      }
      groups[groupKey].items.push(item);
    });
    return Object.values(groups);
  };

  // Cancel order handler (group)
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
              // Store cancelled order in context
              await addCancelledOrder(selectedShop.shipto, {
                locationNumber: group.locationNumber,
                shipperNumber: group.shipperNumber,
                itemUIDNumber: -1, // -1 indicates entire group cancelled
                partDescription: 'ENTIRE_ORDER'
              });
              Alert.alert('Success', response.message || 'Order cancelled successfully');
              // Refresh the orders list
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

  // Delete item handler
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
              // Store cancelled item in context
              await addCancelledOrder(selectedShop.shipto, {
                locationNumber: item.locationNumber,
                shipperNumber: item.shipperNumber,
                itemUIDNumber: item.itemUIDNumber,
                partDescription: item.partDescription
              });
              Alert.alert('Success', response.message || 'Item deleted successfully');
              // Close modal and refresh the orders list
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

  // Helper to get item status (check if cancelled)
  const getItemStatus = (item) => {
    if (isItemCancelled(selectedShop.shipto, item.locationNumber, item.shipperNumber, item.itemUIDNumber)) {
      return 'CAN';
    }
    return item.orderStatusCode;
  };

  // Helper to check if entire group is cancelled
  const isGroupCancelled = (group) => {
    return isItemCancelled(selectedShop.shipto, group.locationNumber, group.shipperNumber, -1);
  };

  // Helper to format price
  const formatPrice = (value) => {
    if (value == null || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return value;
    return `$${num.toFixed(2)}`;
  };

  // Helper to format date
  const formatDeparture = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return format(date, 'dd-MMM-yyyy hh:mm:ss a');
    } catch {
      return dateString;
    }
  };

  // Show item details modal
  const showItemDetails = (item, groupItems = null) => {
    setSelectedItem(item);
    setItemModalVisible(true);
    // Set pressed state for visual feedback
    const itemKey = `${item.locationNumber}-${item.shipperNumber}-${item.itemUIDNumber}`;
    setPressedItemKey(itemKey);
    // For modal navigation
    if (groupItems) {
      setSelectedGroupItems(groupItems);
      setSelectedGroupIndex(groupItems.findIndex(i => i.itemUIDNumber === item.itemUIDNumber));
    } else {
      setSelectedGroupItems([]);
      setSelectedGroupIndex(0);
    }
  };

  // Handler for modal navigation
  const handleModalNav = (direction) => {
    if (!selectedGroupItems.length) return;
    let newIndex = selectedGroupIndex + direction;
    if (newIndex < 0 || newIndex >= selectedGroupItems.length) return;
    const newItem = selectedGroupItems[newIndex];
    setSelectedItem(newItem);
    setSelectedGroupIndex(newIndex);
    // Update pressed row in list
    const itemKey = `${newItem.locationNumber}-${newItem.shipperNumber}-${newItem.itemUIDNumber}`;
    setPressedItemKey(itemKey);
  };

  // Search functionality for Active Orders
  const searchActiveOrders = (term) => {
    if (!term.trim()) {
      setFilteredActiveOrders(activeOrders);
      return;
    }
    
    const filtered = activeOrders.filter(item => {
      const searchLower = term.toLowerCase();
      const matches = (
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
      
      // if (matches) {
      //   console.log('Active Orders - Item matched search:', {
      //     searchTerm: term,
      //     item: item,
      //     matchedFields: {
      //       locationNumber: String(item.locationNumber || '').toLowerCase().includes(searchLower),
      //       shipperNumber: String(item.shipperNumber || '').toLowerCase().includes(searchLower),
      //       customerPONumber: String(item.customerPONumber || '').toLowerCase().includes(searchLower),
      //       partDescription: String(item.partDescription || '').toLowerCase().includes(searchLower),
      //       shipQuantity: String(item.shipQuantity || '').toLowerCase().includes(searchLower),
      //       totalPrice: String(item.totalPrice || '').toLowerCase().includes(searchLower),
      //       unitPrice: String(item.unitPrice || '').toLowerCase().includes(searchLower),
      //       departureDateTime: String(item.departureDateTime || '').toLowerCase().includes(searchLower),
      //       callerName: String(item.callerName || '').toLowerCase().includes(searchLower),
      //       lineItemPoNumber: String(item.lineItemPoNumber || '').toLowerCase().includes(searchLower),
      //       orderStatusCode: String(item.orderStatusCode || '').toLowerCase().includes(searchLower)
      //     }
      //   });
      // }
      
      return matches;
    });
    setFilteredActiveOrders(filtered);
  };

  // Search functionality for Active Returns
  const searchActiveReturns = (term) => {
    if (!term.trim()) {
      setFilteredActiveReturns(activeReturns);
      return;
    }
    
    const filtered = activeReturns.filter(item => {
      const searchLower = term.toLowerCase();
      const matches = (
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
      
      // if (matches) {
      //   console.log('Active Returns - Item matched search:', {
      //     searchTerm: term,
      //     item: item,
      //     matchedFields: {
      //       locationNumber: String(item.locationNumber || '').toLowerCase().includes(searchLower),
      //       shipperNumber: String(item.shipperNumber || '').toLowerCase().includes(searchLower),
      //       customerPONumber: String(item.customerPONumber || '').toLowerCase().includes(searchLower),
      //       partDescription: String(item.partDescription || '').toLowerCase().includes(searchLower),
      //       shipQuantity: String(item.shipQuantity || '').toLowerCase().includes(searchLower),
      //       orderType: String(item.orderType || '').toLowerCase().includes(searchLower),
      //       customerItemPONumber: String(item.customerItemPONumber || '').toLowerCase().includes(searchLower),
      //       purchaseLocationNumber: String(item.purchaseLocationNumber || '').toLowerCase().includes(searchLower),
      //       purchaseShipperNumber: String(item.purchaseShipperNumber || '').toLowerCase().includes(searchLower),
      //       callerName: String(item.callerName || '').toLowerCase().includes(searchLower)
      //     }
      //   });
      // }
      
      return matches;
    });
    setFilteredActiveReturns(filtered);
  };

  // Update filtered data when main data changes
  React.useEffect(() => {
    setFilteredActiveOrders(activeOrders);
  }, [activeOrders]);

  React.useEffect(() => {
    setFilteredActiveReturns(activeReturns);
  }, [activeReturns]);

  // Handle search mode toggle
  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    if (isSearchMode) {
      // Cancel search
      setSearchTerm('');
      if (currentView === 'activeOrders') {
        setFilteredActiveOrders(activeOrders);
      } else if (currentView === 'activeReturns') {
        setFilteredActiveReturns(activeReturns);
      }
    }
  };

  // Handle search text change
  const handleSearchChange = (text) => {
    if (currentView === 'activeOrders') {
      searchActiveOrders(text);
    } else if (currentView === 'activeReturns') {
      searchActiveReturns(text);
    }
  };

  // Active Orders UI
  const renderActiveOrders = () => {
    const groups = groupActiveOrders(filteredActiveOrders);
    return (
      <>
        <CustomHeader 
          title={`Active Orders (${filteredActiveOrders.length})`} 
          showLoading={loadingActiveOrders}
          isSearchMode={isSearchMode}
          onToggleSearch={toggleSearchMode}
          onSearchChange={handleSearchChange}
        />
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="always"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchActiveOrders();
              }}
            />
          }
        >
          <View style={styles.ordersContainer}>
            {!loadingActiveOrders && groups.length === 0 && (
              <Text style={{ textAlign: 'center', marginVertical: 16 }}>
                {searchTerm ? 'No matching orders found.' : 'No active orders found.'}
              </Text>
            )}
            {groups.map((group, idx) => {
              const allOPN = group.items.every(item => getItemStatus(item) === 'OPN');
              const groupCancelled = isGroupCancelled(group);
              return (
                <View key={group.locationNumber + '-' + group.shipperNumber} style={styles.groupContainer}>
                  <View style={styles.groupHeaderCustom}>
                    <View style={styles.groupHeaderLeft}>
                      {allOPN && !groupCancelled && (
                        <TouchableOpacity onPress={() => handleCancelOrder(group)} style={{ marginRight: 6 }}>
                          <MaterialIcons name="delete" size={18} color="#525046" />
                        </TouchableOpacity>
                      )}
                      <Text style={styles.groupHeaderRef}>
                        Ref#: {group.locationNumber}-{group.shipperNumber}
                      </Text>
                    </View>
                    {/* Only show PO if it has value */}
                    {group.customerPONumber && group.customerPONumber.trim() !== ''  ? (
                      <Text style={styles.groupHeaderPO}>
                        PO: {group.customerPONumber}
                      </Text>
                    ) : null}
                  </View>
                  {group.items.map(item => {
                    const itemKey = `${item.locationNumber}-${item.shipperNumber}-${item.itemUIDNumber}`;
                    const isPressed = pressedItemKey === itemKey;
                    const itemStatus = getItemStatus(item);
                    const isCancelled = itemStatus === 'CAN';
                    return (
                      <TouchableOpacity
                        key={itemKey}
                        onPress={() => showItemDetails(item, group.items)}
                        style={[
                          styles.itemRow,
                          isPressed && styles.itemRowPressed,
                          isCancelled && styles.itemRowCancelled
                        ]}
                      >
                        <View style={styles.itemRowContent}>
                          <Text style={[
                            styles.itemPartNumber,
                            isPressed && styles.itemPartNumberPressed,
                            isCancelled && styles.itemPartNumberCancelled
                          ]}>{item.partDescription}</Text>
                          <View style={styles.itemRowRight}>
                            <Text style={[
                              styles.itemTotalPrice,
                              isPressed && styles.itemTotalPricePressed,
                              isCancelled && styles.itemTotalPriceCancelled
                            ]}>{formatPrice(item.totalPrice)}</Text>
                            <MaterialIcons name="chevron-right" size={20} color={isCancelled ? "#999" : "#666"} />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
        
        {/* Item Details Modal */}
        <Modal
          visible={itemModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setItemModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setItemModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity 
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.modalHeader}>
                  {/* Delete icon if OPN and not cancelled */}
                  {selectedItem && getItemStatus(selectedItem) === 'OPN' && (
                    <TouchableOpacity onPress={() => handleDeleteItem(selectedItem)}>
                      <MaterialIcons name="delete" size={24} color="#d32f2f" />
                    </TouchableOpacity>
                  )}
                  <Text style={styles.modalTitle}>
                    Item Details
                    {selectedGroupItems.length > 1 && (
                      <Text style={styles.modalCounter}>  {selectedGroupIndex + 1} of {selectedGroupItems.length}</Text>
                    )}
                  </Text>
                  <TouchableOpacity onPress={() => setItemModalVisible(false)}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                {selectedItem && (
                  <ScrollView 
                    style={styles.modalContent}
                    keyboardShouldPersistTaps="handled"
                  >
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Part Description:</Text>
                      <Text style={styles.detailValue}>{selectedItem.partDescription}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Quantity:</Text>
                      <Text style={styles.detailValue}>{selectedItem.shipQuantity}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Unit Price:</Text>
                      <Text style={styles.detailValue}>{formatPrice(selectedItem.unitPrice)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Total Price:</Text>
                      <Text style={styles.detailValue}>{formatPrice(selectedItem.totalPrice)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Departure:</Text>
                      <Text style={styles.detailValue}>{formatDeparture(selectedItem.departureDateTime)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Caller:</Text>
                      <Text style={styles.detailValue}>{selectedItem.callerName}</Text>
                    </View>
                    {/* Only show PO Number if it has value */}
                    {selectedItem.lineItemPoNumber && selectedItem.lineItemPoNumber.trim() !== '' ? (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Customer Item PO Number:</Text>
                        <Text style={styles.detailValue}>{selectedItem.lineItemPoNumber}</Text>
                      </View>
                    ) : null}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <Text style={styles.detailValue}>{getItemStatus(selectedItem)}</Text>
                    </View>
                    
                    {/* Navigation buttons at bottom */}
                    {selectedGroupItems.length > 1 && (
                      <View style={styles.modalNavigation}>
                        <TouchableOpacity
                          disabled={selectedGroupIndex <= 0}
                          onPress={() => handleModalNav(-1)}
                          style={[
                            styles.navButton,
                            selectedGroupIndex <= 0 && styles.navButtonDisabled
                          ]}
                        >
                          <MaterialIcons name="chevron-left" size={24} color="#1976D2" />
                          <Text style={styles.navButtonText}>Previous</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          disabled={selectedGroupIndex >= selectedGroupItems.length - 1}
                          onPress={() => handleModalNav(1)}
                          style={[
                            styles.navButton,
                            selectedGroupIndex >= selectedGroupItems.length - 1 && styles.navButtonDisabled
                          ]}
                        >
                          <Text style={styles.navButtonText}>Next</Text>
                          <MaterialIcons name="chevron-right" size={24} color="#1976D2" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </ScrollView>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  };

  // Active Returns UI
  const renderActiveReturns = () => {
    const groups = groupActiveReturns(filteredActiveReturns);
    return (
      <>
        <CustomHeader 
          title={`Active Returns (${filteredActiveReturns.length})`} 
          showLoading={loadingActiveReturns}
          isSearchMode={isSearchMode}
          onToggleSearch={toggleSearchMode}
          onSearchChange={handleSearchChange}
        />
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchActiveReturns();
              }}
            />
          }
        >
          <View style={styles.ordersContainer}>
            {!loadingActiveReturns && groups.length === 0 && (
              <Text style={{ textAlign: 'center', marginVertical: 16 }}>
                {searchTerm ? 'No matching returns found.' : 'No active returns found.'}
              </Text>
            )}
            {groups.map((group, idx) => {
              return (
                <View key={group.locationNumber + '-' + group.shipperNumber} style={styles.groupContainer}>
                  <View style={styles.groupHeaderCustom}>
                    <View style={styles.groupHeaderLeft}>
                      <Text style={styles.groupHeaderRef}>
                        Ref: {group.locationNumber}-{group.shipperNumber}
                      </Text>
                    </View>
                    {/* Only show PO if it has value */}
                    {group.customerPONumber && group.customerPONumber.trim() !== '' ? (
                      <Text style={styles.groupHeaderPO}>
                        PO: {group.customerPONumber}
                      </Text>
                    ) : null}
                  </View>
                  {group.items.map(item => {
                    const itemKey = `${item.locationNumber}-${item.shipperNumber}-${item.itemUIDNumber}`;
                    const isPressed = pressedItemKey === itemKey;
                    return (
                      <TouchableOpacity
                        key={itemKey}
                        onPress={() => showItemDetails(item, group.items)}
                        style={[
                          styles.itemRow,
                          isPressed && styles.itemRowPressed
                        ]}
                      >
                        <View style={styles.itemRowContent}>
                          <Text style={[
                            styles.itemPartNumber,
                            isPressed && styles.itemPartNumberPressed
                          ]}>{item.partDescription}</Text>
                          <View style={styles.itemRowRight}>
                            <Text style={[
                              styles.itemTotalPrice,
                              isPressed && styles.itemTotalPricePressed
                            ]}>{item.orderType}</Text>
                            <MaterialIcons name="chevron-right" size={20} color="#666" />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
        
        {/* Item Details Modal */}
        <Modal
          visible={itemModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setItemModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setItemModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity 
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Item Details
                    {selectedGroupItems.length > 1 && (
                      <Text style={styles.modalCounter}>  {selectedGroupIndex + 1} of {selectedGroupItems.length}</Text>
                    )}
                  </Text>
                  <TouchableOpacity onPress={() => setItemModalVisible(false)}>
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                {selectedItem && (
                  <ScrollView 
                    style={styles.modalContent}
                    keyboardShouldPersistTaps="handled"
                  >
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Part Description:</Text>
                      <Text style={styles.detailValue}>{selectedItem.partDescription}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Ship Quantity:</Text>
                      <Text style={styles.detailValue}>{selectedItem.shipQuantity}</Text>
                    </View>
                    {selectedItem.customerItemPONumber && selectedItem.customerItemPONumber.trim() !== '' ? (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Customer Item PO Number:</Text>
                        <Text style={styles.detailValue}>{selectedItem.customerItemPONumber}</Text>
                      </View>
                    ) : null}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Purchase Location Number:</Text>
                      <Text style={styles.detailValue}>{selectedItem.purchaseLocationNumber}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Purchase Shipper Number:</Text>
                      <Text style={styles.detailValue}>{selectedItem.purchaseShipperNumber}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Caller Name:</Text>
                      <Text style={styles.detailValue}>{selectedItem.callerName}</Text>
                    </View>
                    
                    {/* Navigation buttons at bottom */}
                    {selectedGroupItems.length > 1 && (
                      <View style={styles.modalNavigation}>
                        <TouchableOpacity
                          disabled={selectedGroupIndex <= 0}
                          onPress={() => handleModalNav(-1)}
                          style={[
                            styles.navButton,
                            selectedGroupIndex <= 0 && styles.navButtonDisabled
                          ]}
                        >
                          <MaterialIcons name="chevron-left" size={24} color="#1976D2" />
                          <Text style={styles.navButtonText}>Previous</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          disabled={selectedGroupIndex >= selectedGroupItems.length - 1}
                          onPress={() => handleModalNav(1)}
                          style={[
                            styles.navButton,
                            selectedGroupIndex >= selectedGroupItems.length - 1 && styles.navButtonDisabled
                          ]}
                        >
                          <Text style={styles.navButtonText}>Next</Text>
                          <MaterialIcons name="chevron-right" size={24} color="#1976D2" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </ScrollView>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  };

  // Mock data
  const mockActiveOrders = [
    {
      id: 1,
      orderNumber: 'ORD-2024-001',
      date: '2024-01-15',
      status: 'Processing',
      total: '$599.99',
      items: 3,
    },
    {
      id: 2,
      orderNumber: 'ORD-2024-002',
      date: '2024-01-14',
      status: 'Shipped',
      total: '$299.99',
      items: 2,
    },
  ];

  const mockActiveReturns = [
    {
      id: 1,
      returnNumber: 'RET-2024-001',
      date: '2024-01-10',
      status: 'Pending',
      reason: 'Wrong size',
    },
  ];

  const mockOrderHistory = [
    {
      id: 1,
      orderNumber: 'ORD-2023-001',
      date: '2023-12-20',
      status: 'Delivered',
      total: '$199.99',
      items: 1,
    },
    {
      id: 2,
      orderNumber: 'ORD-2023-002',
      date: '2023-12-15',
      status: 'Delivered',
      total: '$399.99',
      items: 2,
    },
  ];

  // Custom header with back button and search
  const CustomHeader = useCallback(({ title, showLoading = false, isSearchMode = false, onToggleSearch = () => {}, onSearchChange = () => {} }) => {
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    
    // Handle local search change
    const handleLocalSearchChange = (text) => {
      setLocalSearchTerm(text);
      onSearchChange(text);
    };

    // Handle toggle search mode
    const handleToggleSearch = () => {
      if (isSearchMode) {
        setLocalSearchTerm('');
        onSearchChange('');
      }
      onToggleSearch();
    };

    return (
      <View style={styles.customTopBar}>
        {!isSearchMode ? (
          <>
            <IconButton
              icon="arrow-left"
              iconColor="black"
              size={28}
              onPress={() => setCurrentView('home')}
            />
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{title}</Text>
              {showLoading && (
                <ActivityIndicator size="small" color="#1976D2" style={styles.headerLoader} />
              )}
            </View>
            <TouchableOpacity onPress={handleToggleSearch} style={styles.searchIconContainer}>
              <MaterialIcons name="search" size={24} color="#666" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.searchContainer}>
              <Searchbar
                placeholder={currentView === 'activeOrders' 
                  ? "Search: By any field"
                  : "Search: By any field"
                }
                value={localSearchTerm}
                onChangeText={handleLocalSearchChange}
                style={styles.headerSearchInput}
                autoFocus={true}
                icon="magnify"
                onIconPress={() => {}}
              />
            </View>
            <TouchableOpacity onPress={handleToggleSearch} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }, [currentView]);

  // Main menu list
  const renderHome = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders & Returns</Text>
      </View>
      <Card style={styles.card}>
        <Card.Content>
          <List.Item
            title="Active Orders"
            left={props => <List.Icon {...props} icon="package-variant" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setCurrentView('activeOrders')}
          />
          <Divider />
          <List.Item
            title="Active Returns"
            left={props => <List.Icon {...props} icon="backup-restore" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setCurrentView('activeReturns')}
          />
          <Divider />
          <List.Item
            title="Order History"
            left={props => <List.Icon {...props} icon="history" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setCurrentView('orderHistory')}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );

  // Orders/Returns/History views
  const renderOrdersList = (type) => {
    let orders = [];
    let title = '';
    if (type === 'activeOrders') {
      orders = mockActiveOrders;
      title = 'Active Orders';
    } else if (type === 'activeReturns') {
      orders = mockActiveReturns;
      title = 'Active Returns';
    } else if (type === 'orderHistory') {
      orders = mockOrderHistory;
      title = 'Order History';
    }
    return (
      <>
        <CustomHeader title={title} />
        <ScrollView style={styles.container}>
          <View style={styles.ordersContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {/* Example: show search state for order history */}
            {type === 'orderHistory' && (
              <View style={styles.searchState}>
                <Text style={styles.searchLabel}>Start: {orderHistorySearch.startDate}</Text>
                <Text style={styles.searchLabel}>End: {orderHistorySearch.endDate}</Text>
              </View>
            )}
            {orders.map((order) => (
              <Card key={order.id} style={styles.orderCard}>
                <Card.Content>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderNumber}>
                      {type === 'activeReturns' ? order.returnNumber : order.orderNumber}
                    </Text>
                    <Chip
                      mode="outlined"
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(order.status) }
                      ]}
                    >
                      {order.status}
                    </Chip>
                  </View>
                  <Text style={styles.orderDate}>Date: {order.date}</Text>
                  {type !== 'activeReturns' && (
                    <>
                      <Text style={styles.orderTotal}>Total: {order.total}</Text>
                      <Text style={styles.orderItems}>Items: {order.items}</Text>
                    </>
                  )}
                  {type === 'activeReturns' && (
                    <Text style={styles.returnReason}>Reason: {order.reason}</Text>
                  )}
                  <View style={styles.orderActions}>
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => navigation.navigate('OrderDetails', { order })}
                      style={styles.actionButton}
                    >
                      View Details
                    </Button>
                    {type === 'activeOrders' && (
                      <Button
                        mode="outlined"
                        compact
                        onPress={() => console.log('Track order')}
                        style={styles.actionButton}
                      >
                        Track
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        </ScrollView>
      </>
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return '#FFF3E0';
      case 'shipped':
        return '#E3F2FD';
      case 'delivered':
        return '#E8F5E8';
      case 'pending':
        return '#FFF8E1';
      default:
        return '#F5F5F5';
    }
  };

  // Handler for shop selection
  const handleShopSelect = async (shop) => {
    await updateSelectedShop(shop);
    setShopModalVisible(false);
    navigation.navigate('Home');
  };

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
      {currentView === 'home' && renderHome()}
      {currentView === 'activeOrders' && renderActiveOrders()}
      {currentView === 'activeReturns' && renderActiveReturns()}
      {currentView === 'orderHistory' && renderOrdersList('orderHistory')}
      <ShopSelectorModal
        visible={shopModalVisible}
        onDismiss={() => setShopModalVisible(false)}
        onSelect={handleShopSelect}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  ordersContainer: {
    padding: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  orderCard: {
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusChip: {
    height: 24,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  returnReason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  actionButton: {
    marginRight: 8,
  },
  customTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  headerLoader: {
    marginLeft: 8,
  },
  searchState: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 8,
  },
  searchLabel: {
    fontSize: 13,
    color: '#1976D2',
  },
  groupContainer: {
    marginBottom: 18,
    
    elevation: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  groupHeaderText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#1976D2',
    flex: 1,
    marginRight: 8,
  },
  itemRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  partDescription: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  itemRowText: {
    fontSize: 13,
    color: '#444',
    marginBottom: 2,
  },
  groupHeaderCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#cfe2ff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginBottom: 2,
    
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  groupHeaderRef: {
    color: '#525046',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 24,
    flexShrink: 1,
  },
  groupHeaderPO: {
    color: '#525046',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 24,
    marginLeft: 12,
    flexShrink: 0,
  },
  itemRowPriceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
    gap: 8,
  },
  itemRow: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 4,
  },
  itemRowPressed: {
    backgroundColor: '#f0f8ff',
  },
  itemRowCancelled: {
    borderBottomColor: '#ffcdd2', // Red border for cancelled items
    borderBottomWidth: 3,
    opacity: 0.9, // Gray out the text
  },
  itemRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  itemPartNumber: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  itemPartNumberPressed: {
    fontWeight: 'bold',
  },
  itemPartNumberCancelled: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTotalPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  itemTotalPricePressed: {
    fontWeight: 'bold',
  },
  itemTotalPriceCancelled: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '95%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  modalCounter: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: 'normal',
  },
  modalContent: {
    padding: 16,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  modalActions: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  deleteButton: {
    borderColor: '#d32f2f',
  },
  modalNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 1,
    backgroundColor: '#1976D2',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  searchHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  searchIconContainer: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerSearchInput: {
    backgroundColor: 'white',
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    borderWidth: 0,
    borderRadius: 0,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OrdersScreen; 