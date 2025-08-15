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
import { COLORS, MAP_DEFAULTS } from "../config/constants";
import { SECRETS } from "../config/secrets";
import { fetchTrashReports } from "../store/trashSlice";

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
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="${COLORS.PRIMARY}">
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="35" viewBox="0 0 24 24" fill="${COLORS.ERROR}">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                \`) :
                'data:image/svg+xml;base64,' + btoa(\`
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="35" viewBox="0 0 24 24" fill="${COLORS.SUCCESS}">
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
        
        {/* Floating action buttons */}
        <View style={styles.floatingActions}>
          <TouchableOpacity 
            style={styles.fabPrimary}
            onPress={() => navigation.navigate('Report')}
          >
            <MaterialIcons name="add-location" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.fabSecondary}
            onPress={() => navigation.navigate('Pickup')}
          >
            <MaterialIcons name="cleaning-services" size={20} color={COLORS.PRIMARY} />
          </TouchableOpacity>
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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trash Clean</Text>
        <Text style={styles.headerSubtitle}>Nearby trash reports</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshLocation}
        >
          <MaterialIcons name="refresh" size={24} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Google Maps View */}
      <GoogleMapsView />

      {/* Stats Footer */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {reports.filter((r) => r.status === "pending").length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {reports.filter((r) => r.status === "cleaned").length}
          </Text>
          <Text style={styles.statLabel}>Cleaned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
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
  },
  loader: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  header: {
    backgroundColor: COLORS.SURFACE,
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    position: "absolute",
    bottom: 15,
    left: 20,
  },
  refreshButton: {
    padding: 8,
  },
  // Google Maps styles
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
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  floatingActions: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
  },
  fabPrimary: {
    backgroundColor: COLORS.PRIMARY,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabSecondary: {
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noLocationText: {
    fontSize: 18,
    color: "#666",
    marginTop: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  statsContainer: {
    backgroundColor: COLORS.SURFACE,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.DIVIDER,
  },
});

export default HomeScreen;
