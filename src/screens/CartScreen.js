import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, IconButton, Divider } from 'react-native-paper';
import { CustomerContext } from '../store/CustomerContext';
import Layout from '../components/Layout';
import ShopSelectorModal from '../components/ShopSelectorModal';

const CartScreen = ({ navigation }) => {
  const { customer, items, setItems, updateSelectedShop, selectShopAndNavigateHome } = useContext(CustomerContext);
  const [loading, setLoading] = useState(false);
  const [shopModalVisible, setShopModalVisible] = useState(false);

  // Mock cart items
  const cartItems = [
    {
      id: 1,
      name: 'Windshield Glass',
      partNumber: 'WS001',
      price: 299.99,
      quantity: 1,
      shop: 'Shop A',
    },
    {
      id: 2,
      name: 'Side Mirror',
      partNumber: 'SM002',
      price: 89.99,
      quantity: 2,
      shop: 'Shop B',
    },
    {
      id: 3,
      name: 'Headlight Assembly',
      partNumber: 'HL003',
      price: 199.99,
      quantity: 1,
      shop: 'Shop A',
    },
  ];

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      // Remove item
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setItems(updatedItems);
    } else {
      // Update quantity
      const updatedItems = cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setItems(updatedItems);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Mock checkout process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Processing checkout...');
      // Navigate to order confirmation
      navigation.navigate('OrderConfirmation', { orderTotal: total });
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for shop selection
  const handleShopSelect = async (shop) => {
    await selectShopAndNavigateHome(shop, navigation);
    setShopModalVisible(false);
  };

  const renderCartItem = (item) => (
    <Card key={item.id} style={styles.cartItem}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPartNumber}>Part #: {item.partNumber}</Text>
            <Text style={styles.itemShop}>Shop: {item.shop}</Text>
          </View>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => updateQuantity(item.id, 0)}
            style={styles.deleteButton}
          />
        </View>
        
        <View style={styles.itemFooter}>
          <View style={styles.quantityContainer}>
            <IconButton
              icon="minus"
              size={20}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            />
            <Text style={styles.quantity}>{item.quantity}</Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            />
          </View>
          <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <Layout 
      navigation={navigation}
      currentRoute="Cart"
      onOpenShopModal={() => setShopModalVisible(true)}
      onBottomNavPress={(route) => {
        if (route !== 'Cart') {
          navigation.navigate(route);
        }
      }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Shopping Cart</Text>
          <Text style={styles.itemCount}>{itemCount} items</Text>
        </View>
        
        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Search')}
              style={styles.browseButton}
            >
              Browse Parts
            </Button>
          </View>
        ) : (
          <>
            <View style={styles.cartItems}>
              {cartItems.map(renderCartItem)}
            </View>
            
            <Card style={styles.summaryCard}>
              <Card.Content>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal:</Text>
                  <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax:</Text>
                  <Text style={styles.summaryValue}>${(total * 0.08).toFixed(2)}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>${(total * 1.08).toFixed(2)}</Text>
                </View>
              </Card.Content>
            </Card>
            
            <View style={styles.checkoutContainer}>
              <Button 
                mode="contained" 
                onPress={handleCheckout}
                loading={loading}
                disabled={loading}
                style={styles.checkoutButton}
                buttonColor="#4AC9E3"
              >
                {loading ? 'Processing...' : 'Checkout'}
              </Button>
            </View>
          </>
        )}
      </ScrollView>
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
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  browseButton: {
    marginTop: 16,
  },
  cartItems: {
    padding: 16,
  },
  cartItem: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemPartNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemShop: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    margin: 0,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
    minWidth: 30,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4AC9E3',
  },
  summaryCard: {
    margin: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  divider: {
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4AC9E3',
  },
  checkoutContainer: {
    padding: 16,
  },
  checkoutButton: {
    paddingVertical: 8,
  },
});

export default CartScreen; 