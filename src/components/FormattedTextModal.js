import React from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { IconButton } from 'react-native-paper';

const FormattedTextModal = ({ visible, onDismiss, title, content }) => {
  // Function to parse and render formatted text
  const renderFormattedText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold header
        const headerText = part.slice(2, -2);
        return (
          <Text key={index} style={styles.boldHeader}>
            {headerText}
          </Text>
        );
      } else if (part.trim()) {
        // Regular text
        return (
          <Text key={index} style={styles.regularText}>
            {part}
          </Text>
        );
      }
      return null;
    });
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>{title}</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              style={styles.closeButton}
            />
          </View>
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.contentWrapper}>
              {renderFormattedText(content)}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    height: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    margin: 0,
  },
  contentContainer: {
    flex: 1,
  },
  contentWrapper: {
    padding: 16,
  },
  boldHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  regularText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 8,
  },
});

export default FormattedTextModal; 