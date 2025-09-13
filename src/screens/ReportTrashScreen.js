import React from 'react';
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useState, useRef, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS, API_BASE_URL, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from "../config/constants";
import { analyzeTrashPhoto } from "../services/aiAnalysis";
import { useAuth } from "../context/AuthContext";
import { Layout } from '../../components/ui/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const { width, height } = Dimensions.get('window');

const ReportTrashScreen = () => {
  const [currentState, setCurrentState] = useState('camera'); // 'camera', 'analyzing', 'results'
  const [photoUri, setPhotoUri] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  const { user } = useAuth();
  const navigation = useNavigation();
  const isCameraLaunched = useRef(false);

  // Launch camera when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Only launch camera if we're in camera state and haven't already launched it
      if (currentState === 'camera' && !isCameraLaunched.current) {
        isCameraLaunched.current = true;
        launchCamera();
      }

      // Reset the flag when leaving the screen
      return () => {
        if (currentState === 'camera') {
          isCameraLaunched.current = false;
        }
      };
    }, [currentState])
  );

  // Animation for loading spinner
  useEffect(() => {
    if (currentState === 'analyzing') {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [currentState]);

  const fadeIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const launchCamera = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "📸 Camera Access Needed",
          "We need camera permission to capture trash photos for reporting.",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                isCameraLaunched.current = false;
                navigation.navigate('Home');
              }
            },
            { text: "Open Settings", onPress: () => {/* Open settings */} }
          ]
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.9,
        exif: false,
      });

      if (!result.canceled) {
        isCameraLaunched.current = false; // Reset flag after photo taken
        setPhotoUri(result.assets[0].uri);
        setCurrentState('analyzing');
        fadeIn();

        // Start both location and AI analysis simultaneously
        await Promise.all([
          getCurrentLocation(),
          analyzeImage(result.assets[0].uri)
        ]);

        setCurrentState('results');
        fadeIn();
      } else {
        // If user cancels camera, navigate back to home screen
        isCameraLaunched.current = false;
        navigation.navigate('Home');
      }
    } catch (error) {
      Alert.alert("📷 Camera Error", "Failed to take photo. Please try again.");
      isCameraLaunched.current = false; // Reset flag on error
      setCurrentState('camera');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "📍 Location Access Needed",
          "We need your location to accurately place the trash report on the map."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
        maximumAge: 30000,
      });

      setLocationData(location.coords);
    } catch (error) {
      console.error('Location error:', error);
      // Continue without location - we can still submit the report
    }
  };

  const analyzeImage = async (imageUri) => {
    try {
      const result = await analyzeTrashPhoto(imageUri);

      // Handle validation failure
      if (result.validationError) {
        Alert.alert(
          "🤖 Photo Review",
          `${result.validationError}\n\nPlease capture litter in outdoor public spaces.`,
          [
            {
              text: "Retake Photo",
              onPress: () => {
                resetAndRetake();
              },
              style: "default"
            },
            { text: "Cancel", style: "cancel" }
          ]
        );
        return;
      }

      setAiAnalysis(result.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      // Continue without AI analysis
      setAiAnalysis({
        description: "Trash detected",
        trashCount: 1,
        trashTypes: ["unspecified"],
        severity: "medium",
        verified: false
      });
    }
  };

  const resetAndRetake = () => {
    setPhotoUri(null);
    setLocationData(null);
    setAiAnalysis(null);
    setCurrentState('camera');
    isCameraLaunched.current = false; // Reset flag to allow camera relaunch
    // Don't call launchCamera here, let useFocusEffect handle it
  };

  const submitReport = async () => {
    if (!photoUri) {
      Alert.alert("📸 Photo Required", "Please take a photo first.");
      return;
    }

    if (!user) {
      Alert.alert("🔐 Sign In Required", "Please log in to submit reports and earn points.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'trash-report.jpg'
      });

      // Add location data if available
      if (locationData) {
        formData.append('latitude', locationData.latitude.toString());
        formData.append('longitude', locationData.longitude.toString());
      } else {
        // Use default location if not available
        formData.append('latitude', '0');
        formData.append('longitude', '0');
      }

      formData.append('username', user.name || user.email);

      // Add AI analysis data
      if (aiAnalysis) {
        formData.append('aiDescription', aiAnalysis.description || 'User-submitted trash report');
        formData.append('trashCount', (aiAnalysis.trashCount || '1').toString());
        formData.append('trashTypes', JSON.stringify(aiAnalysis.trashTypes || ['unspecified']));
        formData.append('severity', aiAnalysis.severity || 'medium');
        formData.append('locationContext', aiAnalysis.location_context || 'user-reported location');
      }

      // Add standard fields
      formData.append('description', aiAnalysis?.description || 'User-submitted trash report');
      formData.append('trashType', aiAnalysis?.trashTypes?.[0] || 'mixed');
      formData.append('size', aiAnalysis?.severity === 'high' ? 'large' : aiAnalysis?.severity === 'low' ? 'small' : 'medium');

      // Submit to backend
      const response = await fetch(`${API_BASE_URL}/trash/report`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const result = await response.json();

        Alert.alert(
          "✅ Report Submitted",
          `Your report has been submitted successfully!\n\n+${getPointsEstimate()} points earned`,
          [
            {
              text: "Report Another",
              onPress: resetAndRetake,
              style: "default"
            },
            {
              text: "Done",
              style: "cancel"
            }
          ]
        );

      } else {
        Alert.alert("❌ Submission Failed", "Please try again later.");
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert("🌐 Network Error", "Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPointsEstimate = () => {
    if (!aiAnalysis) return 10;
    const basePoints = (aiAnalysis.trashCount || 1) * 10;
    const severityMultiplier = aiAnalysis.severity === 'high' ? 2 : aiAnalysis.severity === 'low' ? 0.5 : 1;
    return Math.round(basePoints * severityMultiplier);
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Render different screens based on state
  if (currentState === 'camera') {
    return (
      <Layout scrollable={false} padding="none">
        <View style={styles.cameraContainer}>
          <View style={styles.cameraPlaceholder}>
            <MaterialIcons name="camera-alt" size={48} color={COLORS.TEXT_TERTIARY} />
            <Text style={styles.cameraLoadingText}>Opening Camera...</Text>

            <TouchableOpacity
              style={styles.openCameraButton}
              onPress={() => {
                isCameraLaunched.current = false;
                launchCamera();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.openCameraButtonText}>Open Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Layout>
    );
  }

  if (currentState === 'analyzing') {
    return (
      <Layout scrollable={false} padding="none">
        <View style={styles.analyzingContainer}>
          <Animated.View style={[styles.analyzingContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            {/* Preview Image with Overlay */}
            <View style={styles.analyzingImageContainer}>
              <Image source={{ uri: photoUri }} style={styles.analyzingImage} />
              <View style={styles.analyzingOverlay}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <MaterialIcons name="psychology" size={64} color={COLORS.SUCCESS} />
                </Animated.View>
              </View>
            </View>

            {/* Loading Text */}
            <View style={styles.analyzingTextContainer}>
              <ActivityIndicator size="large" color={COLORS.SUCCESS} style={styles.loadingSpinner} />
              <Text style={styles.analyzingTitle}>Analysing the photo</Text>
              <Text style={styles.analyzingSubtitle}>Our AI is detecting trash items...</Text>

              {/* Progress Steps */}
              <View style={styles.progressSteps}>
                <View style={styles.progressStep}>
                  <MaterialIcons name="check-circle" size={20} color={COLORS.SUCCESS} />
                  <Text style={styles.progressStepText}>Photo captured</Text>
                </View>
                <View style={styles.progressStep}>
                  <ActivityIndicator size="small" color={COLORS.PRIMARY} />
                  <Text style={styles.progressStepText}>Analyzing content...</Text>
                </View>
                <View style={styles.progressStep}>
                  <MaterialIcons name="radio-button-unchecked" size={20} color={COLORS.TEXT_TERTIARY} />
                  <Text style={[styles.progressStepText, { color: COLORS.TEXT_TERTIARY }]}>Getting location</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </Layout>
    );
  }

  // Results screen
  return (
    <Layout scrollable padding="none">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Report Details</Text>
          <View style={styles.headerBadge}>
            <MaterialIcons name="eco" size={16} color={COLORS.SUCCESS} />
            <Text style={styles.headerBadgeText}>+{getPointsEstimate()} pts</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            {/* Photo Card */}
            <Card variant="elevated" padding="none" style={styles.photoResultCard}>
              <Image source={{ uri: photoUri }} style={styles.resultImage} />

              {/* Verification Badge */}
              {aiAnalysis && (
                <View style={[styles.verificationBadge, aiAnalysis.verified ? styles.verifiedBadge : styles.unverifiedBadge]}>
                  <MaterialIcons
                    name={aiAnalysis.verified ? "verified" : "info"}
                    size={16}
                    color={aiAnalysis.verified ? COLORS.SUCCESS : COLORS.WARNING}
                  />
                  <Text style={[styles.verificationText, { color: aiAnalysis.verified ? COLORS.SUCCESS : COLORS.WARNING }]}>
                    {aiAnalysis.verified ? "Verified" : "Under Review"}
                  </Text>
                </View>
              )}
            </Card>

            {/* AI Analysis Card */}
            <Card variant="elevated" padding="large" style={styles.analysisResultCard}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="psychology" size={24} color={COLORS.PRIMARY} />
                <Text style={styles.sectionTitle}>AI Analysis</Text>
              </View>

              <View style={styles.analysisDetails}>
                <Text style={styles.descriptionText}>
                  {aiAnalysis?.description || "Trash detected in the area"}
                </Text>

                {/* Trash Details Grid */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Items Detected</Text>
                    <Text style={styles.detailValue}>{aiAnalysis?.trashCount || 1}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Severity</Text>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(aiAnalysis?.severity) + '20' }]}>
                      <Text style={[styles.severityText, { color: getSeverityColor(aiAnalysis?.severity) }]}>
                        {(aiAnalysis?.severity || 'medium').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Trash Types */}
                {aiAnalysis?.trashTypes && aiAnalysis.trashTypes.length > 0 && (
                  <View style={styles.typesSection}>
                    <Text style={styles.detailLabel}>Types Identified</Text>
                    <View style={styles.typesList}>
                      {aiAnalysis.trashTypes.map((type, index) => (
                        <View key={index} style={styles.typeChip}>
                          <Text style={styles.typeChipText}>{type}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </Card>

            {/* Location Card */}
            <Card variant="elevated" padding="large" style={styles.locationCard}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="location-on" size={24} color={COLORS.ERROR} />
                <Text style={styles.sectionTitle}>Location</Text>
              </View>

              {locationData ? (
                <View style={styles.locationDetails}>
                  <View style={styles.coordinatesRow}>
                    <View style={styles.coordinateItem}>
                      <Text style={styles.coordinateLabel}>Latitude</Text>
                      <Text style={styles.coordinateValue}>{locationData.latitude.toFixed(6)}</Text>
                    </View>
                    <View style={styles.coordinateDivider} />
                    <View style={styles.coordinateItem}>
                      <Text style={styles.coordinateLabel}>Longitude</Text>
                      <Text style={styles.coordinateValue}>{locationData.longitude.toFixed(6)}</Text>
                    </View>
                  </View>

                  <View style={styles.accuracyRow}>
                    <MaterialIcons name="my-location" size={16} color={COLORS.TEXT_SECONDARY} />
                    <Text style={styles.accuracyText}>
                      Accurate to {locationData.accuracy ? `${Math.round(locationData.accuracy)}m` : 'unknown'}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.locationError}>
                  <MaterialIcons name="location-off" size={32} color={COLORS.TEXT_TERTIARY} />
                  <Text style={styles.locationErrorText}>Location unavailable</Text>
                  <Text style={styles.locationErrorSubtext}>Report will be submitted without precise location</Text>
                </View>
              )}
            </Card>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                title="Retake Photo"
                onPress={resetAndRetake}
                variant="secondary"
                size="large"
                icon="camera-alt"
                style={styles.retakeButton}
              />

              <Button
                title={isSubmitting ? "Submitting..." : "Submit Report"}
                onPress={submitReport}
                variant="success"
                size="large"
                icon={isSubmitting ? undefined : "send"}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.submitButton}
                elevated
              />
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </Layout>
  );
};

const getSeverityColor = (severity) => {
  switch(severity) {
    case 'high': return COLORS.ERROR;
    case 'low': return COLORS.SUCCESS;
    default: return COLORS.WARNING;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },

  // Camera State
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  cameraPlaceholder: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  cameraLoadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.lg,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    marginBottom: SPACING.xl,
  },
  openCameraButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
  },
  openCameraButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    color: COLORS.SURFACE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
  },

  // Analyzing State
  analyzingContainer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingContent: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: SPACING.xl,
  },
  analyzingImageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.xxxl,
    ...SHADOWS.lg,
  },
  analyzingImage: {
    width: '100%',
    height: '100%',
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.BACKGROUND + 'E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  loadingSpinner: {
    marginBottom: SPACING.lg,
  },
  analyzingTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xxl,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.sm,
  },
  analyzingSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    marginBottom: SPACING.xxxl,
  },
  progressSteps: {
    width: '100%',
    gap: SPACING.md,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  progressStepText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },

  // Results State
  header: {
    backgroundColor: COLORS.SURFACE,
    paddingTop: SPACING.xxxl + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xxl,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SUCCESS + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    gap: SPACING.xs,
  },
  headerBadgeText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.SUCCESS,
  },

  scrollContent: {
    flex: 1,
  },

  // Photo Result Card
  photoResultCard: {
    margin: SPACING.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  resultImage: {
    width: '100%',
    height: 280,
    backgroundColor: COLORS.SURFACE_VARIANT,
  },
  verificationBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    gap: SPACING.xs,
  },
  verifiedBadge: {
    backgroundColor: COLORS.SUCCESS + '20',
  },
  unverifiedBadge: {
    backgroundColor: COLORS.WARNING + '20',
  },
  verificationText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
  },

  // Analysis Card
  analysisResultCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.lg,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
  },
  analysisDetails: {
    gap: SPACING.lg,
  },
  descriptionText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.normal * TYPOGRAPHY.FONT_SIZE.base,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  detailItem: {
    flex: 1,
    gap: SPACING.sm,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_TERTIARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xl,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
  },
  severityBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  severityText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
  },
  typesSection: {
    gap: SPACING.sm,
  },
  typesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeChip: {
    backgroundColor: COLORS.SURFACE_VARIANT,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
  },
  typeChipText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    textTransform: 'capitalize',
  },

  // Location Card
  locationCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  locationDetails: {
    gap: SPACING.lg,
  },
  coordinatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE_VARIANT,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  coordinateItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  coordinateLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xs,
    color: COLORS.TEXT_TERTIARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },
  coordinateValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  coordinateDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.DIVIDER,
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  accuracyText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },
  locationError: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  locationErrorText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },
  locationErrorSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_TERTIARY,
    textAlign: 'center',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  retakeButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default ReportTrashScreen;