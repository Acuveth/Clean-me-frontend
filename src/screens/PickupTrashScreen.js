import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { COLORS } from '../config/constants';

const PickupTrashScreen = () => {
  const navigation = useNavigation();
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadTrashItems();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadTrashItems = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockData = [
        {
          id: '1',
          description: 'Plastic bottles near park bench',
          location: { latitude: 37.7749, longitude: -122.4194 },
          reportedTime: '2 hours ago',
          distance: '0.3 km',
          points: 10,
          imageUrl: null,
        },
        {
          id: '2',
          description: 'Food wrapper on sidewalk',
          location: { latitude: 37.7751, longitude: -122.4196 },
          reportedTime: '5 hours ago',
          distance: '0.5 km',
          points: 5,
          imageUrl: null,
        },
        {
          id: '3',
          description: 'Cardboard box by bus stop',
          location: { latitude: 37.7745, longitude: -122.4190 },
          reportedTime: '1 day ago',
          distance: '0.8 km',
          points: 8,
          imageUrl: null,
        },
      ];
      
      setTrashItems(mockData);
    } catch (error) {
      console.error('Error loading trash items:', error);
      Alert.alert('Error', 'Failed to load trash items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTrashItems();
  };

  const handlePickupItem = (item) => {
    navigation.navigate('PickupVerification', {
      trashId: item.id,
      trashLocation: item.location,
      trashDescription: item.description,
      points: item.points,
    });
  };

  const renderTrashItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemCard}
      onPress={() => handlePickupItem(item)}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemDescription}>{item.description}</Text>
          <View style={styles.itemMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.metaText}>{item.reportedTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.metaText}>{item.distance}</Text>
            </View>
          </View>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>{item.points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.pickupButton}
        onPress={() => handlePickupItem(item)}
      >
        <MaterialIcons name="camera-alt" size={20} color={COLORS.BACKGROUND} />
        <Text style={styles.pickupButtonText}>Start Pickup Verification</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading nearby trash...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Pickups</Text>
        <Text style={styles.headerSubtitle}>
          Help clean up and earn points!
        </Text>
      </View>

      {trashItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="check-circle" size={80} color={COLORS.SUCCESS} />
          <Text style={styles.emptyTitle}>All Clear!</Text>
          <Text style={styles.emptyText}>
            No trash reported in your area. Check back later!
          </Text>
        </View>
      ) : (
        <FlatList
          data={trashItems}
          renderItem={renderTrashItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.PRIMARY]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    opacity: 0.9,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  pointsBadge: {
    backgroundColor: COLORS.SURFACE_VARIANT,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    borderWidth: 1,
    borderColor: COLORS.ACCENT,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.ACCENT,
  },
  pointsLabel: {
    fontSize: 10,
    color: COLORS.ACCENT,
  },
  pickupButton: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  pickupButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.SUCCESS,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default PickupTrashScreen;