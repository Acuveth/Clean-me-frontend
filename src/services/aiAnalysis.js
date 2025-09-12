// AI Analysis Service for Trash Photo Processing
import { API_BASE_URL } from '../config/constants';
import storage from '../utils/storage';

// Helper function to convert image to base64
const convertImageToBase64 = async (imageUri) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// Validate trash photo through backend
export const validateTrashPhoto = async (imageUri) => {
  try {
    console.log('Validating photo for outdoor trash...');
    const token = await storage.getItemAsync('authToken');
    
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg'
    });
    
    const response = await fetch(`${API_BASE_URL}/ai/validate-trash-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (!response.ok) {
      console.error('Validation API Error:', response.status);
      // If validation fails, allow the photo (fail-open approach)
      return {
        isValid: true,
        reason: "Validation service unavailable - proceeding with submission"
      };
    }

    const result = await response.json();
    
    if (result.success && result.validation) {
      return {
        isValid: result.validation.isValid || false,
        reason: result.validation.reason || "Photo validation completed",
        location: result.validation.location || "unclear",
        confidence: result.validation.confidence || 0
      };
    }
    
    // Default to allowing the photo if response is unexpected
    return {
      isValid: true,
      reason: "Validation completed - proceeding with submission"
    };
    
  } catch (error) {
    console.error('Photo validation error:', error);
    // If validation fails, allow the photo (fail-open approach)
    return {
      isValid: true,
      reason: "Validation service error - proceeding with submission"
    };
  }
};

// Analyze trash photo through backend
export const analyzeTrashPhoto = async (imageUri) => {
  try {
    console.log('Starting trash photo analysis...');
    const token = await storage.getItemAsync('authToken');
    
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg'
    });
    
    const response = await fetch(`${API_BASE_URL}/ai/analyze-trash-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    console.log('Analysis response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      
      // Check if it's a validation error (400 status)
      if (response.status === 400) {
        try {
          const errorJson = JSON.parse(errorData);
          if (errorJson.validationError) {
            console.log('Photo validation failed:', errorJson.validationError);
            return {
              success: false,
              analysis: null,
              validationError: errorJson.validationError
            };
          }
        } catch (e) {
          // If not JSON or doesn't have validationError, continue with normal error handling
        }
      }
      
      console.error('Analysis API Error:', response.status, errorData);
      
      // Return fallback analysis if backend fails
      return {
        success: false,
        analysis: {
          category: "general",
          materials: ["unspecified trash"],
          quantity: "medium",
          estimatedWeight: "1-2 kg",
          hazardLevel: "low",
          cleanupDifficulty: "moderate",
          recyclingInfo: "Please sort according to local guidelines",
          disposalMethod: "Dispose in appropriate waste bins",
          environmentalImpact: "Helps keep our environment clean",
          points: 25,
          tips: "Use gloves when handling trash",
          safetyNotes: "Be careful of sharp objects"
        }
      };
    }

    const result = await response.json();
    
    if (result.success && result.analysis) {
      return {
        success: true,
        analysis: result.analysis
      };
    }
    
    // Return fallback if response is unexpected
    return {
      success: false,
      analysis: {
        category: "general",
        materials: ["unspecified items"],
        quantity: "medium",
        estimatedWeight: "1-2 kg",
        hazardLevel: "low",
        cleanupDifficulty: "moderate",
        recyclingInfo: "Sort according to local guidelines",
        disposalMethod: "Use appropriate waste bins",
        environmentalImpact: "Environmental cleanup in progress",
        points: 25,
        tips: "Handle with care",
        safetyNotes: "Use protective equipment"
      }
    };
    
  } catch (error) {
    console.error('Analysis Error:', error);
    return {
      success: false,
      analysis: {
        category: "general",
        materials: ["reported trash"],
        quantity: "medium",
        estimatedWeight: "estimated",
        hazardLevel: "low",
        cleanupDifficulty: "moderate",
        recyclingInfo: "Follow local recycling guidelines",
        disposalMethod: "Dispose properly",
        environmentalImpact: "Thank you for reporting",
        points: 25,
        tips: "Safety first",
        safetyNotes: "Use gloves and be careful"
      }
    };
  }
};

// Main function that combines validation and analysis
export const processTrashPhoto = async (imageUri) => {
  // First validate if the photo is appropriate
  const validation = await validateTrashPhoto(imageUri);
  
  if (!validation.isValid) {
    return {
      success: false,
      analysis: null,
      validationError: validation.reason
    };
  }
  
  // If valid, proceed with analysis
  return await analyzeTrashPhoto(imageUri);
};

// For backward compatibility
export const analyzeTrashPhotoWithOpenAI = analyzeTrashPhoto;