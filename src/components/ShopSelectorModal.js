import React, { useContext, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Portal, Modal, Text, TextInput, List, Divider, IconButton } from 'react-native-paper';
import { CustomerContext } from '../store/CustomerContext';
import CustomButton from './CustomButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ShopSelectorModal = ({ visible, onDismiss, onSelect }) => {
  const { shops, selectedShop, updateSelectedShop } = useContext(CustomerContext);
  const [search, setSearch] = useState('');
  // Filtered and sorted shops: selected first, then others
  const filteredShops = useMemo(() => {
    let filtered = shops;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = shops.filter(shop =>
        shop.name.toLowerCase().includes(s) ||
        (shop.address && shop.address.toLowerCase().includes(s))
      );
    }
    
    // Selected shop first, but don't filter out other shops
    if (selectedShop) {
      // Find the selected shop in the filtered list
      const selectedInFiltered = filtered.find(s => s.shipto === selectedShop.shipto);
      if (selectedInFiltered) {
        // Remove the selected shop from its current position and put it first
        filtered = [selectedInFiltered, ...filtered.filter(s => s.shipto !== selectedShop.shipto)];
      } else {
        // If selected shop is not in filtered list, add it at the beginning
        filtered = [selectedShop, ...filtered];
      }
    }
    return filtered;
  }, [shops, selectedShop, search]);

  const renderShop = ({ item, index }) => {
    const isSelected = selectedShop && item.shipto === selectedShop.shipto;
    // Alternate row color for unselected shops
    const backgroundColor = isSelected
      ? styles.selectedShopItem.backgroundColor
      : index % 2 === 0
        ? '#FFFFFF'
        : '#EEF4FA';
    return (
      <List.Item
        title={item.name}
        description={item.address}
        descriptionNumberOfLines={3}
        style={[
          styles.shopItem,
          { backgroundColor },
          isSelected && styles.selectedShopItem,
        ]}
        right={() =>
          isSelected ? null : (
            <CustomButton
              title="Select"
              onPress={async () => {
                await updateSelectedShop(item);
                if (onSelect) {
                  onSelect(item);
                } else {
                  onDismiss && onDismiss();
                }
              }}
              style={[styles.selectButton, {
                paddingVertical: 4,
                paddingHorizontal: 4,
                minHeight: 22,
              }]}
            />
          )
        }
      />
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={() => {}}
        dismissable={false}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.modalTitle}>Select Shipping Address</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => {
                if (selectedShop) onDismiss && onDismiss();
              }}
              disabled={!selectedShop}
              accessibilityLabel="Close shop selector"
            />
          </View>
          <TextInput
            mode="outlined"
            label="Search Shipping Address"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          <Divider style={{ marginBottom: 8 }} />
          <FlatList
            data={filteredShops}
            keyExtractor={item => String(item.shipto)}
            renderItem={renderShop}
            keyboardShouldPersistTaps="handled"
            style={styles.flatList}
            contentContainerStyle={filteredShops.length === 0 ? styles.emptyList : undefined}
          />
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    alignSelf: 'center',
    width: '95%',
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 0,
    elevation: 6,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  searchInput: {
    marginBottom: 8,
  },
  flatList: {
    flex: 1,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopItem: {
    // backgroundColor: '#f7f7fa', // Remove default, set dynamically
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingRight: 8,
  },
  selectedShopItem: {
    backgroundColor: '#e3f6fd',
    borderColor: '#4AC9E3',
  },
  chip: {
    alignSelf: 'center',
    backgroundColor: '#4AC9E3',
    color: 'white',
    marginRight: 8,
  },
  selectButton: {
    alignSelf: 'center',
    marginRight: 8,
  },
});

export default ShopSelectorModal; 