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
import { View, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ChangePasswordModal = ({ visible, onDismiss, onPasswordChange, loading }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSymbols,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSymbols,
    };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = 'Password must meet all requirements';
      }
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onPasswordChange(currentPassword, newPassword);
    }
  };

  const handleDismiss = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    onDismiss();
  };

  const passwordValidation = validatePassword(newPassword);

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
              Change Password
            </Text>
            <Button
              icon="close"
              onPress={handleDismiss}
              mode="text"
              compact
            />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              <TextInput
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                right={
                  <TextInput.Icon
                    icon={showCurrentPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  />
                }
                error={!!errors.currentPassword}
                style={styles.input}
              />
              {errors.currentPassword && (
                <HelperText type="error" visible={!!errors.currentPassword}>
                  {errors.currentPassword}
                </HelperText>
              )}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                right={
                  <TextInput.Icon
                    icon={showNewPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  />
                }
                error={!!errors.newPassword}
                style={styles.input}
              />
              {errors.newPassword && (
                <HelperText type="error" visible={!!errors.newPassword}>
                  {errors.newPassword}
                </HelperText>
              )}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                error={!!errors.confirmPassword}
                style={styles.input}
              />
              {errors.confirmPassword && (
                <HelperText type="error" visible={!!errors.confirmPassword}>
                  {errors.confirmPassword}
                </HelperText>
              )}
            </View>

            {newPassword.length > 0 && (
              <View style={styles.passwordRequirements}>
                <Text variant="bodySmall" style={styles.requirementsTitle}>
                  Password Requirements:
                </Text>
                <View style={styles.requirementItem}>
                  <MaterialIcons
                    name={passwordValidation.minLength ? 'check-circle' : 'radio-button-unchecked'}
                    size={16}
                    color={passwordValidation.minLength ? '#4CAF50' : '#757575'}
                  />
                  <Text variant="bodySmall" style={styles.requirementText}>
                    At least 8 characters
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <MaterialIcons
                    name={passwordValidation.hasUpperCase ? 'check-circle' : 'radio-button-unchecked'}
                    size={16}
                    color={passwordValidation.hasUpperCase ? '#4CAF50' : '#757575'}
                  />
                  <Text variant="bodySmall" style={styles.requirementText}>
                    One uppercase letter
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <MaterialIcons
                    name={passwordValidation.hasLowerCase ? 'check-circle' : 'radio-button-unchecked'}
                    size={16}
                    color={passwordValidation.hasLowerCase ? '#4CAF50' : '#757575'}
                  />
                  <Text variant="bodySmall" style={styles.requirementText}>
                    One lowercase letter
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <MaterialIcons
                    name={passwordValidation.hasNumbers ? 'check-circle' : 'radio-button-unchecked'}
                    size={16}
                    color={passwordValidation.hasNumbers ? '#4CAF50' : '#757575'}
                  />
                  <Text variant="bodySmall" style={styles.requirementText}>
                    One number
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <MaterialIcons
                    name={passwordValidation.hasSymbols ? 'check-circle' : 'radio-button-unchecked'}
                    size={16}
                    color={passwordValidation.hasSymbols ? '#4CAF50' : '#757575'}
                  />
                  <Text variant="bodySmall" style={styles.requirementText}>
                    One special character
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

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
              Change Password
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
    maxHeight: '80%',
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
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  passwordRequirements: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  requirementsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    marginLeft: 8,
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

export default ChangePasswordModal; 