import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../config/constants";

const ReportTrashScreen = () => {
  const [hasPhoto, setHasPhoto] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  const takePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera permission is needed to take photos."
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setHasPhoto(true);
        Alert.alert("Success", "Photo captured! Now getting your location...");
        getCurrentLocation();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is needed to report trash."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setHasLocation(true);
      Alert.alert(
        "Location Found",
        `Lat: ${location.coords.latitude.toFixed(
          6
        )}, Lng: ${location.coords.longitude.toFixed(6)}`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to get location");
    }
  };

  const submitReport = () => {
    if (!hasPhoto) {
      Alert.alert("Missing Photo", "Please take a photo of the trash first.");
      return;
    }
    if (!hasLocation) {
      Alert.alert(
        "Missing Location",
        "Please allow location access to submit the report."
      );
      return;
    }

    Alert.alert("Success", "Trash report submitted successfully!");
    setHasPhoto(false);
    setHasLocation(false);
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <MaterialIcons name="report-problem" size={60} color={COLORS.PRIMARY} />
        <Text style={styles.title}>Report Trash</Text>
        <Text style={styles.subtitle}>Help clean up your community</Text>
      </View>

      <View style={styles.stepContainer}>
        <View style={[styles.step, hasPhoto && styles.completedStep]}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Take a Photo</Text>
            <Text style={styles.stepDescription}>
              Capture an image of the trash
            </Text>
          </View>
          <MaterialIcons
            name={hasPhoto ? "check-circle" : "camera-alt"}
            size={24}
            color={hasPhoto ? COLORS.SUCCESS : "#ccc"}
          />
        </View>

        <View style={[styles.step, hasLocation && styles.completedStep]}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Location</Text>
            <Text style={styles.stepDescription}>
              Automatically captured with photo
            </Text>
          </View>
          <MaterialIcons
            name={hasLocation ? "check-circle" : "location-on"}
            size={24}
            color={hasLocation ? COLORS.SUCCESS : "#ccc"}
          />
        </View>

        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Submit Report</Text>
            <Text style={styles.stepDescription}>
              Help others find and clean it
            </Text>
          </View>
          <MaterialIcons name="send" size={24} color="#ccc" />
        </View>
      </View>

      <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
        <MaterialIcons name="camera-alt" size={30} color="white" />
        <Text style={styles.photoButtonText}>
          {hasPhoto ? "Retake Photo" : "Take Photo"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!hasPhoto || !hasLocation) && styles.disabledButton,
        ]}
        onPress={submitReport}
        disabled={!hasPhoto || !hasLocation}
      >
        <MaterialIcons name="send" size={24} color="white" />
        <Text style={styles.submitButtonText}>Submit Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  stepContainer: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  completedStep: {
    backgroundColor: "#f8fff8",
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  stepNumberText: {
    color: "white",
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
    color: "#666",
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.PRIMARY,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
  },
  photoButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.SUCCESS,
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default ReportTrashScreen;
