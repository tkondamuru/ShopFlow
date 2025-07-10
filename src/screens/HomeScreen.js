import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { CustomerContext } from '../store/CustomerContext';

const HomeScreen = () => {
  const { customer } = useContext(CustomerContext);

  return (
    <View>
      <Text>Welcome, {customer?.name}</Text>
    </View>
  );
};

export default HomeScreen;