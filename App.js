import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CustomerProvider, CustomerContext } from './src/store/CustomerContext';
import { OrderProvider } from './src/store/OrderContext';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import { Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { customer, loading } = useContext(CustomerContext);

  if (loading) {
    // Show a loading spinner while checking auth state
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} size="large" />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {customer ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Orders" component={OrdersScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <CustomerProvider>
        <OrderProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </OrderProvider>
      </CustomerProvider>
    </PaperProvider>
  );
}