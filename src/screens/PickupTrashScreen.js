import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../config/constants';
import { pickupVerificationService } from '../services/pickupVerification';
import { Layout } from '../../components/ui/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const PickupTrashScreen = () => {
  const navigation = useNavigation();
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const formatReportedTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const now = new Date();
    const reportedAt = new Date(timestamp);
    const diffInMinutes = Math.floor((now - reportedAt) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadTrashItems();
    }
  }, [userLocation]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      } else {
        Alert.alert(
          'Location Permission Required',
          'We need location access to find nearby trash for pickup.',
          [{ text: 'OK' }]
        );
        setLoading(false);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location. Please check your settings.');
      setLoading(false);
    }
  };

  const loadTrashItems = async () => {
    try {
      if (!userLocation) {
        // If we don't have location yet, get it first
        await getCurrentLocation();
        return;
      }

      const items = await pickupVerificationService.getTrashItemsNearby(
        userLocation,
        1000 // 1km radius
      );
      
      // Transform the API response to match our UI expectations
      const transformedItems = items.map(item => ({
        id: item.id.toString(),
        description: item.description || 'Trash reported',
        location: {
          latitude: parseFloat(item.location.latitude),
          longitude: parseFloat(item.location.longitude)
        },
        reportedTime: formatReportedTime(item.reportedAt),
        distance: `${(item.distance / 1000).toFixed(1)} km`,
        points: item.points || 10,
        imageUrl: item.imageUrl,
        trashType: item.trashType,
        size: item.size,
        severity: item.severity,
        locationContext: item.locationContext
      }));
      
      setTrashItems(transformedItems);
    } catch (error) {
      console.error('Error loading trash items:', error);
      Alert.alert('Error', 'Failed to load trash items. Please check your connection.');
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
    <Card variant="elevated" padding="large" style={styles.pickupCard}>
      <View style={styles.cardHeader}>
        <View style={styles.trashTypeIcon}>
          <MaterialIcons 
            name={getTrashTypeIcon(item.trashType)} 
            size={24} 
            color={COLORS.TEXT_SECONDARY} 
          />
        </View>
        <View style={styles.pointsContainer}>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{item.points}</Text>
          </View>
          <Text style={styles.pointsLabel}>points</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.trashDescription}>{item.description}</Text>
        
        <View style={styles.trashDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialIcons name="schedule" size={16} color={COLORS.TEXT_TERTIARY} />
              <Text style={styles.detailText}>{item.reportedTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="location-on" size={16} color={COLORS.TEXT_TERTIARY} />
              <Text style={styles.detailText}>{item.distance}</Text>
            </View>
          </View>
          
          {item.size && (
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <MaterialIcons name="straighten" size={16} color={COLORS.TEXT_TERTIARY} />
                <Text style={styles.detailText}>{item.size}</Text>
              </View>
              {item.severity && (
                <View style={styles.detailItem}>
                  <MaterialIcons name="priority-high" size={16} color={COLORS.TEXT_TERTIARY} />
                  <Text style={styles.detailText}>{item.severity}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <Button
        title="Start Cleanup"
        onPress={() => handlePickupItem(item)}
        variant="success"
        size="large"
        icon="camera-alt"
        fullWidth
        style={styles.pickupButton}
      />
    </Card>
  );

  const getTrashTypeIcon = (trashType) => {
    const iconMap = {
      'plastic': 'local-drink',
      'paper': 'description',
      'metal': 'build',
      'glass': 'wine-bar',
      'organic': 'eco',
      'electronic': 'electrical-services',
      'hazardous': 'warning',
      'general': 'delete'
    };
    return iconMap[trashType?.toLowerCase()] || 'delete';
  };

  if (loading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={COLORS.SUCCESS} />
            <Text style={styles.loadingTitle}>
              {!userLocation ? 'Finding your location' : 'Loading opportunities'}
            </Text>
            <Text style={styles.loadingSubtitle}>
              {!userLocation ? 'We need your location to find nearby trash' : 'Discovering cleanup opportunities nearby'}
            </Text>
          </View>
        </View>
      </Layout>
    );
  }

  return (
    <Layout scrollable={false} padding="none">
      <View style={styles.container}>
        {/* Clean Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>Cleanup Opportunities</Text>
            </View>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={onRefresh}
              disabled={refreshing}
            >
              <MaterialIcons 
                name="refresh" 
                size={24} 
                color={COLORS.TEXT_SECONDARY}
                style={refreshing ? styles.refreshing : null}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {trashItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Card variant="elevated" padding="large" style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <MaterialIcons name="eco" size={64} color={COLORS.SUCCESS} />
                </View>
                <Text style={styles.emptyTitle}>Area looks clean!</Text>
                <Text style={styles.emptyDescription}>
                  No cleanup opportunities found in your area right now. Check back later for new reports.
                </Text>
                <Button
                  title="Refresh"
                  onPress={onRefresh}
                  variant="ghost"
                  size="medium"
                  icon="refresh"
                  style={styles.emptyButton}
                />
              </Card>
            </View>
          ) : (
            <>
              <View style={styles.statsHeader}>
                <Text style={styles.statsText}>
                  {trashItems.length} opportunity{trashItems.length !== 1 ? 's' : ''} nearby
                </Text>
              </View>
              
              <FlatList
                data={trashItems}
                renderItem={renderTrashItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[COLORS.SUCCESS]}
                    tintColor={COLORS.SUCCESS}
                  />
                }
              />
            </>
          )}
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.lg,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.relaxed * TYPOGRAPHY.FONT_SIZE.base,
  },

  // Modern Header
  modernHeader: {
    backgroundColor: COLORS.SURFACE,
    paddingTop: SPACING.xxxl + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  mainTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xxl,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.normal,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },
  refreshButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.SURFACE_VARIANT,
  },
  refreshing: {
    opacity: 0.5,
  },

  // Content Area
  contentArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  statsHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  statsText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_TERTIARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },

  // List Content
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  // Pickup Cards
  pickupCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  trashTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.SURFACE_VARIANT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsBadge: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    minWidth: 48,
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  pointsText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
  },
  pointsLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xs,
    color: COLORS.TEXT_TERTIARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },

  // Card Content
  cardContent: {
    marginBottom: SPACING.lg,
  },
  trashDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.md,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.normal * TYPOGRAPHY.FONT_SIZE.md,
  },
  trashDetails: {
    gap: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },

  // Pickup Button
  pickupButton: {
    marginTop: SPACING.sm,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyCard: {
    alignItems: 'center',
    maxWidth: 320,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.SUCCESS + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xl,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.relaxed * TYPOGRAPHY.FONT_SIZE.base,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    minWidth: 120,
  },
});

export default PickupTrashScreen;