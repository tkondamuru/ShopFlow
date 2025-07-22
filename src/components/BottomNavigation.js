import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { IconButton } from 'react-native-paper';

const BottomNavigation = ({ currentRoute, onNavigate }) => {
  const tabs = [
    { key: 'Home', icon: 'home', label: 'Home' },
    { key: 'Orders', icon: 'history', label: 'Orders' },
    { key: 'Cart', icon: 'cart', label: 'Cart' },
    { key: 'Profile', icon: 'account', label: 'Profile' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = currentRoute === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => onNavigate(tab.key)}
            >
              <IconButton
                icon={tab.icon}
                size={24}
                iconColor={isActive ? '#4AC9E3' : '#808080'}
                style={styles.icon}
              />
              <Text style={[
                styles.label,
                isActive && styles.activeLabel
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'white',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#4ac9e3',
    paddingBottom: Platform.OS === 'android' ? 10 : 10,
    paddingTop: Platform.OS === 'android' ? 8 : 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    margin: 0,
  },
  label: {
    fontSize: 12,
    color: '#808080',
    marginTop: 2,
    fontWeight: '500',
  },
  activeLabel: {
    color: '#4AC9E3',
    fontWeight: '600',
  },
});

export default BottomNavigation; 