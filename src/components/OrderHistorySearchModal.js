import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Button, TextInput, Card, Title } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

const isValidDate = (str) => /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(new Date(str).getTime());

const OrderHistorySearchModal = ({ 
  visible, 
  onDismiss, 
  onSearch,
  loading = false,
  initialSearchParams = {},
}) => {
  const [searchParams, setSearchParams] = useState({
    partNumber: '',
    shipperNumber: '',
    purchasePO: '',
    linePO: '',
    startDate: '',
    endDate: ''
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(new Date());
  const [tempEndDate, setTempEndDate] = useState(new Date());

  useEffect(() => {
    if (visible) {
      setSearchParams({
        partNumber: initialSearchParams.partNumber || '',
        shipperNumber: initialSearchParams.shipperNumber || '',
        purchasePO: initialSearchParams.purchasePO || '',
        linePO: initialSearchParams.linePO || '',
        startDate: initialSearchParams.startDate || '',
        endDate: initialSearchParams.endDate || '',
      });
    }
  }, [visible, initialSearchParams]);

  const handleSearch = () => {
    onSearch(searchParams);
  };

  const clearSearch = () => {
    setSearchParams({
      partNumber: '',
      shipperNumber: '',
      purchasePO: '',
      linePO: '',
      startDate: '',
      endDate: ''
    });
  };

  const updateParam = (key, value) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // At least one field must be filled
  const isSearchEnabled = Object.values(searchParams).some(val => val && val.trim() !== '');

  // Date picker handlers
  const openStartDatePicker = () => {
    setTempStartDate(searchParams.startDate && isValidDate(searchParams.startDate) ? new Date(searchParams.startDate) : new Date());
    setShowStartDatePicker(true);
  };
  const openEndDatePicker = () => {
    setTempEndDate(searchParams.endDate && isValidDate(searchParams.endDate) ? new Date(searchParams.endDate) : new Date());
    setShowEndDatePicker(true);
  };

  const confirmStartDate = () => {
    updateParam('startDate', tempStartDate.toISOString().slice(0, 10));
    setShowStartDatePicker(false);
  };
  const confirmEndDate = () => {
    updateParam('endDate', tempEndDate.toISOString().slice(0, 10));
    setShowEndDatePicker(false);
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Title style={styles.modalTitle}>Order History Search</Title>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.searchForm}>
            <Card style={styles.searchCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Search Criteria</Text>
                
                <TextInput
                  label="Part Number"
                  value={searchParams.partNumber}
                  onChangeText={(text) => updateParam('partNumber', text)}
                  style={styles.input}
                  mode="outlined"
                  dense
                />

                <TextInput
                  label="Shipper Number"
                  value={searchParams.shipperNumber}
                  onChangeText={(text) => updateParam('shipperNumber', text)}
                  style={styles.input}
                  mode="outlined"
                  dense
                />

                <TextInput
                  label="Purchase PO#"
                  value={searchParams.purchasePO}
                  onChangeText={(text) => updateParam('purchasePO', text)}
                  style={styles.input}
                  mode="outlined"
                  dense
                />

                <TextInput
                  label="Line PO#"
                  value={searchParams.linePO}
                  onChangeText={(text) => updateParam('linePO', text)}
                  style={styles.input}
                  mode="outlined"
                  dense
                />

                {/* Start Date Picker */}
                <TouchableOpacity onPress={openStartDatePicker}>
                  <TextInput
                    label="Start Date"
                    value={searchParams.startDate}
                    style={styles.input}
                    mode="outlined"
                    dense
                    editable={false}
                    pointerEvents="none"
                    placeholder="YYYY-MM-DD"
                    error={!!searchParams.startDate && !isValidDate(searchParams.startDate)}
                  />
                </TouchableOpacity>
                {/* Double-modal for Start Date */}
                <Modal
                  visible={showStartDatePicker}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowStartDatePicker(false)}
                >
                  <View style={styles.datePickerModalOverlay}>
                    <View style={styles.datePickerModalContent}>
                      <DateTimePicker
                        value={tempStartDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => date && setTempStartDate(date)}
                      />
                      <View style={styles.datePickerButtons}>
                        <Button onPress={() => setShowStartDatePicker(false)} style={styles.datePickerButton}>Cancel</Button>
                        <Button mode="contained" onPress={confirmStartDate} style={styles.datePickerButton}>Confirm</Button>
                      </View>
                    </View>
                  </View>
                </Modal>

                {/* End Date Picker */}
                <TouchableOpacity onPress={openEndDatePicker}>
                  <TextInput
                    label="End Date"
                    value={searchParams.endDate}
                    style={styles.input}
                    mode="outlined"
                    dense
                    editable={false}
                    pointerEvents="none"
                    placeholder="YYYY-MM-DD"
                    error={!!searchParams.endDate && !isValidDate(searchParams.endDate)}
                  />
                </TouchableOpacity>
                {/* Double-modal for End Date */}
                <Modal
                  visible={showEndDatePicker}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowEndDatePicker(false)}
                >
                  <View style={styles.datePickerModalOverlay}>
                    <View style={styles.datePickerModalContent}>
                      <DateTimePicker
                        value={tempEndDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => date && setTempEndDate(date)}
                      />
                      <View style={styles.datePickerButtons}>
                        <Button onPress={() => setShowEndDatePicker(false)} style={styles.datePickerButton}>Cancel</Button>
                        <Button mode="contained" onPress={confirmEndDate} style={styles.datePickerButton}>Confirm</Button>
                      </View>
                    </View>
                  </View>
                </Modal>
              </Card.Content>
            </Card>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={clearSearch}
                style={[styles.button, styles.clearButton]}
                disabled={loading}
              >
                Clear
              </Button>
              <Button
                mode="contained"
                onPress={handleSearch}
                style={[styles.button, styles.searchButton]}
                loading={loading}
                disabled={loading || !isSearchEnabled}
              >
                Search
              </Button>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
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
  },
  closeButton: {
    padding: 4,
  },
  searchForm: {
    padding: 16,
  },
  searchCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  clearButton: {
    borderColor: '#666',
  },
  searchButton: {
    backgroundColor: '#4ac9e3',
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: 320,
    maxWidth: '90%',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    width: '100%',
  },
  datePickerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default OrderHistorySearchModal; 