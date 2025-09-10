import React from 'react';
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from "react-redux";
import { COLORS, MAP_DEFAULTS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from "../config/constants";
import { SECRETS } from "../config/secrets";
import { fetchTrashReports } from "../store/trashSlice";
import { Button } from "../../components/ui/Button";

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { reports } = useSelector((state) => state.trash);

  useEffect(() => {
    getCurrentLocation();
    dispatch(fetchTrashReports());
  }, [dispatch]);

  const getCurrentLocation = async () => {
    try {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to show nearby trash reports.",
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }

      // Get current location
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: MAP_DEFAULTS.LATITUDE_DELTA,
        longitudeDelta: MAP_DEFAULTS.LONGITUDE_DELTA,
      });
      setLoading(false);
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Unable to get current location");
      setLoading(false);
    }
  };

  const onMarkerPress = (report) => {
    navigation.navigate("TrashDetail", { reportId: report.id });
  };

  const refreshLocation = () => {
    setLoading(true);
    getCurrentLocation();
  };

  // Generate Google Maps HTML with markers
  const generateMapHTML = () => {
    const markers = reports.map(report => ({
      lat: parseFloat(report.latitude) || 0,
      lng: parseFloat(report.longitude) || 0,
      title: `${report.trash_type} - ${report.size}`,
      status: report.status,
      id: report.id
    }));

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          #map {
            height: 100%;
            width: 100%;
          }
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function initMap() {
            const userLocation = {
              lat: ${location?.latitude || 37.7749},
              lng: ${location?.longitude || -122.4194}
            };

            const map = new google.maps.Map(document.getElementById("map"), {
              zoom: 13,
              center: userLocation,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ]
            });

            // Add user location marker
            new google.maps.Marker({
              position: userLocation,
              map: map,
              title: "Your Location",
              icon: {
                url: 'data:image/svg+xml;base64,' + btoa(\`
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="#6B7280">
                    <circle cx="12" cy="12" r="8" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                  </svg>
                \`),
                scaledSize: new google.maps.Size(30, 30),
                anchor: new google.maps.Point(15, 15)
              }
            });

            // Add trash location markers
            const trashMarkers = ${JSON.stringify(markers)};
            trashMarkers.forEach(marker => {
              const markerIcon = marker.status === 'pending' ? 
                'data:image/svg+xml;base64,' + btoa(\`
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="35" viewBox="0 0 24 24" fill="#EF4444">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                \`) :
                'data:image/svg+xml;base64,' + btoa(\`
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="35" viewBox="0 0 24 24" fill="#16A34A">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                \`);

              const trashMarker = new google.maps.Marker({
                position: { lat: marker.lat, lng: marker.lng },
                map: map,
                title: marker.title,
                icon: {
                  url: markerIcon,
                  scaledSize: new google.maps.Size(25, 35),
                  anchor: new google.maps.Point(12, 35)
                }
              });

              trashMarker.addListener('click', () => {
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                  type: 'markerClick',
                  reportId: marker.id
                }));
              });
            });
          }
        </script>
        <script async defer 
          src="https://maps.googleapis.com/maps/api/js?key=${SECRETS.GOOGLE_MAPS_API_KEY}&callback=initMap">
        </script>
      </body>
    </html>`;
  };

  // Google Maps View Component
  const GoogleMapsView = () => {
    if (!location) {
      return (
        <View style={styles.mapPlaceholder}>
          <MaterialIcons name="map" size={60} color="#ccc" />
          <Text style={styles.placeholderText}>Loading map...</Text>
        </View>
      );
    }

    return (
      <View style={styles.mapContainer}>
        <WebView
          source={{ html: generateMapHTML() }}
          style={styles.webMap}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'markerClick' && data.reportId) {
                onMarkerPress({ id: data.reportId });
              }
            } catch (error) {
              console.log('Error parsing WebView message:', error);
            }
          }}
        />
        
        {/* Modern Floating Action Buttons */}
        <View style={styles.floatingActions}>
          <Button
            title=""
            onPress={() => navigation.navigate('Report')}
            variant="floating"
            icon="add-location"
            style={styles.fabPrimary}
          />
          
          <Button
            title=""
            onPress={() => navigation.navigate('Pickup')}
            variant="floating"
            icon="cleaning-services"
            style={[styles.fabSecondary, { backgroundColor: COLORS.BUTTON.PRIMARY_BG }]}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <MaterialIcons name="eco" size={60} color={COLORS.PRIMARY} />
        <ActivityIndicator
          size="large"
          color={COLORS.PRIMARY}
          style={styles.loader}
        />
        <Text style={styles.loadingText}>Finding your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Enhanced Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Trash Clean</Text>
            <Text style={styles.headerSubtitle}>Community Environmental Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshLocation}
            activeOpacity={0.7}
          >
            <MaterialIcons name="refresh" size={20} color={COLORS.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome Banner */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeIcon}>
            <MaterialIcons name="eco" size={24} color={COLORS.SUCCESS} />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Environmental Impact Dashboard</Text>
            <Text style={styles.welcomeDescription}>
              Real-time cleanup opportunities in your area
            </Text>
          </View>
        </View>
      </View>

      {/* Google Maps View */}
      <GoogleMapsView />

      {/* Enhanced Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Community Impact</Text>
          <Text style={styles.statsSubtitle}>Real-time environmental data</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.ERROR + '20' }]}>
                <MaterialIcons name="report-problem" size={20} color={COLORS.ERROR} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>
                  {reports.filter((r) => r.status === "pending").length}
                </Text>
                <Text style={styles.statLabel}>Needs Cleanup</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.SUCCESS + '20' }]}>
                <MaterialIcons name="check-circle" size={20} color={COLORS.SUCCESS} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>
                  {reports.filter((r) => r.status === "cleaned").length}
                </Text>
                <Text style={styles.statLabel}>Cleaned Up</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: COLORS.TEXT_SECONDARY + '20' }]}>
                <MaterialIcons name="insights" size={20} color={COLORS.TEXT_SECONDARY} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>{reports.length}</Text>
                <Text style={styles.statLabel}>Total Reports</Text>
              </View>
            </View>
          </View>
        </View>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: SPACING.lg,
  },
  loader: {
    marginTop: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },
  header: {
    backgroundColor: COLORS.SURFACE,
    paddingTop: SPACING.xxxl + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.sm,
    zIndex: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xxl,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.normal,
  },
  refreshButton: {
    padding: SPACING.md,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.SURFACE_VARIANT,
    ...SHADOWS.xs,
  },

  // Welcome Section
  welcomeSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.SUCCESS,
    ...SHADOWS.sm,
  },
  welcomeIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.SUCCESS + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  welcomeDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.normal * TYPOGRAPHY.FONT_SIZE.sm,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webMap: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: SPACING.lg,
  },
  placeholderText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    color: COLORS.TEXT_SECONDARY,
    textAlign: "center",
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },
  floatingActions: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    alignItems: 'flex-end',
    gap: SPACING.md,
  },
  fabPrimary: {
    marginBottom: SPACING.sm,
  },
  fabSecondary: {
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  noLocationText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.md,
    textAlign: "center",
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.relaxed * TYPOGRAPHY.FONT_SIZE.md,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.md,
    ...SHADOWS.xs,
  },
  retryButtonText: {
    color: "white",
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },
  statsSection: {
    backgroundColor: COLORS.SURFACE,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    ...SHADOWS.lg,
  },
  statsHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.lg,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  statsSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.SURFACE_VARIANT,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.xs,
  },
  statCardContent: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statTextContainer: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xl,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.normal,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xs,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    textTransform: "uppercase",
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
    textAlign: "center",
  },
  impactFooter: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.DIVIDER,
  },
  impactText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_TERTIARY,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default HomeScreen;
