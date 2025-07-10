import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { CustomerContext } from '../store/CustomerContext';

const LoginScreen = ({ navigation }) => {
  const { setCustomer } = useContext(CustomerContext);

  const login = () => {
    setCustomer({ id: 1, name: 'Test Customer' });
    navigation.navigate('Home');
  };

  return (
    <View>
      <Text>Login Screen</Text>
      <Button title="Login" onPress={login} />
    </View>
  );
};

export default LoginScreen;