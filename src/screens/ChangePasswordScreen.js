import React, { useState, useContext } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';
import { CustomerContext } from '../store/CustomerContext';
import ProfileRepository from '../services/ProfileRepository';

const ChangePasswordScreen = ({ navigation }) => {
  const { customer } = useContext(CustomerContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const profileRepository = new ProfileRepository();

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

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        await profileRepository.updateUserPassword(customer.id, newPassword);
        Alert.alert('Success', 'Password updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } catch (error) {
        console.error('Error updating password:', error);
        Alert.alert('Error', error.message || 'Failed to update password');
      } finally {
        setLoading(false);
      }
    }
  };

  const passwordValidation = validatePassword(newPassword);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.title}>Change Password</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Surface style={styles.surface}>
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
              <Text style={styles.requirementsTitle}>
                Password Requirements:
              </Text>
              <View style={styles.requirementItem}>
                <MaterialIcons
                  name={passwordValidation.minLength ? 'check-circle' : 'radio-button-unchecked'}
                  size={16}
                  color={passwordValidation.minLength ? '#4CAF50' : '#757575'}
                />
                <Text style={styles.requirementText}>
                  At least 8 characters
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <MaterialIcons
                  name={passwordValidation.hasUpperCase ? 'check-circle' : 'radio-button-unchecked'}
                  size={16}
                  color={passwordValidation.hasUpperCase ? '#4CAF50' : '#757575'}
                />
                <Text style={styles.requirementText}>
                  One uppercase letter
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <MaterialIcons
                  name={passwordValidation.hasLowerCase ? 'check-circle' : 'radio-button-unchecked'}
                  size={16}
                  color={passwordValidation.hasLowerCase ? '#4CAF50' : '#757575'}
                />
                <Text style={styles.requirementText}>
                  One lowercase letter
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <MaterialIcons
                  name={passwordValidation.hasNumbers ? 'check-circle' : 'radio-button-unchecked'}
                  size={16}
                  color={passwordValidation.hasNumbers ? '#4CAF50' : '#757575'}
                />
                <Text style={styles.requirementText}>
                  One number
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <MaterialIcons
                  name={passwordValidation.hasSymbols ? 'check-circle' : 'radio-button-unchecked'}
                  size={16}
                  color={passwordValidation.hasSymbols ? '#4CAF50' : '#757575'}
                />
                <Text style={styles.requirementText}>
                  One special character
                </Text>
              </View>
            </View>
          )}
        </Surface>

        <View style={styles.buttonContainer}>
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
    fontSize: 14,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    marginLeft: 8,
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

export default ChangePasswordScreen; 