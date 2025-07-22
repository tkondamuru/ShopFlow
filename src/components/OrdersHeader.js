import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { IconButton, Searchbar } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const OrdersHeader = ({ 
  title, 
  onBackPress,
  backgroundColor = 'white',
  // Search functionality props
  showSearch = false,
  showServerSearch = false,
  showLoading = false, 
  isSearchMode = false, 
  onToggleSearch = () => {}, 
  onSearchChange = () => {},
  onServerSearch = () => {},
  searchPlaceholder = "Search: By any field"
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  
  // Handle local search change
  const handleLocalSearchChange = (text) => {
    setLocalSearchTerm(text);
    onSearchChange(text);
  };

  // Handle toggle search mode
  const handleToggleSearch = () => {
    if (isSearchMode) {
      setLocalSearchTerm('');
      onSearchChange('');
    }
    onToggleSearch();
  };

  // Simple header (no search functionality)
  if (!showSearch) {
    return (
      <View style={[styles.header, { backgroundColor }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.backButton} /> 
      </View>
    );
  }

  // Search-enabled header
  return (
    <View style={[styles.customTopBar, { backgroundColor }]}>
      {!isSearchMode ? (
        <>
          <IconButton
            icon="arrow-left"
            iconColor="black"
            size={28}
            onPress={onBackPress}
          />
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
            {showLoading && (
              <ActivityIndicator size="small" color="#1976D2" style={styles.headerLoader} />
            )}
          </View>
          <View style={styles.headerActions}>
            {showServerSearch && (
              <TouchableOpacity onPress={onServerSearch} style={styles.searchIconContainer}>
                <MaterialIcons name="filter-list" size={24} color="#666" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleToggleSearch} style={styles.searchIconContainer}>
              <MaterialIcons name="search" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder={searchPlaceholder}
              value={localSearchTerm}
              onChangeText={handleLocalSearchChange}
              style={styles.headerSearchInput}
              autoFocus={true}
              icon="magnify"
              onIconPress={() => {}}
            />
          </View>
          <TouchableOpacity onPress={handleToggleSearch} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Simple header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderBottomWidth: 1,
    borderBottomColor: '#4ac9e3',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  
  // Search-enabled header styles
  customTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerLoader: {
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIconContainer: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerSearchInput: {
    backgroundColor: 'white',
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    borderWidth: 1,
    borderColor: '#4ac9e3',
    borderRadius: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OrdersHeader; 