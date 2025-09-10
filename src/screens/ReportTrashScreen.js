import React from 'react';
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useState, useRef } from "react";
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
import { COLORS, API_BASE_URL, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from "../config/constants";
import { analyzeTrashPhoto } from "../services/aiAnalysis";
import { useAuth } from "../context/AuthContext";
import { Layout } from '../../components/ui/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const { width, height } = Dimensions.get('window');

const ReportTrashScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const { user } = useAuth();

  const steps = [
    { id: 0, title: "Take Photo", icon: "camera-alt", description: "Capture the trash" },
    { id: 1, title: "AI Analysis", icon: "psychology", description: "Smart detection" },
    { id: 2, title: "Location", icon: "location-on", description: "Auto-detected" },
    { id: 3, title: "Submit", icon: "send", description: "Submit report" }
  ];

  const animateProgress = (step) => {
    Animated.timing(progressAnim, {
      toValue: (step / (steps.length - 1)) * 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const animateSuccess = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const takePhoto = async () => {
    try {
      // Animate button press
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "📸 Camera Access Needed",
          "We need camera permission to capture trash photos for reporting."
        );
        return;
      }

      // Launch camera with better settings
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
        exif: false,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
        setHasPhoto(true);
        setCurrentStep(1);
        animateProgress(1);
        
        // Start both location and AI analysis simultaneously
        await Promise.all([
          getCurrentLocation(),
          analyzeImage(result.assets[0].uri)
        ]);
        
        animateSuccess();
      }
    } catch (error) {
      Alert.alert("📷 Camera Error", "Failed to take photo. Please try again.");
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
        accuracy: Location.Accuracy.High,
      });

      setLocationData(location.coords);
      setHasLocation(true);
      setCurrentStep(2);
      animateProgress(2);
    } catch (error) {
      Alert.alert("📍 Location Error", "Failed to get location. Please ensure GPS is enabled.");
    }
  };

  const analyzeImage = async (imageUri) => {
    try {
      setIsAnalyzing(true);
      const result = await analyzeTrashPhoto(imageUri);
      
      // Handle validation failure
      if (result.validationError) {
        Alert.alert(
          "🤖 AI Photo Review",
          `${result.validationError}\n\nPlease capture litter in outdoor public spaces (streets, parks, sidewalks, etc.)`,
          [
            { 
              text: "Retake Photo", 
              onPress: () => {
                setHasPhoto(false);
                setPhotoUri(null);
                setAiAnalysis(null);
                setCurrentStep(0);
                animateProgress(0);
              },
              style: "default"
            },
            { text: "Cancel", style: "cancel" }
          ]
        );
        return;
      }
      
      setAiAnalysis(result.analysis);
      
      if (result.success && result.analysis) {
        // Success feedback with better UX
        setTimeout(() => {
          Alert.alert(
            "🤖 AI Analysis Complete", 
            `Smart Detection Results:\n\n📊 Items Found: ${result.analysis?.trashCount || 0}\n🏷️ Types: ${result.analysis?.trashTypes?.join(', ') || 'Mixed'}\n📍 Context: ${result.analysis?.location_context || 'Public space'}`,
            [{ text: "Continue", style: "default" }]
          );
        }, 500);
      } else if (result.analysis) {
        Alert.alert("Photo Validated", "Image approved for reporting.");
      }
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert("⚠️ Analysis Warning", "AI analysis unavailable, but you can still submit the report.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const submitReport = async () => {
    if (!hasPhoto) {
      Alert.alert("📸 Photo Required", "Please take a photo of the trash first.");
      return;
    }
    if (!hasLocation) {
      Alert.alert(
        "📍 Location Required",
        "Please allow location access to submit the report."
      );
      return;
    }

    if (!user) {
      Alert.alert("🔐 Sign In Required", "Please log in to submit reports and earn points.");
      return;
    }

    try {
      setIsSubmitting(true);
      setCurrentStep(3);
      animateProgress(3);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'trash-report.jpg'
      });
      
      // Add all the data
      formData.append('latitude', locationData.latitude.toString());
      formData.append('longitude', locationData.longitude.toString());
      formData.append('username', user.name || user.email);
      
      // Add AI analysis data if available
      if (aiAnalysis) {
        formData.append('aiDescription', aiAnalysis?.description || 'User-submitted trash report');
        formData.append('trashCount', (aiAnalysis?.trashCount || '1').toString());
        formData.append('trashTypes', JSON.stringify(aiAnalysis?.trashTypes || ['unspecified trash']));
        formData.append('severity', aiAnalysis?.severity || 'medium');
        formData.append('locationContext', aiAnalysis?.location_context || 'user-reported location');
      } else {
        // Fallback data if AI analysis failed
        formData.append('aiDescription', 'User-submitted trash report');
        formData.append('trashCount', '1');
        formData.append('trashTypes', JSON.stringify(['unspecified trash']));
        formData.append('severity', 'medium');
        formData.append('locationContext', 'user-reported location');
      }
      
      // Add standard fields required by backend
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
        
        // Show success animation
        setShowSuccessAnimation(true);
        animateSuccess();
        
        setTimeout(() => {
          Alert.alert(
            "Report Submitted", 
            `Report submitted successfully.\n\nPoints have been added to your account.`,
            [
              { 
                text: "View on Map", 
                onPress: () => {/* Navigate to map */}
              },
              { 
                text: "Submit Another", 
                onPress: resetForm,
                style: "default"
              }
            ]
          );
        }, 1000);
        
      } else {
        const error = await response.json();
        Alert.alert("❌ Submission Failed", error.message || "Please try again later.");
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert("🌐 Network Error", "Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setHasPhoto(false);
    setHasLocation(false);
    setPhotoUri(null);
    setLocationData(null);
    setAiAnalysis(null);
    setCurrentStep(0);
    setShowSuccessAnimation(false);
    animateProgress(0);
  };

  const getStepIcon = (step, index) => {
    if (index < currentStep) return "check-circle";
    if (index === currentStep && isAnalyzing && index === 1) return "psychology";
    if (index === currentStep && isSubmitting && index === 3) return "send";
    return step.icon;
  };

  const getStepColor = (index) => {
    if (index < currentStep) return COLORS.SUCCESS;
    if (index === currentStep) return COLORS.PRIMARY;
    return COLORS.TEXT_TERTIARY;
  };

  const getPointsEstimate = () => {
    if (!aiAnalysis) return 10;
    const basePoints = (aiAnalysis.trashCount || 1) * 10;
    const severityMultiplier = aiAnalysis.severity === 'high' ? 2 : aiAnalysis.severity === 'low' ? 0.5 : 1;
    return Math.round(basePoints * severityMultiplier);
  };

  return (
    <Layout scrollable padding="none">
      <View style={styles.container}>
        {/* Clean Minimalist Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleSection}>
              <Text style={styles.headerTitle}>Report Trash</Text>
            </View>
            
            {/* Points Indicator */}
            {aiAnalysis && (
              <View style={styles.pointsContainer}>
                <View style={styles.pointsBadge}>
                  <MaterialIcons name="eco" size={16} color={COLORS.SUCCESS} />
                  <Text style={styles.pointsText}>+{getPointsEstimate()}</Text>
                </View>
                <Text style={styles.pointsLabel}>points</Text>
              </View>
            )}
          </View>
          
          {/* Simple Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              Step {currentStep + 1} of {steps.length}
            </Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Clean Step Cards - 2x2 Grid */}
          <View style={styles.stepsSection}>
            <View style={styles.stepsGrid}>
              {steps.map((step, index) => (
                <Card 
                  key={step.id}
                  variant={index <= currentStep ? "elevated" : "default"}
                  padding="medium"
                  style={[
                    styles.stepCard,
                    styles.gridStepCard,
                    index === currentStep && styles.activeStepCard,
                    index < currentStep && styles.completedStepCard,
                  ]}
                >
                  <View style={styles.gridStepContent}>
                    <View style={[
                      styles.gridStepIcon,
                      { 
                        backgroundColor: index <= currentStep ? getStepColor(index) + '20' : COLORS.SURFACE_VARIANT 
                      }
                    ]}>
                      {(index === currentStep && ((index === 1 && isAnalyzing) || (index === 3 && isSubmitting))) ? (
                        <ActivityIndicator size="small" color={getStepColor(index)} />
                      ) : (
                        <MaterialIcons 
                          name={getStepIcon(step, index)} 
                          size={24} 
                          color={getStepColor(index)} 
                        />
                      )}
                    </View>
                    
                    <View style={styles.gridStepText}>
                      <Text style={[styles.gridStepTitle, { color: getStepColor(index) }]}>
                        {step.title}
                      </Text>
                      <Text style={styles.gridStepDescription}>
                        {index === 1 && isAnalyzing ? "Analyzing..." :
                         index === 1 && aiAnalysis ? `${aiAnalysis?.trashCount || 0} items` :
                         index === 2 && hasLocation ? "Confirmed" :
                         index === 3 && isSubmitting ? "Submitting..." :
                         step.description}
                      </Text>
                    </View>
                    
                    {index < currentStep && (
                      <View style={styles.gridCompletedBadge}>
                        <MaterialIcons name="check" size={12} color={COLORS.SUCCESS} />
                      </View>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          </View>

          {/* Clean Photo Section */}
          <View style={styles.photoSection}>
            {!hasPhoto ? (
              <Card variant="elevated" padding="large" style={styles.cameraCard}>
                <TouchableOpacity 
                  style={styles.cameraButton}
                  onPress={takePhoto}
                  activeOpacity={0.7}
                >
                  <View style={styles.cameraIcon}>
                    <MaterialIcons name="camera-alt" size={32} color={COLORS.SUCCESS} />
                  </View>
                  <Text style={styles.cameraButtonText}>Take Photo</Text>
                  <Text style={styles.cameraButtonSubtext}>Capture the trash to report</Text>
                </TouchableOpacity>
              </Card>
            ) : (
              <Card variant="elevated" padding="medium" style={styles.photoCard}>
                <View style={styles.photoContainer}>
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                  {showSuccessAnimation && (
                    <View style={styles.successOverlay}>
                      <View style={styles.successContent}>
                        <MaterialIcons name="check-circle" size={48} color={COLORS.SUCCESS} />
                        <Text style={styles.successText}>Report Submitted!</Text>
                      </View>
                    </View>
                  )}
                </View>
                
                <View style={styles.photoActions}>
                  <Button
                    title="Retake"
                    onPress={takePhoto}
                    variant="secondary"
                    size="small"
                    icon="camera-alt"
                  />
                  
                  {aiAnalysis && (
                    <View style={styles.photoStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{aiAnalysis?.trashCount || 0}</Text>
                        <Text style={styles.statLabel}>items</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{aiAnalysis?.severity || 'med'}</Text>
                        <Text style={styles.statLabel}>priority</Text>
                      </View>
                    </View>
                  )}
                </View>
              </Card>
            )}
          </View>

          {/* Clean AI Analysis Card */}
          {aiAnalysis && (
            <View style={styles.analysisSection}>
              <Card variant="elevated" padding="large" style={styles.analysisCard}>
                <View style={styles.analysisHeader}>
                  <View style={styles.analysisIcon}>
                    <MaterialIcons name="psychology" size={20} color={COLORS.SUCCESS} />
                  </View>
                  <View style={styles.analysisHeaderText}>
                    <Text style={styles.analysisTitle}>AI Analysis</Text>
                    <Text style={styles.analysisSubtitle}>Smart detection results</Text>
                  </View>
                </View>
                
                <View style={styles.analysisContent}>
                  <View style={styles.analysisItem}>
                    <Text style={styles.analysisLabel}>Description</Text>
                    <Text style={styles.analysisValue}>
                      {aiAnalysis?.description || 'Waste detected'}
                    </Text>
                  </View>
                  
                  <View style={styles.analysisRow}>
                    <View style={styles.analysisColumn}>
                      <Text style={styles.analysisLabel}>Count</Text>
                      <Text style={styles.analysisValue}>{aiAnalysis?.trashCount || 0}</Text>
                    </View>
                    <View style={styles.analysisColumn}>
                      <Text style={styles.analysisLabel}>Priority</Text>
                      <Text style={[
                        styles.analysisValue,
                        { 
                          color: aiAnalysis?.severity === 'high' ? COLORS.ERROR : 
                                 aiAnalysis?.severity === 'low' ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY 
                        }
                      ]}>
                        {aiAnalysis?.severity?.toUpperCase() || 'MEDIUM'}
                      </Text>
                    </View>
                  </View>
                  
                  {aiAnalysis?.trashTypes && aiAnalysis.trashTypes.length > 0 && (
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Types Detected</Text>
                      <View style={styles.typesTags}>
                        {aiAnalysis.trashTypes.slice(0, 3).map((type, index) => (
                          <View key={index} style={styles.typeTag}>
                            <Text style={styles.typeTagText}>{type}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </Card>
            </View>
          )}

          {/* Clean Submit Section */}
          <View style={styles.submitSection}>
            <Button
              title={isSubmitting ? "Submitting Report..." : "Submit Report"}
              onPress={submitReport}
              variant="success"
              size="large"
              icon={isSubmitting ? undefined : "send"}
              loading={isSubmitting}
              disabled={!hasPhoto || !hasLocation || isSubmitting}
              fullWidth
              elevated
            />
            
          </View>
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },

  // Clean Header
  header: {
    backgroundColor: COLORS.SURFACE,
    paddingTop: SPACING.xxxl + SPACING.lg,
    paddingBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  titleSection: {
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xxl,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.normal,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SUCCESS + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  pointsText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.SUCCESS,
  },
  pointsLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xs,
    color: COLORS.TEXT_TERTIARY,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },

  // Progress Section
  progressSection: {
    paddingHorizontal: SPACING.lg,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.SURFACE_VARIANT,
    borderRadius: RADIUS.xs,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.SUCCESS,
    borderRadius: RADIUS.xs,
  },
  progressText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_TERTIARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    textAlign: 'center',
  },

  // Content Container
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },

  // Clean Steps Section - 2x2 Grid
  stepsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  stepCard: {
    marginBottom: SPACING.xs,
  },
  gridStepCard: {
    width: '48%',
    minHeight: 120,
    marginBottom: SPACING.md,
    maxWidth: 180,
  },
  activeStepCard: {
    borderColor: COLORS.PRIMARY + '30',
    backgroundColor: COLORS.SURFACE_VARIANT,
  },
  completedStepCard: {
    borderColor: COLORS.SUCCESS + '30',
  },
  gridStepContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  gridStepIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  gridStepText: {
    alignItems: 'center',
  },
  gridStepTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  gridStepDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.normal * TYPOGRAPHY.FONT_SIZE.sm,
  },
  gridCompletedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 20,
    height: 20,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.SUCCESS + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Clean Photo Section
  photoSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  cameraCard: {
    alignItems: 'center',
  },
  cameraButton: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  cameraIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.SUCCESS + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cameraButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.lg,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  cameraButtonSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },

  // Clean Photo Card
  photoCard: {
    overflow: 'hidden',
  },
  photoContainer: {
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: 240,
    backgroundColor: COLORS.SURFACE_VARIANT,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.BACKGROUND + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
  },
  successText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.lg,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.SUCCESS,
    marginTop: SPACING.md,
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  photoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    color: COLORS.TEXT_PRIMARY,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xs,
    color: COLORS.TEXT_TERTIARY,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.DIVIDER,
  },

  // Clean Analysis Section
  analysisSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  analysisCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.SUCCESS,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  analysisIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.SUCCESS + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  analysisHeaderText: {
    flex: 1,
  },
  analysisTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  analysisSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },
  analysisContent: {
    gap: SPACING.md,
  },
  analysisItem: {
    gap: SPACING.xs,
  },
  analysisRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  analysisColumn: {
    flex: 1,
    gap: SPACING.xs,
  },
  analysisLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    color: COLORS.TEXT_TERTIARY,
    textTransform: 'uppercase',
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },
  analysisValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.normal * TYPOGRAPHY.FONT_SIZE.base,
  },
  typesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  typeTag: {
    backgroundColor: COLORS.SURFACE_VARIANT,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  typeTagText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xs,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    textTransform: 'capitalize',
  },

  // Clean Submit Section
  submitSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  submitHint: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_TERTIARY,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },
});

export default ReportTrashScreen;
