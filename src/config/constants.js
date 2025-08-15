import { Platform } from "react-native";
import { getAPIEndpoint } from "./secrets";

// API Configuration
export const API_BASE_URL = getAPIEndpoint();

// App Configuration
export const APP_NAME = "Trash Clean";
export const APP_VERSION = "1.0.0";

// Location Configuration
export const LOCATION_ACCURACY = {
  LOW: 1,
  BALANCED: 2,
  HIGH: 3,
  BEST: 4,
};

// Points System
export const POINTS_SYSTEM = {
  SMALL_TRASH: 10,
  MEDIUM_TRASH: 20,
  LARGE_TRASH: 30,
  VERY_LARGE_TRASH: 50,
  HAZARDOUS_TRASH: 100,
};

// Map Configuration
export const MAP_DEFAULTS = {
  LATITUDE_DELTA: 0.01,
  LONGITUDE_DELTA: 0.01,
  NEARBY_RADIUS: 5000, // 5km in meters
};

// Image Configuration
export const IMAGE_CONFIG = {
  QUALITY: 0.8,
  MAX_WIDTH: 2000,
  MAX_HEIGHT: 2000,
  ALLOW_EDITING: true,
};

// Dark Mode Colors
export const COLORS = {
  // Primary colors
  PRIMARY: "#00E676", // Bright green for dark mode
  SECONDARY: "#1E88E5", // Blue
  ACCENT: "#FF6B35", // Orange accent
  
  // Status colors
  SUCCESS: "#00E676",
  WARNING: "#FFC107",
  ERROR: "#FF5252",
  INFO: "#29B6F6",
  
  // Dark theme colors
  BACKGROUND: "#121212", // Main background
  SURFACE: "#1E1E1E", // Cards, components
  SURFACE_VARIANT: "#2D2D2D", // Elevated surfaces
  
  // Text colors
  TEXT_PRIMARY: "#FFFFFF", // Main text
  TEXT_SECONDARY: "#B0B0B0", // Secondary text
  TEXT_DISABLED: "#6D6D6D", // Disabled text
  
  // Other colors
  DIVIDER: "#2D2D2D",
  BORDER: "#3D3D3D",
  
  // Gradients
  GRADIENT_START: "#1A1A1A",
  GRADIENT_END: "#2D2D2D",
  
  // Legacy (for backwards compatibility)
  LIGHT: "#F8F9FA",
  DARK: "#121212",
};
