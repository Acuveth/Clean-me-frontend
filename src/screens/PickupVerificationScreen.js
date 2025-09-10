import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Modal,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pickupVerificationService } from '../services/pickupVerification';
import { COLORS } from '../config/constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PickupVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { trashId, trashLocation, trashDescription } = route.params || {};
  
  const [capturedImage, setCapturedImage] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [distanceToTrash, setDistanceToTrash] = useState(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (userLocation && trashLocation) {
      const distance = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        trashLocation.latitude,
        trashLocation.longitude
      );
      setDistanceToTrash(distance);
    }
  }, [userLocation, trashLocation]);

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus === 'granted');
      
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(locationStatus === 'granted');
      
      if (locationStatus === 'granted') {
        getCurrentLocation();
      }
      
      if (cameraStatus !== 'granted' || locationStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'This feature requires camera and location permissions to verify trash pickup.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to get your current location. Please ensure location services are enabled.');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const takePicture = async () => {
    if (!cameraPermission) {
      Alert.alert('Camera Permission', 'Camera permission is required to take a photo.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Camera Error', 'Failed to take picture. Please try again.');
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
    setVerificationStatus(null);
  };

  const verifyPickup = async () => {
    if (!capturedImage) {
      Alert.alert('No Photo', 'Please take a photo of the trash item in your hand.');
      return;
    }

    if (!userLocation) {
      Alert.alert('Location Required', 'Unable to verify your location. Please ensure location services are enabled.');
      return;
    }

    if (distanceToTrash > 50) {
      Alert.alert(
        'Too Far Away',
        `You are ${Math.round(distanceToTrash)} meters away from the reported trash location. Please move closer (within 50 meters) to verify pickup.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setIsVerifying(true);
    setVerificationStatus(null);

    try {
      const verificationData = {
        trashId,
        image: capturedImage.base64,
        imageUri: capturedImage.uri,
        userLocation: {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          accuracy: userLocation.coords.accuracy,
        },
        trashLocation,
        timestamp: new Date().toISOString(),
        distanceFromTrash: distanceToTrash,
      };

      const result = await pickupVerificationService.verifyPickup(verificationData);

      if (result.success) {
        setVerificationStatus('success');
        setShowSuccessModal(true);
        
        setTimeout(() => {
          setShowSuccessModal(false);
          navigation.navigate('Home', { 
            pickupCompleted: true, 
            trashId,
            points: result.pointsEarned || 10 
          });
        }, 3000);
      } else {
        setVerificationStatus('failed');
        setShowFailureModal(true);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      Alert.alert(
        'Verification Failed',
        'Unable to verify pickup. Please ensure you are near the trash location and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const renderSuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.SUCCESS} />
          </View>
          <Text style={styles.modalTitle}>Pickup Verified!</Text>
          <Text style={styles.modalText}>
            Pickup verification complete.
          </Text>
          <Text style={styles.pointsText}>+10 Points</Text>
        </View>
      </View>
    </Modal>
  );

  const renderFailureModal = () => (
    <Modal
      visible={showFailureModal}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.failureIcon}>
            <Ionicons name="close-circle" size={80} color={COLORS.ERROR} />
          </View>
          <Text style={styles.modalTitle}>Verification Failed</Text>
          <Text style={styles.modalText}>
            The photo doesn't match the reported trash or you're too far from the location.
          </Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setShowFailureModal(false);
              retakePicture();
            }}
          >
            <Text style={styles.modalButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Verify Pickup</Text>
            <Text style={styles.headerSubtitle}>Complete your cleanup</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.instructionCard}>
            <Ionicons name="information-circle" size={24} color={COLORS.INFO} />
            <Text style={styles.instructionText}>
              To verify your pickup, please take a photo of the trash item while holding it in your hand.
            </Text>
          </View>

          {trashDescription && (
            <View style={styles.trashInfoCard}>
              <Text style={styles.trashInfoTitle}>Trash to Pickup:</Text>
              <Text style={styles.trashInfoText}>{trashDescription}</Text>
            </View>
          )}

          {distanceToTrash !== null && (
            <View style={styles.distanceCard}>
              <Ionicons 
                name="location" 
                size={20} 
                color={distanceToTrash <= 50 ? COLORS.SUCCESS : COLORS.WARNING} 
              />
              <Text style={[
                styles.distanceText,
                { color: distanceToTrash <= 50 ? COLORS.SUCCESS : COLORS.WARNING }
              ]}>
                {distanceToTrash <= 50 
                  ? `You are ${Math.round(distanceToTrash)}m from the trash location ✓`
                  : `Move closer: ${Math.round(distanceToTrash)}m away (need to be within 50m)`
                }
              </Text>
            </View>
          )}

          {!capturedImage ? (
            <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
              <Ionicons name="camera" size={48} color={COLORS.TEXT_PRIMARY} />
              <Text style={styles.cameraButtonText}>Take Photo</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.imageContainer}>
              <Image source={{ uri: capturedImage.uri }} style={styles.capturedImage} />
              <View style={styles.imageActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.retakeButton]}
                  onPress={retakePicture}
                >
                  <Ionicons name="refresh" size={20} color={COLORS.TEXT_PRIMARY} />
                  <Text style={[styles.actionButtonText, styles.retakeButtonText]}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.actionButton, 
                    styles.verifyButton,
                    (isVerifying || distanceToTrash > 50) && styles.disabledButton
                  ]}
                  onPress={verifyPickup}
                  disabled={isVerifying || distanceToTrash > 50}
                >
                  {isVerifying ? (
                    <ActivityIndicator color={COLORS.TEXT_PRIMARY} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-done" size={20} color={COLORS.TEXT_PRIMARY} />
                      <Text style={styles.actionButtonText}>Verify Pickup</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {verificationStatus === 'error' && (
            <View style={styles.errorMessage}>
              <Ionicons name="alert-circle" size={20} color={COLORS.ERROR} />
              <Text style={styles.errorText}>
                Verification failed. Please try again.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {renderSuccessModal()}
      {renderFailureModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    backgroundColor: COLORS.PRIMARY,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.SURFACE_VARIANT,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  instructionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  trashInfoCard: {
    backgroundColor: COLORS.SURFACE,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  trashInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  trashInfoText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 22,
  },
  distanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  distanceText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  cameraButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  cameraButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  imageContainer: {
    marginTop: 16,
  },
  capturedImage: {
    width: '100%',
    height: screenHeight * 0.4,
    borderRadius: 12,
    marginBottom: 16,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retakeButton: {
    backgroundColor: COLORS.TEXT_TERTIARY,
  },
  verifyButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  disabledButton: {
    backgroundColor: COLORS.TEXT_DISABLED,
    opacity: 0.6,
  },
  actionButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: 16,
    fontWeight: '600',
  },
  retakeButtonText: {
    color: COLORS.TEXT_PRIMARY,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE_VARIANT,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.ERROR,
  },
  errorText: {
    marginLeft: 8,
    color: COLORS.ERROR,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: screenWidth * 0.85,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  successIcon: {
    marginBottom: 16,
  },
  failureIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.SUCCESS,
    marginTop: 8,
  },
  modalButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  modalButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PickupVerificationScreen;