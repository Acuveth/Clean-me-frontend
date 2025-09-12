import axios from 'axios';
import { getAPIEndpoint } from '../config/secrets';
import * as SecureStore from 'expo-secure-store';

const API_URL = getAPIEndpoint();

class PickupVerificationService {
  async verifyPickup(verificationData) {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      const formData = new FormData();
      formData.append('trashId', verificationData.trashId);
      formData.append('userLatitude', verificationData.userLocation.latitude.toString());
      formData.append('userLongitude', verificationData.userLocation.longitude.toString());
      formData.append('locationAccuracy', verificationData.userLocation.accuracy.toString());
      formData.append('trashLatitude', verificationData.trashLocation.latitude.toString());
      formData.append('trashLongitude', verificationData.trashLocation.longitude.toString());
      formData.append('distanceFromTrash', verificationData.distanceFromTrash.toString());
      formData.append('timestamp', verificationData.timestamp);
      
      // Add image as blob for web/mobile compatibility
      if (verificationData.image) {
        const imageBlob = this.base64ToBlob(verificationData.image, 'image/jpeg');
        formData.append('verificationImage', imageBlob, 'pickup_verification.jpg');
      }

      const response = await axios.post(
        `${API_URL}/trash/verify-pickup`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          timeout: 30000, // 30 second timeout for image upload
        }
      );

      return {
        success: response.data.success,
        message: response.data.message,
        pointsEarned: response.data.pointsEarned,
        matchConfidence: response.data.matchConfidence,
      };
    } catch (error) {
      console.error('Pickup verification error:', error);
      
      // Handle specific error cases
      if (error.response) {
        switch (error.response.status) {
          case 400:
            throw new Error(error.response.data.message || 'Invalid verification data');
          case 404:
            throw new Error('Trash item not found or already picked up');
          case 409:
            throw new Error('This trash has already been picked up');
          case 422:
            throw new Error('Location verification failed - you are too far from the trash location');
          default:
            throw new Error('Verification failed. Please try again.');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  async getTrashItemsNearby(location, radius = 100) {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      const response = await axios.get(`${API_URL}/trash/nearby`, {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius, // radius in meters
        },
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching nearby trash items:', error);
      return [];
    }
  }

  async reportPickupIssue(trashId, issueType, description) {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      const response = await axios.post(
        `${API_URL}/trash/${trashId}/report-issue`,
        {
          issueType, // 'not_found', 'already_cleaned', 'inaccessible', 'wrong_location'
          description,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error reporting pickup issue:', error);
      throw error;
    }
  }

  calculateMatchConfidence(capturedImage, originalImage) {
    // This is a placeholder for frontend
    // Actual image comparison will be done on the backend
    // using computer vision libraries
    return {
      confidence: 0,
      shouldVerifyOnBackend: true,
    };
  }

  validateProximity(userLocation, trashLocation, maxDistance = 50) {
    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      trashLocation.latitude,
      trashLocation.longitude
    );

    return {
      isValid: distance <= maxDistance,
      distance,
      maxDistance,
    };
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
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
  }
}

export const pickupVerificationService = new PickupVerificationService();