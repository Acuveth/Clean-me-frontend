import { Platform } from "react-native";

// API Configuration
export const API_BASE_URL = __DEV__
  ? Platform.OS === "android"
    ? "http://10.0.2.2:3000/api" // Android emulator
    : "http://localhost:3000/api" // iOS simulator and web
  : "https://your-production-api.com/api";

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

// Colors
export const COLORS = {
  PRIMARY: "#4CAF50",
  SECONDARY: "#2196F3",
  SUCCESS: "#4CAF50",
  WARNING: "#FF9800",
  ERROR: "#F44336",
  INFO: "#2196F3",
  LIGHT: "#F8F9FA",
  DARK: "#212529",
};
