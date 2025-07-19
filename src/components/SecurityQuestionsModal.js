import React, { useState, useEffect } from 'react';
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  Surface,
  HelperText,
  SegmentedButtons,
} from 'react-native-paper';
import { View, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const SecurityQuestionsModal = ({ 
  visible, 
  onDismiss, 
  onQuestionsUpdate, 
  currentQuestions = [], 
  allQuestions = [],
  loading 
}) => {
  const [questions, setQuestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [viewMode, setViewMode] = useState('view'); // 'view' or 'edit'

  useEffect(() => {
    if (visible) {
      setQuestions(currentQuestions.map(q => ({ ...q })));
      setViewMode('view');
      setErrors({});
    }
  }, [visible, currentQuestions]);

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

  const handleSubmit = () => {
    if (validateForm()) {
      onQuestionsUpdate(questions);
    }
  };

  const handleDismiss = () => {
    setQuestions(currentQuestions.map(q => ({ ...q })));
    setViewMode('view');
    setErrors({});
    onDismiss();
  };

  const maskAnswer = (answer) => {
    if (!answer) return '';
    return '*'.repeat(Math.min(answer.length, 8));
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
              Security Questions
            </Text>
            <Button
              icon="close"
              onPress={handleDismiss}
              mode="text"
              compact
            />
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
            {questions.map((question, index) => (
              <View key={index} style={styles.questionContainer}>
                <View style={styles.questionHeader}>
                  <MaterialIcons name="security" size={20} color="#666" />
                  <Text variant="bodyMedium" style={styles.questionNumber}>
                    Question {index + 1}
                  </Text>
                </View>
                
                <Text variant="bodyLarge" style={styles.questionText}>
                  {question.question}
                </Text>

                {viewMode === 'view' ? (
                  <View style={styles.answerContainer}>
                    <Text variant="bodyMedium" style={styles.answerLabel}>
                      Answer:
                    </Text>
                    <Text variant="bodyLarge" style={styles.maskedAnswer}>
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
              </View>
            ))}

            {viewMode === 'edit' && (
              <View style={styles.noteContainer}>
                <MaterialIcons name="info" size={16} color="#666" />
                <Text variant="bodySmall" style={styles.note}>
                  These security questions help protect your account and can be used for password recovery.
                </Text>
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
            {viewMode === 'edit' && (
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                loading={loading}
                disabled={loading}
              >
                Save Changes
              </Button>
            )}
            {viewMode === 'view' && (
              <Button
                mode="contained"
                onPress={() => setViewMode('edit')}
                style={styles.button}
              >
                Edit Questions
              </Button>
            )}
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
    maxWidth: 450,
    maxHeight: '85%',
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
  modeSelector: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  content: {
    padding: 20,
  },
  questionContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
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
  },
  questionText: {
    marginBottom: 12,
    fontWeight: '500',
  },
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerLabel: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  maskedAnswer: {
    color: '#666',
    fontFamily: 'monospace',
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
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  note: {
    marginLeft: 8,
    color: '#1976d2',
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

export default SecurityQuestionsModal; 