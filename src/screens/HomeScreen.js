import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, MAP_DEFAULTS } from "../config/constants";
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

      {/* Map */}
      {location ? (
        <MapView
          style={styles.map}
          region={location}
          showsUserLocation={true}
          showsMyLocationButton={true}
          loadingEnabled={true}
        >
          {reports.map((report) => (
            <Marker
              key={report.id}
              coordinate={{
                latitude: parseFloat(report.latitude),
                longitude: parseFloat(report.longitude),
              }}
              title={`${report.trash_type} - ${report.size}`}
              description={report.description || "Trash report"}
              pinColor={
                report.status === "pending" ? COLORS.ERROR : COLORS.SUCCESS
              }
              onPress={() => onMarkerPress(report)}
            >
              <View
                style={[
                  styles.markerContainer,
                  {
                    backgroundColor:
                      report.status === "pending"
                        ? COLORS.ERROR
                        : COLORS.SUCCESS,
                  },
                ]}
              >
                <MaterialIcons
                  name={
                    report.status === "pending"
                      ? "report-problem"
                      : "check-circle"
                  }
                  size={20}
                  color="white"
                />
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={styles.noLocationContainer}>
          <MaterialIcons name="location-off" size={60} color="#ccc" />
          <Text style={styles.noLocationText}>Unable to load map</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={getCurrentLocation}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

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
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loader: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "white",
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
    color: "#666",
    position: "absolute",
    bottom: 15,
    left: 20,
  },
  refreshButton: {
    padding: 8,
  },
  map: {
    flex: 1,
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
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
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
    color: "#666",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#eee",
  },
});

export default HomeScreen;
