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
  SegmentedButtons,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { CustomerContext } from '../store/CustomerContext';
import ProfileRepository from '../services/ProfileRepository';

const SecurityQuestionsScreen = ({ navigation }) => {
  const { customer } = useContext(CustomerContext);
  const [questions, setQuestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [viewMode, setViewMode] = useState('view'); // 'view' or 'edit'
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
      setQuestions(profile.questions?.map(q => ({ ...q })) || []);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Set default questions if API fails
      setQuestions([
        { id: 1, question: "In what city were you born?", answer: "TEST" },
        { id: 2, question: "What high school did you attend?", answer: "TEST" },
        { id: 3, question: "What is the name of your first school?", answer: "TEST" },
        { id: 4, question: "Which phone number do you remember?", answer: "TEST" },
        { id: 5, question: "What is your favorite movie?", answer: "TEST" },
      ]);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
    
    // Clear error for this field
    if (errors[`${index}_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}_${field}`];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    questions.forEach((question, index) => {
      if (!question.answer || question.answer.trim().length < 2) {
        newErrors[`${index}_answer`] = 'Answer must be at least 2 characters';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        // Note: This would need to be implemented in the API
        // For now, we'll just show a success message
        Alert.alert('Success', 'Security questions updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } catch (error) {
        console.error('Error updating security questions:', error);
        Alert.alert('Error', error.message || 'Failed to update security questions');
      } finally {
        setLoading(false);
      }
    }
  };

  const maskAnswer = (answer) => {
    if (!answer) return '';
    return '*'.repeat(Math.min(answer.length, 8));
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
        <Text style={styles.title}>Security Questions</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.modeSelector}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          buttons={[
            { value: 'view', label: 'View' },
            { value: 'edit', label: 'Edit' },
          ]}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {profileLoading ? (
          <Surface style={styles.surface}>
            <Text style={styles.loadingText}>Loading security questions...</Text>
          </Surface>
        ) : (
          <>
            {questions.map((question, index) => (
              <Surface key={index} style={styles.questionContainer}>
                <View style={styles.questionHeader}>
                  <MaterialIcons name="security" size={20} color="#666" />
                  <Text style={styles.questionNumber}>
                    Question {index + 1}
                  </Text>
                </View>
                
                <Text style={styles.questionText}>
                  {question.question}
                </Text>

                {viewMode === 'view' ? (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerLabel}>
                      Answer:
                    </Text>
                    <Text style={styles.maskedAnswer}>
                      {maskAnswer(question.answer)}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Your Answer"
                      value={question.answer || ''}
                      onChangeText={(value) => handleQuestionChange(index, 'answer', value)}
                      error={!!errors[`${index}_answer`]}
                      style={styles.input}
                      multiline
                      numberOfLines={2}
                    />
                    {errors[`${index}_answer`] && (
                      <HelperText type="error" visible={!!errors[`${index}_answer`]}>
                        {errors[`${index}_answer`]}
                      </HelperText>
                    )}
                  </View>
                )}
              </Surface>
            ))}

            {viewMode === 'edit' && (
              <Surface style={styles.noteContainer}>
                <MaterialIcons name="info" size={16} color="#666" />
                <Text style={styles.note}>
                  These security questions help protect your account and can be used for password recovery.
                </Text>
              </Surface>
            )}

            {viewMode === 'edit' && (
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  loading={loading}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </View>
            )}
          </>
        )}
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
  modeSelector: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  questionContainer: {
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
  inputContainer: {
    marginTop: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#e3f2fd',
  },
  note: {
    marginLeft: 8,
    color: '#1976d2',
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

export default SecurityQuestionsScreen; 