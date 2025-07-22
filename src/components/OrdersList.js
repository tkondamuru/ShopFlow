import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const OrdersList = ({
  items,
  loading,
  refreshing,
  onRefresh,
  onItemPress,
  onCancelOrder,
  onDeleteItem,
  pressedItemKey,
  isActiveOrders = true,
  formatPrice = (price) => price,
  getItemStatus = () => 'OPN',
  isGroupCancelled = () => false,
  searchTerm = ''
}) => {
  // Group items by locationNumber + shipperNumber
  const groupItems = (items) => {
    const groups = {};
    items.forEach(item => {
      const groupKey = `${item.locationNumber}-${item.shipperNumber}`;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          locationNumber: item.locationNumber,
          shipperNumber: item.shipperNumber,
          customerPONumber: item.customerPONumber,
          items: [],
        };
      }
      groups[groupKey].items.push(item);
    });
    return Object.values(groups);
  };

  const groups = groupItems(items);

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={styles.ordersContainer}>
        {!loading && groups.length === 0 && (
          <Text style={{ textAlign: 'center', marginVertical: 16 }}>
            {searchTerm ? 'No matching items found.' : 'No items found.'}
          </Text>
        )}
        {groups.map((group, idx) => {
          const allOPN = group.items.every(item => getItemStatus(item) === 'OPN');
          const groupCancelled = isGroupCancelled(group);
          return (
            <View key={group.locationNumber + '-' + group.shipperNumber} style={styles.groupContainer}>
              <View style={styles.groupHeaderCustom}>
                <View style={styles.groupHeaderLeft}>
                  {isActiveOrders && allOPN && !groupCancelled && (
                    <TouchableOpacity onPress={() => onCancelOrder(group)} style={{ marginRight: 6 }}>
                      <MaterialIcons name="delete" size={18} color="#525046" />
                    </TouchableOpacity>
                  )}
                  <Text style={styles.groupHeaderRef}>
                    Ref{isActiveOrders ? '#' : ''}: {group.locationNumber}-{group.shipperNumber}
                  </Text>
                </View>
                {/* Only show PO if it has value */}
                {group.customerPONumber && group.customerPONumber.trim() !== '' ? (
                  <Text style={styles.groupHeaderPO}>
                    PO: {group.customerPONumber}
                  </Text>
                ) : null}
              </View>
              {group.items.map(item => {
                const itemKey = `${item.locationNumber}-${item.shipperNumber}-${item.itemUIDNumber}`;
                const isPressed = pressedItemKey === itemKey;
                const itemStatus = getItemStatus(item);
                const isCancelled = itemStatus === 'CAN';
                return (
                  <TouchableOpacity
                    key={itemKey}
                    onPress={() => onItemPress(item, group.items)}
                    style={[
                      styles.itemRow,
                      isPressed && styles.itemRowPressed,
                      isCancelled && styles.itemRowCancelled
                    ]}
                  >
                    <View style={styles.itemRowContent}>
                      <Text style={[
                        styles.itemPartNumber,
                        isPressed && styles.itemPartNumberPressed,
                        isCancelled && styles.itemPartNumberCancelled
                      ]}>{item.partDescription}</Text>
                      <View style={styles.itemRowRight}>
                        <Text style={[
                          styles.itemTotalPrice,
                          isPressed && styles.itemTotalPricePressed,
                          isCancelled && styles.itemTotalPriceCancelled
                        ]}>
                          {isActiveOrders ? formatPrice(item.totalPrice) : item.orderType}
                        </Text>
                        <MaterialIcons name="chevron-right" size={20} color={isCancelled ? "#999" : "#666"} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  ordersContainer: {
    padding: 6,
  },
  groupContainer: {
    marginBottom: 18,
    backgroundColor: 'white',
    elevation: 1,
  },
  groupHeaderCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#cfe2ff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginBottom: 2,
    elevation: 1,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  groupHeaderRef: {
    color: '#525046',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 24,
    flexShrink: 1,
  },
  groupHeaderPO: {
    color: '#525046',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 24,
    marginLeft: 12,
    flexShrink: 0,
  },
  itemRow: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 4,
  },
  itemRowPressed: {
    backgroundColor: '#f0f8ff',
  },
  itemRowCancelled: {
    borderBottomColor: '#ffcdd2',
    borderBottomWidth: 3,
    opacity: 0.9,
  },
  itemRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  itemPartNumber: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  itemPartNumberPressed: {
    fontWeight: 'bold',
  },
  itemPartNumberCancelled: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTotalPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  itemTotalPricePressed: {
    fontWeight: 'bold',
  },
  itemTotalPriceCancelled: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
};

export default OrdersList; 