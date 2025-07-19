import React from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { Button, IconButton } from 'react-native-paper';

const TextModal = ({ visible, onDismiss, title, content }) => {
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
            <Text style={styles.content}>{content}</Text>
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
    padding: 16,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
});

export default TextModal; 