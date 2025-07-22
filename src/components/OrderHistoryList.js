import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const OrderHistoryList = ({
  orders,
  loading,
  refreshing,
  onRefresh,
  onOrderPress,
  onAddToReturnCart,
  returnCartItems = [],
  searchTerm = '',
  searchMode = 'data',
  formatPrice = (price) => price,
  getStatusColor = () => '#F5F5F5'
}) => {
  // Search functionality for Order History
  const searchOrders = (orders, term) => {
    if (!term.trim()) {
      return orders;
    }
    
    return orders.filter(order => {
      const searchLower = term.toLowerCase();
      return (
        String(order.orderNumber || '').toLowerCase().includes(searchLower) ||
        String(order.orderDate || '').toLowerCase().includes(searchLower) ||
        String(order.status || '').toLowerCase().includes(searchLower) ||
        String(order.totalAmount || '').toLowerCase().includes(searchLower) ||
        String(order.itemCount || '').toLowerCase().includes(searchLower)
      );
    });
  };

  const filteredOrders = searchMode === 'data' ? searchOrders(orders, searchTerm) : orders;

  const isInReturnCart = (orderId) => {
    return returnCartItems.some(item => item.orderId === orderId);
  };

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={styles.ordersContainer}>
        {!loading && filteredOrders.length === 0 && (
          <Text style={{ textAlign: 'center', marginVertical: 16 }}>
            {searchTerm ? 'No matching orders found.' : 'No order history found.'}
          </Text>
        )}
        {filteredOrders.map((order) => {
          const inReturnCart = isInReturnCart(order.id);
          return (
            <Card key={order.id} style={[styles.orderCard, inReturnCart && styles.orderCardInCart]}>
              <Card.Content>
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <Text style={styles.orderNumber}>
                      Order: {order.orderNumber}
                    </Text>
                    {inReturnCart && (
                      <MaterialIcons name="shopping-cart" size={16} color="#4CAF50" />
                    )}
                  </View>
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
                <Text style={styles.orderDate}>Date: {order.orderDate}</Text>
                <Text style={styles.orderTotal}>Total: {formatPrice(order.totalAmount)}</Text>
                <Text style={styles.orderItems}>Items: {order.itemCount}</Text>
                <View style={styles.orderActions}>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => onOrderPress(order)}
                    style={styles.actionButton}
                  >
                    View Details
                  </Button>
                  <Button
                    mode={inReturnCart ? "contained" : "outlined"}
                    compact
                    onPress={() => onAddToReturnCart(order)}
                    style={[styles.actionButton, inReturnCart && styles.returnCartButton]}
                    icon={inReturnCart ? "check" : "plus"}
                  >
                    {inReturnCart ? 'In Cart' : 'Add to Return'}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  ordersContainer: {
    padding: 6,
  },
  orderCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  orderCardInCart: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
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
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  actionButton: {
    marginRight: 8,
  },
  returnCartButton: {
    backgroundColor: '#4CAF50',
  },
};

export default OrderHistoryList; 