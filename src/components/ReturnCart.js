import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ReturnCart = ({
  returnCartItems = [],
  onRemoveFromCart,
  onCreateReturn,
  onClose,
  visible = false,
  formatPrice = (price) => price
}) => {
  if (!visible) return null;

  const totalItems = returnCartItems.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="shopping-cart" size={24} color="#4CAF50" />
          <Text style={styles.headerTitle}>Return Cart ({totalItems})</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.cartContent}>
        {returnCartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <MaterialIcons name="shopping-cart-outline" size={48} color="#ccc" />
            <Text style={styles.emptyCartText}>No items in return cart</Text>
            <Text style={styles.emptyCartSubtext}>Select orders from history to create returns</Text>
          </View>
        ) : (
          <>
            {returnCartItems.map((item, index) => (
              <Card key={index} style={styles.cartItem}>
                <Card.Content>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemOrderNumber}>
                        Order: {item.orderNumber}
                      </Text>
                      <Text style={styles.itemDate}>Date: {item.orderDate}</Text>
                      <Text style={styles.itemTotal}>Total: {formatPrice(item.totalAmount)}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => onRemoveFromCart(item)}
                      style={styles.removeButton}
                    >
                      <MaterialIcons name="remove-circle" size={24} color="#f44336" />
                    </TouchableOpacity>
                  </View>
                  <Chip
                    mode="outlined"
                    style={styles.statusChip}
                  >
                    {item.status}
                  </Chip>
                </Card.Content>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
      
      {returnCartItems.length > 0 && (
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={onCreateReturn}
            style={styles.createReturnButton}
            icon="plus"
          >
            Create Return ({totalItems} orders)
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = {
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  cartContent: {
    padding: 16,
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  cartItem: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemOrderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 4,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  createReturnButton: {
    backgroundColor: '#4CAF50',
  },
};

export default ReturnCart; 