import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ImageBackground
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Snackbar 
} from 'react-native-paper';
import { CustomerContext } from '../store/CustomerContext';
import Layout from '../components/Layout';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(CustomerContext);
  const [customerId, setCustomerId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [customerIdError, setCustomerIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const validateFields = () => {
    let isValid = true;
    
    if (!customerId.trim()) {
      setCustomerIdError('Customer ID is required');
      isValid = false;
    } else {
      setCustomerIdError('');
    }
    
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateFields()) {
      return;
    }
    setLoading(true);
    try {
      await login(customerId, password);
      navigation.navigate('Home');
    } catch (error) {
      setSnackbarMessage('Login failed. Please check your credentials.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'This feature will be implemented soon.');
  };

  const isFormValid = customerId.trim() && password.trim();

  return (
    <Layout navigation={navigation} showMenu={false} showShopIcons={false} showBottomNav={false}>
      <ImageBackground
        source={{ uri: 'https://azudevelopstorage.blob.core.windows.net/buysite-notifications/SignInHome.png' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.loginCard}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.title}>Welcome Back</Text>
              <TextInput
                label="Customer ID"
                value={customerId}
                onChangeText={setCustomerId}
                placeholder="Please enter your Customer ID"
                mode="outlined"
                style={styles.input}
                error={!!customerIdError}
                keyboardType="default"
                autoCapitalize="none"
              />
              {customerIdError ? (
                <Text style={styles.errorText}>{customerIdError}</Text>
              ) : null}
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Please enter your Password"
                mode="outlined"
                style={styles.input}
                error={!!passwordError}
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>FORGOT PASSWORD?</Text>
              </TouchableOpacity>
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                disabled={!isFormValid || loading}
                loading={loading}
                buttonColor="#4AC9E3"
              >
                LOGIN
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
        <View style={styles.footer}>
          <Text style={styles.footerText}>PGW Auto Glass, LLC</Text>
          <Text style={styles.footerText}>PGW Auto Glass, LLC Copyrights Reserved (©) 2025.</Text>
        </View>
      </ImageBackground>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </Layout>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    opacity: 0.9,
  },
  cardContent: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4AC9E3',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  footer: {
    backgroundColor: 'black',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#cccccc',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  snackbar: {
    backgroundColor: '#d32f2f',
  },
});

export default LoginScreen;