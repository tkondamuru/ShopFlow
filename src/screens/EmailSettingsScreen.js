import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Surface,
  HelperText,
  IconButton,
} from 'react-native-paper';
import { CustomerContext } from '../store/CustomerContext';
import ProfileRepository from '../services/ProfileRepository';

const EmailSettingsScreen = ({ navigation }) => {
  const { customer } = useContext(CustomerContext);
  const [email, setEmail] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const profileRepository = new ProfileRepository();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    if (!customer?.id) return;
    
    try {
      setProfileLoading(true);
      const profile = await profileRepository.getUserSecurityProfile(customer.id);
      setCurrentEmail(profile.email || '');
      setEmail(profile.email || '');
    } catch (error) {
      console.error('Error loading user profile:', error);
      setCurrentEmail('user@example.com');
      setEmail('user@example.com');
    } finally {
      setProfileLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (email.toLowerCase() === currentEmail?.toLowerCase()) {
      setError('New email must be different from current email');
      return;
    }

    try {
      setLoading(true);
      await profileRepository.updateUserEmail(customer.id, email);
      Alert.alert('Success', 'Email updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating email:', error);
      Alert.alert('Error', error.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.title}>Email Settings</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Surface style={styles.surface}>
          <View style={styles.currentEmailContainer}>
            <Text style={styles.label}>
              Current Email:
            </Text>
            <Text style={styles.currentEmail}>
              {profileLoading ? 'Loading...' : (currentEmail || 'Not set')}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="New Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={!!error}
              style={styles.input}
              disabled={profileLoading}
            />
            {error && (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            )}
          </View>

          <Text style={styles.note}>
            You will receive a confirmation email at the new address to verify the change.
          </Text>
        </Surface>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={loading}
            disabled={loading || profileLoading}
          >
            Update Email
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  surface: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  currentEmailContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 14,
  },
  currentEmail: {
    color: '#666',
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  note: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  button: {
    paddingVertical: 8,
  },
});

export default EmailSettingsScreen; 