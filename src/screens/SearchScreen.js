import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// If you have BootstrapIcons, import them instead
// import BootstrapIcons from 'react-native-vector-icons/BootstrapIcons';

const AD_IMAGE = 'https://azudevelopstorage.blob.core.windows.net/buysite-notifications/PartTopRight.png';
const HEADER_HEIGHT = 70;
const ICON_COLOR = '#4AC9E3';

const SEARCH_OPTIONS = [
  {
    key: 'partSearch',
    title: 'Part Search',
    subtitle: 'Auto parts, sundry, dealer part search',
    icon: 'magnify', // fallback to MaterialCommunityIcons
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

const SearchScreen = () => {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const animScales = useRef(SEARCH_OPTIONS.map(() => new Animated.Value(1))).current;

  const renderHeader = () => {
    const opacity = scrollY.interpolate({
      inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
      outputRange: [1, 0.7, 0],
      extrapolate: 'clamp',
    });
    const translateY = scrollY.interpolate({
      inputRange: [0, HEADER_HEIGHT],
      outputRange: [0, -HEADER_HEIGHT / 3],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View style={[styles.header, { opacity, transform: [{ translateY }] }]}>
        <Image
          source={{ uri: AD_IMAGE }}
          style={styles.headerImage}
          resizeMode="cover"
        />
      </Animated.View>
    );
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
      // Navigate to the respective search flow
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
    <View style={styles.container}>
      <Animated.FlatList
        data={SEARCH_OPTIONS}
        keyExtractor={item => item.key}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    height: HEADER_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  headerImage: {
   
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  listContent: {
    paddingBottom: 32,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7fa',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
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
    color: '#4AC9E3',
  },
});

export default SearchScreen; 