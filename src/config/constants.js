import { Platform } from "react-native";
import { getAPIEndpoint, getUploadURL as getImageURL } from "./secrets";

// API Configuration
export const API_BASE_URL = getAPIEndpoint();

// Export image URL helper
export const getUploadURL = getImageURL;

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

// Minimalist Black, Gray & White Color Palette
export const COLORS = {
  // Primary colors - minimalist grayscale with neutral green accent
  PRIMARY: "#6B7280", // Neutral gray for most elements
  PRIMARY_DARK: "#4B5563", // Darker gray for pressed states
  PRIMARY_LIGHT: "#9CA3AF", // Lighter gray for highlights
  SECONDARY: "#6B7280", // Same neutral gray
  ACCENT: "#16A34A", // Neutral green - used VERY sparingly for most important actions
  
  // Status colors - muted and minimal
  SUCCESS: "#16A34A", // Neutral green (reserved for very important success states)
  WARNING: "#F59E0B", // Minimal amber for warnings
  ERROR: "#DC2626", // Red for errors only
  INFO: "#6B7280", // Gray instead of blue
  
  // Minimalist dark theme - pure blacks and grays
  BACKGROUND: "#000000", // Pure black
  BACKGROUND_SECONDARY: "#111111", // Very dark gray
  SURFACE: "#1A1A1A", // Dark gray for cards
  SURFACE_VARIANT: "#262626", // Slightly lighter for elevated surfaces
  SURFACE_HIGH: "#404040", // Medium gray for highest elevation
  
  // Text hierarchy - clean blacks, grays, whites
  TEXT_PRIMARY: "#FFFFFF", // Pure white
  TEXT_SECONDARY: "#D1D5DB", // Light gray
  TEXT_QUAD: "#aaaaaaff", // Medium gray
  TEXT_TERTIARY: "#9CA3AF", // Medium gray
  TEXT_DISABLED: "#6B7280", // Darker gray for disabled
  
  // Interactive elements - minimal
  DIVIDER: "#404040",
  BORDER: "#525252",
  BORDER_LIGHT: "#737373",
  
  // Minimalist gradients
  GRADIENT_PRIMARY: ["#6B7280", "#4B5563"],
  GRADIENT_SURFACE: ["#1A1A1A", "#262626"],
  GRADIENT_BACKGROUND: ["#000000", "#111111"],
  
  // Button colors - mostly grayscale with ONE green accent
  BUTTON: {
    // Primary button - neutral gray for most actions
    PRIMARY_BG: "#525252",
    PRIMARY_HOVER: "#404040",
    PRIMARY_TEXT: "#FFFFFF",
    
    // Secondary button - minimal outline
    SECONDARY_BG: "transparent",
    SECONDARY_BORDER: "#525252",
    SECONDARY_HOVER: "#262626",
    SECONDARY_TEXT: "#D1D5DB",
    
    // Success/Environmental button - ONLY for most important environmental actions
    SUCCESS_BG: "#272727", // Dark gray background
    SUCCESS_HOVER: "#1f1f1f",
    SUCCESS_TEXT: "#f1f1f1", // Light gray text
    
    // Danger button - minimal red
    DANGER_BG: "#DC2626",
    DANGER_HOVER: "#B91C1C",
    DANGER_TEXT: "#FFFFFF",
    
    // Ghost button - completely minimal
    GHOST_BG: "transparent",
    GHOST_HOVER: "#111111",
    GHOST_TEXT: "#9CA3AF",
  },
  
  // Special colors
  OVERLAY: "rgba(0, 0, 0, 0.8)",
  SHADOW: "rgba(0, 0, 0, 0.6)",
  
  // Legacy (for backwards compatibility)
  LIGHT: "#FFFFFF",
  DARK: "#000000",
};

// Professional Spacing System (8px base)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Typography Scale
export const TYPOGRAPHY = {
  // Font sizes
  FONT_SIZE: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    display: 48,
  },
  
  // Font weights
  FONT_WEIGHT: {
    thin: "200",
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
  
  // Line heights
  LINE_HEIGHT: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  // Letter spacing
  LETTER_SPACING: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
};

// Border Radius
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  round: 999,
};

// Shadow Presets
export const SHADOWS = {
  xs: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
};

// Animation Durations
export const ANIMATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
};
