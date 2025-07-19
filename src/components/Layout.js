import React, { useState, useContext } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { IconButton, Menu, Text, Divider, Badge } from 'react-native-paper';
import { CustomerContext } from '../store/CustomerContext';
import BottomNavigation from './BottomNavigation';

const Layout = ({ 
  children, 
  showTopBar = true,
  showMenu = true,
  showShopIcons = true,
  showBackButton = false,
  showBottomNav = true,
  currentRoute = 'Home',
  onMenuPress,
  customTopBar,
  navigation,
  onOpenShopModal,
  onBottomNavPress
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { customer, items } = useContext(CustomerContext);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const { logout } = useContext(CustomerContext);
  const handleLogout = async() => {
    closeMenu();
    await logout();
  };

  const customerId = customer?.id ? String(customer.id).toUpperCase() : '';
  const cartCount = items?.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* StatusBar for Android */}
      {Platform.OS === 'android' && (
        <StatusBar barStyle="light-content" />
      )}
      {/* Top Bar */}
      {showTopBar && (
        <View style={styles.topBar}>
          {customTopBar ? (
            customTopBar
          ) : (
            <>
              <Image 
                source={{ uri: 'https://next.buypgwautoglass.com/assets/images/Logo.png' }}
                style={styles.logo}
                resizeMode="contain"
              />
              {showShopIcons && (
                <>
                  {/* Shops Icon */}
                  <IconButton
                    icon="storefront"
                    iconColor="#4AC9E3"
                    size={28}
                    style={styles.shopsIcon}
                    onPress={onOpenShopModal}
                  />
                </>
              )}
              {showBackButton && navigation && (
                <IconButton
                  icon="arrow-left"
                  iconColor="#4AC9E3"
                  size={28}
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                />
              )}
              {showMenu && (
                <Menu
                  visible={menuVisible}
                  onDismiss={closeMenu}
                  anchor={
                    <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
                      <IconButton
                        icon="dots-vertical"
                        iconColor="white"
                        size={32}
                      />
                    </TouchableOpacity>
                  }
                  contentStyle={styles.menuContent}
                >
                  {customerId ? (
                    <Text style={styles.menuUserId}>{customerId}</Text>
                  ) : null}
                  <Divider />
                  <Menu.Item onPress={closeMenu} title="Profile" leadingIcon="account" />
                  <Menu.Item onPress={handleLogout} title="Logout" leadingIcon="logout" />
                </Menu>
              )}
            </>
          )}
        </View>
      )}

      {/* Main Content */}
      {children}
      
      {/* Bottom Navigation */}
      {showBottomNav && (
        <BottomNavigation
          currentRoute={currentRoute}
          onNavigate={onBottomNavPress}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 16,
    marginTop: 0,
  },
  logo: {
    width: 175,
    height: 40,
  },
  shopsIcon: {
    marginRight: 2,
  },
  backButton: {
    marginRight: 2,
  },
  menuButton: {
    marginRight: -10,
  },
  menuContent: {
    backgroundColor: '#f7f4fb',
    borderRadius: 10,
    minWidth: 180,
    elevation: 4,
    marginTop: 60,
  },
  menuUserId: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    letterSpacing: 1,
  },
});

export default Layout; 