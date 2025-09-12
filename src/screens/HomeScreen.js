import React from 'react';
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from "react-redux";
import { COLORS, MAP_DEFAULTS, SPACING, TYPOGRAPHY, API_BASE_URL } from "../config/constants";
import { fetchTrashReports } from "../store/trashSlice";
import storage from "../utils/storage";

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(null);
  const dispatch = useDispatch();
  const { reports } = useSelector((state) => state.trash);
  const autoRefreshInterval = useRef(null);
  const webViewRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
    dispatch(fetchTrashReports());
    fetchMapConfig();
    startAutoRefresh();
    
    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, [dispatch]);

  const startAutoRefresh = () => {
    // Auto-refresh every 5 minutes
    autoRefreshInterval.current = setInterval(() => {
      dispatch(fetchTrashReports());
      // Reload the WebView to update the map
      if (webViewRef.current) {
        webViewRef.current.reload();
      }
    }, 300000); // 5 minutes = 300,000 milliseconds
  };

  const fetchMapConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/maps/config`);
      if (response.ok) {
        const config = await response.json();
        console.log("Map config fetched, API key:", config.apiKey ? "Present" : "Missing");
        setGoogleMapsApiKey(config.apiKey);
      } else {
        console.error("Failed to fetch map config, status:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch map config:", error);
    }
  };

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

      // Get current location with timeout and optimized accuracy
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
        maximumAge: 30000,
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
      Alert.alert("Error", "Unable to get current location. Showing Ljubljana, Slovenia.");
      // Default to Ljubljana coordinates when location fails
      setLocation({
        latitude: 46.0569,
        longitude: 14.5058,
        latitudeDelta: MAP_DEFAULTS.LATITUDE_DELTA,
        longitudeDelta: MAP_DEFAULTS.LONGITUDE_DELTA,
      });
      setLoading(false);
    }
  };

  const onMarkerPress = (report) => {
    navigation.navigate("TrashDetail", { reportId: report.id });
  };

  const refreshLocation = () => {
    setLoading(true);
    getCurrentLocation();
    dispatch(fetchTrashReports());
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
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
          /* Hide Google logo and copyright */
          .gm-style .gmnoprint,
          .gm-style .gm-style-cc,
          .gm-style .gmnoscreen,
          .gm-bundled-control,
          .gm-fullscreen-control,
          .gmnoprint,
          a[href^="https://maps.google.com/maps"],
          a[href^="https://www.google.com/maps"],
          .gm-style-cc {
            display: none !important;
          }
          /* Hide keyboard shortcuts */
          .gm-style .gm-style-mtc,
          .gm-style .gm-style-cc {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function initMap() {
            const userLocation = {
              lat: ${location?.latitude || 46.0569},
              lng: ${location?.longitude || 14.5058}
            };

            const map = new google.maps.Map(document.getElementById("map"), {
              zoom: 16,
              center: userLocation,
              mapTypeControl: false,
              zoomControl: false,
              streetViewControl: false,
              scaleControl: false,
              rotateControl: false,
              fullscreenControl: false,
              keyboardShortcuts: false,
              disableDefaultUI: true,
              styles: [
                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                {
                  featureType: "administrative.locality",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }]
                },
                {
                  featureType: "poi",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }]
                },
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                },
                {
                  featureType: "poi.park",
                  elementType: "geometry",
                  stylers: [{ color: "#263c3f" }]
                },
                {
                  featureType: "poi.park",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#6b9a76" }]
                },
                {
                  featureType: "road",
                  elementType: "geometry",
                  stylers: [{ color: "#38414e" }]
                },
                {
                  featureType: "road",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#212a37" }]
                },
                {
                  featureType: "road",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9ca5b3" }]
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry",
                  stylers: [{ color: "#746855" }]
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#1f2835" }]
                },
                {
                  featureType: "road.highway",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#f3d19c" }]
                },
                {
                  featureType: "transit",
                  elementType: "geometry",
                  stylers: [{ color: "#2f3948" }]
                },
                {
                  featureType: "transit.station",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }]
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [{ color: "#17263c" }]
                },
                {
                  featureType: "water",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#515c6d" }]
                },
                {
                  featureType: "water",
                  elementType: "labels.text.stroke",
                  stylers: [{ color: "#17263c" }]
                }
              ]
            });

            // Add user location marker with bigger, better design
            new google.maps.Marker({
              position: userLocation,
              map: map,
              title: "Your Location",
              icon: {
                url: 'data:image/svg+xml;base64,' + btoa(\`
                  <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70">
                    <!-- Outer pulse ring -->
                    <circle cx="35" cy="35" r="32" fill="none" stroke="#3B82F6" stroke-width="3" opacity="0.2">
                      <animate attributeName="r" values="32;35;32" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.2;0.1;0.2" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <!-- Drop shadow -->
                    <circle cx="35" cy="37" r="22" fill="#000000" opacity="0.15"/>
                    <!-- Main location circle -->
                    <circle cx="35" cy="35" r="22" fill="#3B82F6" stroke="white" stroke-width="4"/>
                    <!-- Inner white circle -->
                    <circle cx="35" cy="35" r="15" fill="white" opacity="0.9"/>
                    <!-- Center blue dot -->
                    <circle cx="35" cy="35" r="6" fill="#3B82F6"/>
                    <!-- Crosshairs for GPS precision -->
                    <line x1="35" y1="13" x2="35" y2="19" stroke="#3B82F6" stroke-width="2"/>
                    <line x1="35" y1="51" x2="35" y2="57" stroke="#3B82F6" stroke-width="2"/>
                    <line x1="13" y1="35" x2="19" y2="35" stroke="#3B82F6" stroke-width="2"/>
                    <line x1="51" y1="35" x2="57" y2="35" stroke="#3B82F6" stroke-width="2"/>
                  </svg>
                \`),
                scaledSize: new google.maps.Size(70, 70),
                anchor: new google.maps.Point(35, 35)
              }
            });

            // Add trash location markers with big circular icons
            const trashMarkers = ${JSON.stringify(markers)};
            trashMarkers.forEach(marker => {
              const markerIcon = marker.status === 'pending' ? 
                'data:image/svg+xml;base64,' + btoa(\`
                  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
                    <!-- Drop shadow circle -->
                    <circle cx="30" cy="32" r="25" fill="#000000" opacity="0.15"/>
                    <!-- Outer glow ring -->
                    <circle cx="30" cy="30" r="28" fill="none" stroke="#EF4444" stroke-width="2" opacity="0.3"/>
                    <!-- Main circle background -->
                    <circle cx="30" cy="30" r="25" fill="#EF4444" stroke="white" stroke-width="3"/>
                    <!-- Inner circle for contrast -->
                    <circle cx="30" cy="30" r="20" fill="#ffffff" opacity="0.9"/>
                    <!-- Trash can icon -->
                    <g transform="translate(20, 18)">
                      <rect x="3" y="8" width="14" height="18" rx="2" fill="#EF4444" stroke="#EF4444" stroke-width="1"/>
                      <rect x="1" y="6" width="18" height="3" rx="1.5" fill="#EF4444"/>
                      <rect x="6" y="2" width="8" height="4" rx="1" fill="#EF4444"/>
                      <line x1="8" y1="12" x2="8" y2="22" stroke="white" stroke-width="2" stroke-linecap="round"/>
                      <line x1="12" y1="12" x2="12" y2="22" stroke="white" stroke-width="2" stroke-linecap="round"/>
                      <line x1="16" y1="12" x2="16" y2="22" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    </g>
                  </svg>
                \`) :
                'data:image/svg+xml;base64,' + btoa(\`
                  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
                    <!-- Drop shadow circle -->
                    <circle cx="30" cy="32" r="25" fill="#000000" opacity="0.15"/>
                    <!-- Outer glow ring -->
                    <circle cx="30" cy="30" r="28" fill="none" stroke="#16A34A" stroke-width="2" opacity="0.3"/>
                    <!-- Main circle background -->
                    <circle cx="30" cy="30" r="25" fill="#16A34A" stroke="white" stroke-width="3"/>
                    <!-- Inner circle for contrast -->
                    <circle cx="30" cy="30" r="20" fill="#ffffff" opacity="0.9"/>
                    <!-- Large checkmark icon -->
                    <g transform="translate(15, 15)">
                      <path d="M8 15l7 7L30 7" stroke="#16A34A" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                  </svg>
                \`);

              const trashMarker = new google.maps.Marker({
                position: { lat: marker.lat, lng: marker.lng },
                map: map,
                title: marker.title,
                icon: {
                  url: markerIcon,
                  scaledSize: new google.maps.Size(60, 60),
                  anchor: new google.maps.Point(30, 30)
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
          src="https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap">
        </script>
      </body>
    </html>`;
  };

  // Google Maps View Component
  const GoogleMapsView = () => {
    if (!location || !googleMapsApiKey) {
      return (
        <View style={styles.mapPlaceholder}>
          <MaterialIcons name="map" size={60} color="#ccc" />
          <Text style={styles.placeholderText}>
            {!location ? "Getting location..." : "Loading map config..."}
          </Text>
          <Text style={styles.debugText}>
            Location: {location ? "✓" : "✗"} | API Key: {googleMapsApiKey ? "✓" : "✗"}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
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
        
        {/* Floating Action Buttons */}
        <View style={styles.floatingActions}>
          <TouchableOpacity 
            style={[styles.fabButton, { backgroundColor: COLORS.BUTTON.SUCCESS_BG, justifyContent: 'center', alignItems: 'center' }]}
            onPress={() => navigation.navigate('Report')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={28} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.fabButton, { backgroundColor: COLORS.BUTTON.PRIMARY_BG, justifyContent: 'center', alignItems: 'center' }]}
            onPress={() => navigation.navigate('Pickup')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="delete" size={28} color={COLORS.TEXT_PRIMARY} />
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
      <GoogleMapsView />
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
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});

export default HomeScreen;
