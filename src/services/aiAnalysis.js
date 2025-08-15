// AI Analysis Service for Trash Photo Processing
import { API_BASE_URL } from '../config/constants';
import { SECRETS } from '../config/secrets';

export const analyzeTrashPhoto = async (imageUri) => {
  // First validate if the photo is appropriate (outdoor trash)
  const validation = await validateTrashPhoto(imageUri, SECRETS.OPENAI_API_KEY);
  
  if (!validation.isValid) {
    return {
      success: false,
      analysis: null,
      validationError: validation.reason
    };
  }
  
  // If valid, proceed with analysis
  return await analyzeTrashPhotoWithOpenAI(imageUri, SECRETS.OPENAI_API_KEY);
};

// New function to validate if photo shows outdoor trash
export const validateTrashPhoto = async (imageUri, apiKey) => {
  try {
    console.log('Validating photo for outdoor trash...');
    const base64Image = await convertImageToBase64(imageUri);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a photo validator for an environmental cleanup app. Only approve photos that show litter/trash in OUTDOOR public spaces (streets, parks, sidewalks, beaches, etc.). Reject indoor photos, private property, or inappropriate content."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Validate this image for a community trash cleanup app. Return ONLY a JSON object:
                
                {
                  "isValid": true/false,
                  "reason": "explanation",
                  "location": "indoor/outdoor/unclear",
                  "hasTrash": true/false
                }
                
                APPROVE only if:
                - Shows litter/trash in OUTDOOR public spaces
                - Location: streets, parks, sidewalks, beaches, public areas
                - Clearly shows environmental litter problem
                
                REJECT if:
                - Indoor locations (houses, buildings, rooms)
                - Private property (yards, driveways, personal spaces)  
                - No trash/litter visible
                - Inappropriate/offensive content
                - Person's face clearly visible
                - Private/personal items
                
                Return ONLY the JSON object, no other text.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 150,
        temperature: 0.2
      })
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
    const validationText = result.choices[0].message.content.trim();
    
    try {
      const validation = JSON.parse(validationText);
      console.log('Validation result:', validation);
      
      return {
        isValid: validation.isValid || false,
        reason: validation.reason || "Photo validation completed",
        location: validation.location || "unclear",
        hasTrash: validation.hasTrash || false
      };
    } catch (parseError) {
      console.error('Validation parse error:', parseError);
      // If parsing fails, allow the photo
      return {
        isValid: true,
        reason: "Validation parsing failed - proceeding with submission"
      };
    }
    
  } catch (error) {
    console.error('Photo validation error:', error);
    // If validation fails, allow the photo (fail-open approach)
    return {
      isValid: true,
      reason: "Validation service error - proceeding with submission"
    };
  }
};

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

// Alternative: Use a direct AI service like OpenAI
export const analyzeTrashPhotoWithOpenAI = async (imageUri, apiKey) => {
  try {
    console.log('Starting OpenAI analysis...');
    const base64Image = await convertImageToBase64(imageUri);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o", // Updated to use latest model
        messages: [
          {
            role: "system",
            content: "You are an environmental conservation assistant helping with community cleanup efforts. Your job is to identify litter and waste in images to help volunteers clean up public spaces and protect the environment. Always respond with valid JSON format as requested. This is for positive environmental impact."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are helping with environmental cleanup efforts. Please analyze this image for litter/waste items to help with community cleanup activities. 

This is for positive environmental impact - helping clean up public spaces and reduce pollution.

If you see any litter, trash, or waste items in the image, return ONLY a valid JSON object:
{
  "description": "Brief description of the litter and location",
  "trashCount": "2",
  "trashTypes": ["plastic bottle", "food wrapper"],
  "severity": "medium",
  "location_context": "on sidewalk next to park"
}

If you cannot see any litter/trash in the image, return:
{
  "description": "No visible litter detected in this image",
  "trashCount": "0",
  "trashTypes": [],
  "severity": "low",
  "location_context": "clean area"
}

Rules:
- This is for environmental conservation purposes
- Count visible litter items carefully
- Be specific about types (plastic bottle, cigarette butt, food wrapper, paper, etc.)
- Severity: low (0-2 items), medium (3-5 items), high (6+ items)
- Return ONLY the JSON, no other text or explanations`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      })
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', response.status, errorData);
      throw new Error(`OpenAI API call failed: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log('OpenAI result:', result);
    
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error('Invalid OpenAI response structure');
    }

    const analysisText = result.choices[0].message.content.trim();
    console.log('Analysis text:', analysisText);
    
    // Try to parse JSON from the response
    try {
      const analysis = JSON.parse(analysisText);
      
      // Validate the analysis structure
      if (!analysis.description || !analysis.trashCount || !analysis.trashTypes || !analysis.severity) {
        throw new Error('Invalid analysis structure from OpenAI');
      }
      
      return {
        success: true,
        analysis: analysis
      };
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Text:', analysisText);
      
      // Handle case where AI refuses to analyze or gives non-JSON response
      if (analysisText.toLowerCase().includes("can't analyze") || 
          analysisText.toLowerCase().includes("cannot analyze") ||
          analysisText.toLowerCase().includes("sorry")) {
        
        return {
          success: false,
          analysis: {
            description: "Image submitted for manual review - AI analysis declined",
            trashCount: "1",
            trashTypes: ["requires manual assessment"],
            severity: "medium",
            location_context: "user-reported location"
          }
        };
      }
      
      // Fallback: try to extract data from text if JSON parsing fails
      const fallbackAnalysis = {
        description: analysisText.includes('trash') || analysisText.includes('litter') 
          ? analysisText.substring(0, 100) + '...' 
          : "Image analyzed - details pending manual review",
        trashCount: "1",
        trashTypes: ["unspecified item"],
        severity: "medium",
        location_context: "location captured with photo"
      };
      
      return {
        success: true,
        analysis: fallbackAnalysis
      };
    }
    
  } catch (error) {
    console.error('OpenAI Analysis Error:', error);
    return {
      success: false,
      analysis: {
        description: "Trash reported by user - AI analysis temporarily unavailable",
        trashCount: "1",
        trashTypes: ["unspecified trash"],
        severity: "medium",
        location_context: "user-reported location"
      }
    };
  }
};