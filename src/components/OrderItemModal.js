import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const OrderItemModal = ({
  visible,
  selectedItem,
  selectedGroupItems,
  selectedGroupIndex,
  onClose,
  onDelete,
  onNavigate,
  isActiveOrders = true,
  formatPrice = (price) => price,
  formatDeparture = (date) => date,
  getItemStatus = () => 'OPN'
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              {/* Delete icon if OPN and not cancelled (only for Active Orders) */}
              {isActiveOrders && selectedItem && getItemStatus(selectedItem) === 'OPN' && (
                <TouchableOpacity onPress={() => onDelete(selectedItem)}>
                  <MaterialIcons name="delete" size={24} color="#d32f2f" />
                </TouchableOpacity>
              )}
              <Text style={styles.modalTitle}>
                Item Details
                {selectedGroupItems.length > 1 && (
                  <Text style={styles.modalCounter}>  {selectedGroupIndex + 1} of {selectedGroupItems.length}</Text>
                )}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {selectedItem && (
              <ScrollView 
                style={styles.modalContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Part Description:</Text>
                  <Text style={styles.detailValue}>{selectedItem.partDescription}</Text>
                </View>
                
                {isActiveOrders ? (
                  // Active Orders details
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Quantity:</Text>
                      <Text style={styles.detailValue}>{selectedItem.shipQuantity}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Unit Price:</Text>
                      <Text style={styles.detailValue}>{formatPrice(selectedItem.unitPrice)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Total Price:</Text>
                      <Text style={styles.detailValue}>{formatPrice(selectedItem.totalPrice)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Departure:</Text>
                      <Text style={styles.detailValue}>{formatDeparture(selectedItem.departureDateTime)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Caller:</Text>
                      <Text style={styles.detailValue}>{selectedItem.callerName}</Text>
                    </View>
                    {/* Only show PO Number if it has value */}
                    {selectedItem.lineItemPoNumber && selectedItem.lineItemPoNumber.trim() !== '' ? (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Customer Item PO Number:</Text>
                        <Text style={styles.detailValue}>{selectedItem.lineItemPoNumber}</Text>
                      </View>
                    ) : null}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <Text style={styles.detailValue}>{getItemStatus(selectedItem)}</Text>
                    </View>
                  </>
                ) : (
                  // Active Returns details
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Ship Quantity:</Text>
                      <Text style={styles.detailValue}>{selectedItem.shipQuantity}</Text>
                    </View>
                    {selectedItem.customerItemPONumber && selectedItem.customerItemPONumber.trim() !== '' ? (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Customer Item PO Number:</Text>
                        <Text style={styles.detailValue}>{selectedItem.customerItemPONumber}</Text>
                      </View>
                    ) : null}
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Purchase Location Number:</Text>
                      <Text style={styles.detailValue}>{selectedItem.purchaseLocationNumber}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Purchase Shipper Number:</Text>
                      <Text style={styles.detailValue}>{selectedItem.purchaseShipperNumber}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Caller Name:</Text>
                      <Text style={styles.detailValue}>{selectedItem.callerName}</Text>
                    </View>
                  </>
                )}
                
                {/* Navigation buttons at bottom */}
                {selectedGroupItems.length > 1 && (
                  <View style={styles.modalNavigation}>
                    <TouchableOpacity
                      disabled={selectedGroupIndex <= 0}
                      onPress={() => onNavigate(-1)}
                      style={[
                        styles.navButton,
                        selectedGroupIndex <= 0 && styles.navButtonDisabled
                      ]}
                    >
                      <MaterialIcons name="chevron-left" size={24} color="#1976D2" />
                      <Text style={styles.navButtonText}>Previous</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={selectedGroupIndex >= selectedGroupItems.length - 1}
                      onPress={() => onNavigate(1)}
                      style={[
                        styles.navButton,
                        selectedGroupIndex >= selectedGroupItems.length - 1 && styles.navButtonDisabled
                      ]}
                    >
                      <Text style={styles.navButtonText}>Next</Text>
                      <MaterialIcons name="chevron-right" size={24} color="#1976D2" />
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '95%',
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
    flex: 1,
    textAlign: 'center',
  },
  modalCounter: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: 'normal',
  },
  modalContent: {
    padding: 16,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  modalNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 8,
  },
};

export default OrderItemModal; 