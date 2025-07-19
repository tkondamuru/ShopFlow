import React, { useState } from 'react';
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  Surface,
  HelperText,
} from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

const EmailSettingsModal = ({ visible, onDismiss, onEmailChange, currentEmail, loading }) => {
  const [email, setEmail] = useState(currentEmail || '');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = () => {
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

    onEmailChange(email);
  };

  const handleDismiss = () => {
    setEmail(currentEmail || '');
    setError('');
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.surface}>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              Update Email Address
            </Text>
            <Button
              icon="close"
              onPress={handleDismiss}
              mode="text"
              compact
            />
          </View>

          <View style={styles.content}>
            <View style={styles.currentEmailContainer}>
              <Text variant="bodyMedium" style={styles.label}>
                Current Email:
              </Text>
              <Text variant="bodyLarge" style={styles.currentEmail}>
                {currentEmail || 'Not set'}
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
              />
              {error && (
                <HelperText type="error" visible={!!error}>
                  {error}
                </HelperText>
              )}
            </View>

            <Text variant="bodySmall" style={styles.note}>
              You will receive a confirmation email at the new address to verify the change.
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={handleDismiss}
              style={styles.button}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Update Email
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  surface: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
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
  },
  currentEmail: {
    color: '#666',
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
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default EmailSettingsModal; 