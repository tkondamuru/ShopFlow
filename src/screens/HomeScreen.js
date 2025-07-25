import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import { CustomerContext } from '../store/CustomerContext';
import Layout from '../components/Layout';
import ShopSelectorModal from '../components/ShopSelectorModal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ICON_COLOR = '#4AC9E3';

const SEARCH_OPTIONS = [
  {
    key: 'partSearch',
    title: 'Part Search',
    subtitle: 'Auto parts, sundry, dealer part search',
    icon: 'magnify',
  },
  {
    key: 'mmySearch',
    title: 'Make/Model/Year Search',
    subtitle: '',
    icon: 'car',
  },
  {
    key: 'vinSearch',
    title: 'VIN Search',
    subtitle: 'Search by 14 characters',
    icon: 'numeric',
  },
  {
    key: 'utilityParts',
    title: 'Utility Parts Search',
    subtitle: 'Non NAGS part numbers',
    icon: 'tools',
  },
  {
    key: 'newParts',
    title: 'New Parts',
    subtitle: 'Parts added in last 30 days',
    icon: 'plus-circle',
  },
  {
    key: 'sundries',
    title: 'Sundries',
    subtitle: 'Search by categories or keywords',
    icon: 'cube',
  },
];

const HomeScreen = ({ navigation }) => {
  const { selectedShop } = useContext(CustomerContext);
  const [shopModalVisible, setShopModalVisible] = useState(false);
  const animScales = useRef(SEARCH_OPTIONS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    if (!selectedShop) setShopModalVisible(true);
  }, [selectedShop]);

  const handleOpenShopModal = () => setShopModalVisible(true);

  const handleBottomNavPress = (route) => {
    if (route !== 'Home') {
      navigation.navigate(route);
    }
  };

  const handlePress = (idx, key) => {
    Animated.spring(animScales[idx], {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 3,
      tension: 100,
    }).start(() => {
      Animated.spring(animScales[idx], {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
        tension: 100,
      }).start();
      navigation.navigate(key);
    });
  };

  const renderItem = ({ item, index }) => (
    <TouchableWithoutFeedback onPress={() => handlePress(index, item.key)}>
      <Animated.View
        style={[
          styles.listItem,
          { transform: [{ scale: animScales[index] }] },
        ]}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={item.icon} size={36} color={ICON_COLOR} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          {!!item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );

  return (
    <Layout 
      navigation={navigation} 
      onOpenShopModal={handleOpenShopModal}
      currentRoute="Home"
      onBottomNavPress={handleBottomNavPress}
    >
      <FlatList
        data={SEARCH_OPTIONS}
        keyExtractor={item => item.key}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <ShopSelectorModal
        visible={shopModalVisible}
        onDismiss={() => setShopModalVisible(false)}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 32,
    paddingTop: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7fa',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF4FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#525046',
  },
});

export default HomeScreen;