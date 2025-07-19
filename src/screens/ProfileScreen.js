import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, List, Divider, IconButton, TextInput, Surface, HelperText, Snackbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { CustomerContext } from '../store/CustomerContext';
import Layout from '../components/Layout';
import ShopSelectorModal from '../components/ShopSelectorModal';
import FormattedTextModal from '../components/FormattedTextModal';
import ProfileRepository from '../services/ProfileRepository';

const ProfileScreen = ({ navigation }) => {
  const { customer, logout, updateSelectedShop, selectedShop } = useContext(CustomerContext);
  const [shopModalVisible, setShopModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  
  // Current view state
  const [currentView, setCurrentView] = useState('profile'); // 'profile', 'password', 'email', 'questions'
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Data states
  const [userProfile, setUserProfile] = useState(null);
  
  // Form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [viewMode, setViewMode] = useState('view'); // for questions
  
  // Password visibility states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const profileRepository = new ProfileRepository();

  // Sample content - replace with your actual PDF content
  const privacyContent = `**1. Information We Collect**
We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.

**2. How We Use Your Information**
We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.

**3. Information Sharing**
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

**4. Data Security**
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

**5. Your Rights**
You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.

**6. Changes to This Policy**
We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.`;

  const termsContent = `**1. Acceptance of Terms**
By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.

**2. Use License**
Permission is granted to temporarily download one copy of the materials (information or software) on PGW Buysite's website for personal, non-commercial transitory viewing only.

**3. Disclaimer**
The materials on PGW Buysite's website are provided on an 'as is' basis. PGW Buysite makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

**4. Limitations**
In no event shall PGW Buysite or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PGW Buysite's website, even if PGW Buysite or a PGW Buysite authorized representative has been notified orally or in writing of the possibility of such damage.

**5. Accuracy of Materials**
The materials appearing on PGW Buysite's website could include technical, typographical, or photographic errors. PGW Buysite does not warrant that any of the materials on its website are accurate, complete or current.`;

  // Handler for shop selection
  const handleShopSelect = async (shop) => {
    await updateSelectedShop(shop);
    setShopModalVisible(false);
    navigation.navigate('Home');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  // Load user profile and all security questions on component mount
  useEffect(() => {
    loadUserProfile();
    loadAllSecurityQuestions();
  }, []);

  const loadUserProfile = async () => {
    if (!customer?.id) return;
    
    try {
      setLoading(true);
      const profile = await profileRepository.getUserSecurityProfile(customer.id);
      setUserProfile(profile);
      setEmail(profile.email || '');
      setQuestions(profile.questions?.map(q => ({ ...q })) || []);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Set default values if API fails
      setEmail('user@example.com');
      setQuestions([
        { id: 1, question: "In what city were you born?", answer: "TEST" },
        { id: 2, question: "What high school did you attend?", answer: "TEST" },
        { id: 3, question: "What is the name of your first school?", answer: "TEST" },
        { id: 4, question: "Which phone number do you remember?", answer: "TEST" },
        { id: 5, question: "What is your favorite movie?", answer: "TEST" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllSecurityQuestions = async () => {
    try {
      const allQuestionsData = await profileRepository.getAllSecurityQuestions();
      setAllQuestions(allQuestionsData);
    } catch (error) {
      console.error('Error loading all security questions:', error);
    }
  };

  const handleBack = () => {
    setCurrentView('profile');
    setErrors({});
    setViewMode('view');
  };

  const handlePasswordReset = () => {
    setCurrentView('password');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  const handleSecurityQuestions = () => {
    setCurrentView('questions');
    setViewMode('view');
  };

  const handleEmailSettings = () => {
    setCurrentView('email');
    setEmail(userProfile?.email || '');
    setErrors({});
  };

  const handlePrivacyPolicy = () => {
    setPrivacyModalVisible(true);
  };

  const handleTermsOfService = () => {
    setTermsModalVisible(true);
  };

  // Password validation and submission
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

  const validatePasswordForm = () => {
    const newErrors = {};

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

  const handlePasswordSubmit = async () => {
    if (validatePasswordForm()) {
      try {
        setActionLoading(true);
        await profileRepository.updateUserPassword(customer.id, newPassword);
        Alert.alert('Success', 'Password updated successfully', [
          { text: 'OK', onPress: handleBack }
        ]);
      } catch (error) {
        console.error('Error updating password:', error);
        Alert.alert('Error', error.message || 'Failed to update password');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Email validation and submission
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async () => {
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    if (email.toLowerCase() === userProfile?.email?.toLowerCase()) {
      setErrors({ email: 'New email must be different from current email' });
      return;
    }

    try {
      setActionLoading(true);
      await profileRepository.updateUserEmail(customer.id, email);
      Alert.alert('Success', 'Email updated successfully', [
        { text: 'OK', onPress: handleBack }
      ]);
    } catch (error) {
      console.error('Error updating email:', error);
      Alert.alert('Error', error.message || 'Failed to update email');
    } finally {
      setActionLoading(false);
    }
  };

  // Security questions validation and submission
  const handleQuestionChange = (questionId, answer) => {
    const updatedQuestions = [...questions];
    const existingIndex = updatedQuestions.findIndex(q => q.id === questionId);
    
    if (existingIndex >= 0) {
      // Update existing question
      updatedQuestions[existingIndex] = { ...updatedQuestions[existingIndex], answer };
    } else {
      // Add new question
      const questionData = allQuestions.find(q => q.id === questionId);
      if (questionData) {
        updatedQuestions.push({ ...questionData, answer });
      }
    }
    
    setQuestions(updatedQuestions);
    
    // Clear error for this question
    if (errors[`question_${questionId}`]) {
      const newErrors = { ...errors };
      delete newErrors[`question_${questionId}`];
      setErrors(newErrors);
    }
  };

  const handleRemoveQuestion = (questionId) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);
  };

  const validateQuestionsForm = () => {
    const newErrors = {};
    
    if (questions.length < 4) {
      newErrors.general = 'You must have at least 4 security questions answered';
      setSnackbarMessage('You must have at least 4 security questions answered');
      setSnackbarVisible(true);
    }
    
    questions.forEach((question) => {
      if (!question.answer || question.answer.trim().length < 2) {
        newErrors[`question_${question.id}`] = 'Answer must be at least 2 characters';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleQuestionsSubmit = async () => {
    if (validateQuestionsForm()) {
      try {
        setActionLoading(true);
        
        // Format answers for API
        const answers = questions.map((question, index) => ({
          [index.toString()]: question.answer
        }));

        await profileRepository.updateSecurityQuestions(customer.id, { answers });
        
        Alert.alert('Success', 'Security questions updated successfully', [
          { text: 'OK', onPress: handleBack }
        ]);
      } catch (error) {
        console.error('Error updating security questions:', error);
        Alert.alert('Error', error.message || 'Failed to update security questions');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const maskAnswer = (answer) => {
    if (!answer) return '';
    return '*'.repeat(Math.min(answer.length, 8));
  };

  // Get current header title
  const getHeaderTitle = () => {
    switch (currentView) {
      case 'password':
        return 'Change Password';
      case 'email':
        return 'Email Settings';
      case 'questions':
        return 'Security Questions';
      default:
        return 'Profile';
    }
  };

  const CustomHeader = () => (
    <View style={styles.customTopBar}>
      <IconButton
        icon="arrow-left"
        iconColor="black"
        size={28}
        onPress={handleBack}
      />
      <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
      <View style={{ width: 48 }} />
    </View>
  );

  return (
    <Layout 
      navigation={navigation}
      currentRoute="Profile"
      onOpenShopModal={() => setShopModalVisible(true)}
      onBottomNavPress={(route) => {
        if (route !== 'Profile') {
          navigation.navigate(route);
        }
      }}
    >
      {currentView === 'profile' && (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
          </View>

          {/* User Info Card */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.userName}>{customer?.id?.toUpperCase() || 'User'}</Text>
              <Text style={styles.userEmail}>{userProfile?.email || 'user@example.com'}</Text>
              <Text style={styles.userRole}>Ship To: {selectedShop?.shipto || 'N/A'}</Text>
            </Card.Content>
          </Card>

          {/* Account Settings */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Account Settings</Text>
              <List.Item
                title="Change Password"
                left={(props) => <List.Icon {...props} icon="lock" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={handlePasswordReset}
              />
              <Divider />
              <List.Item
                title="Security Questions"
                left={(props) => <List.Icon {...props} icon="shield" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleSecurityQuestions}
              />
              <Divider />
              <List.Item
                title="Email Settings"
                left={(props) => <List.Icon {...props} icon="email" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleEmailSettings}
              />
            </Card.Content>
          </Card>

          {/* App Settings */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>App Settings</Text>
              <List.Item
                title="About"
                left={(props) => <List.Icon {...props} icon="information" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => Alert.alert('About', 'PGW Buysite v1.0.0')}
              />
              <Divider />
              <List.Item
                title="Privacy Policy"
                left={(props) => <List.Icon {...props} icon="shield-check" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={handlePrivacyPolicy}
              />
              <Divider />
              <List.Item
                title="Terms of Service"
                left={(props) => <List.Icon {...props} icon="file-document" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleTermsOfService}
              />
            </Card.Content>
          </Card>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <Button
              mode="outlined"
              onPress={handleLogout}
              style={styles.logoutButton}
              textColor="#d32f2f"
              buttonColor="transparent"
            >
              Logout
            </Button>
          </View>
        </ScrollView>
      )}

      {/* Change Password View */}
      {currentView === 'password' && (
        <>
          <CustomHeader />
          <ScrollView style={styles.container}>
            <Surface style={styles.surface}>
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
                  {(() => {
                    const validation = validatePassword(newPassword);
                    return (
                      <>
                        <View style={styles.requirementItem}>
                          <MaterialIcons
                            name={validation.minLength ? 'check-circle' : 'radio-button-unchecked'}
                            size={16}
                            color={validation.minLength ? '#4CAF50' : '#757575'}
                          />
                          <Text style={styles.requirementText}>
                            At least 8 characters
                          </Text>
                        </View>
                        <View style={styles.requirementItem}>
                          <MaterialIcons
                            name={validation.hasUpperCase ? 'check-circle' : 'radio-button-unchecked'}
                            size={16}
                            color={validation.hasUpperCase ? '#4CAF50' : '#757575'}
                          />
                          <Text style={styles.requirementText}>
                            One uppercase letter
                          </Text>
                        </View>
                        <View style={styles.requirementItem}>
                          <MaterialIcons
                            name={validation.hasLowerCase ? 'check-circle' : 'radio-button-unchecked'}
                            size={16}
                            color={validation.hasLowerCase ? '#4CAF50' : '#757575'}
                          />
                          <Text style={styles.requirementText}>
                            One lowercase letter
                          </Text>
                        </View>
                        <View style={styles.requirementItem}>
                          <MaterialIcons
                            name={validation.hasNumbers ? 'check-circle' : 'radio-button-unchecked'}
                            size={16}
                            color={validation.hasNumbers ? '#4CAF50' : '#757575'}
                          />
                          <Text style={styles.requirementText}>
                            One number
                          </Text>
                        </View>
                        <View style={styles.requirementItem}>
                          <MaterialIcons
                            name={validation.hasSymbols ? 'check-circle' : 'radio-button-unchecked'}
                            size={16}
                            color={validation.hasSymbols ? '#4CAF50' : '#757575'}
                          />
                          <Text style={styles.requirementText}>
                            One special character
                          </Text>
                        </View>
                      </>
                    );
                  })()}
                </View>
              )}
            </Surface>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handlePasswordSubmit}
                style={styles.button}
                loading={actionLoading}
                disabled={actionLoading}
              >
                Change Password
              </Button>
            </View>
          </ScrollView>
        </>
      )}

      {/* Email Settings View */}
      {currentView === 'email' && (
        <>
          <CustomHeader />
          <ScrollView style={styles.container}>
            <Surface style={styles.surface}>
              <View style={styles.currentEmailContainer}>
                <Text style={styles.label}>
                  Current Email:
                </Text>
                <Text style={styles.currentEmail}>
                  {userProfile?.email || 'Not set'}
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
                  error={!!errors.email}
                  style={styles.input}
                />
                {errors.email && (
                  <HelperText type="error" visible={!!errors.email}>
                    {errors.email}
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
                onPress={handleEmailSubmit}
                style={styles.button}
                loading={actionLoading}
                disabled={actionLoading}
              >
                Update Email
              </Button>
            </View>
          </ScrollView>
        </>
      )}

      {/* Security Questions View */}
      {currentView === 'questions' && (
        <>
          <CustomHeader />
          <ScrollView style={styles.container}>
            {viewMode === 'view' ? (
              // View mode - show current questions with masked answers
              <>
                {questions.map((question, index) => (
                  <Surface key={question.id} style={styles.questionContainer}>
                    <View style={styles.questionHeader}>
                      <MaterialIcons name="security" size={20} color="#666" />
                      <Text style={styles.questionNumber}>
                        Question {index + 1}
                      </Text>
                    </View>
                    
                    <Text style={styles.questionText}>
                      {question.question}
                    </Text>

                    <View style={styles.answerContainer}>
                      <Text style={styles.answerLabel}>
                        Answer:
                      </Text>
                      <Text style={styles.maskedAnswer}>
                        {maskAnswer(question.answer)}
                      </Text>
                    </View>
                  </Surface>
                ))}
              </>
            ) : (
              // Edit mode - show all available questions with ability to add/remove
              <>
                {errors.general && (
                  <Surface style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errors.general}</Text>
                  </Surface>
                )}

                <Text style={styles.sectionTitle}>Current Questions ({questions.length}/4 minimum)</Text>
                
                {questions.map((question, index) => (
                  <Surface key={question.id} style={styles.questionContainer}>
                    <View style={styles.questionHeader}>
                      <MaterialIcons name="security" size={20} color="#666" />
                      <Text style={styles.questionNumber}>
                        Question {index + 1}
                      </Text>
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleRemoveQuestion(question.id)}
                        style={styles.deleteButton}
                      />
                    </View>
                    
                    <Text style={styles.questionText}>
                      {question.question}
                    </Text>

                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Your Answer"
                        value={question.answer || ''}
                        onChangeText={(value) => handleQuestionChange(question.id, value)}
                        error={!!errors[`question_${question.id}`]}
                        style={styles.input}
                        multiline
                        numberOfLines={2}
                      />
                      {errors[`question_${question.id}`] && (
                        <HelperText type="error" visible={!!errors[`question_${question.id}`]}>
                          {errors[`question_${question.id}`]}
                        </HelperText>
                      )}
                    </View>
                  </Surface>
                ))}

                <Text style={styles.sectionTitle}>Available Questions</Text>
                
                {allQuestions
                  .filter(q => !questions.find(existing => existing.id === q.id))
                  .map((question) => (
                    <Surface key={question.id} style={styles.availableQuestionContainer}>
                      <View style={styles.questionHeader}>
                        <MaterialIcons name="add-circle" size={20} color="#4CAF50" onPress={() => handleQuestionChange(question.id, '')}/>
                        <Text style={styles.questionNumber}>
                          {question.question}
                        </Text>
                      </View>
                    </Surface>
                  ))}

                <Surface style={styles.noteContainer}>
                  
                  <Text style={styles.note}>
                    You must have at least 4 security questions answered. These help protect your account and can be used for password recovery.
                  </Text>
                </Surface>
              </>
            )}

            <View style={styles.buttonContainer}>
              {viewMode === 'view' ? (
                <Button
                  mode="contained"
                  onPress={() => setViewMode('edit')}
                  style={styles.button}
                >
                  Edit Questions
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={handleQuestionsSubmit}
                  style={styles.button}
                  loading={actionLoading}
                  disabled={actionLoading}
                >
                  Save Changes
                </Button>
              )}
            </View>
          </ScrollView>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3500}
            style={{
              backgroundColor: '#d32f2f',
              position: 'absolute',
              top: -200,
              alignSelf: 'center',
              zIndex: 1000,
             
              minWidth: 300,
              borderRadius: 8,
            }}
          >
            {snackbarMessage}
          </Snackbar>
        </>
      )}
      
      {/* Modals */}
      <ShopSelectorModal
        visible={shopModalVisible}
        onDismiss={() => setShopModalVisible(false)}
        onSelect={handleShopSelect}
      />
      <FormattedTextModal
        visible={privacyModalVisible}
        onDismiss={() => setPrivacyModalVisible(false)}
        title="Privacy Policy"
        content={privacyContent}
      />
      <FormattedTextModal
        visible={termsModalVisible}
        onDismiss={() => setTermsModalVisible(false)}
        title="Terms and Conditions"
        content={termsContent}
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
    
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userRole: {
    fontSize: 12,
    color: '#4AC9E3',
    marginTop: 4,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  logoutContainer: {
    padding: 16,
  },
  logoutButton: {
    borderColor: '#d32f2f',
  },
  // Custom header styles
  customTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  // Form styles
  surface: {
    margin: 16,
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
  // Email styles
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
  note: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: 12,
  },
  // Security questions styles
  questionContainer: {
    margin: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#666',
    fontSize: 14,
  },
  questionText: {
    marginBottom: 12,
    fontWeight: '500',
    fontSize: 16,
  },
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerLabel: {
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 14,
  },
  maskedAnswer: {
    color: '#666',
    fontFamily: 'monospace',
    fontSize: 16,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#e3f2fd',
  },
  // Additional styles for security questions
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: 'bold',
  },
  availableQuestionContainer: {
    margin: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#f5f5f5',
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  addButton: {
    marginLeft: 'auto',
  },
});

export default ProfileScreen; 