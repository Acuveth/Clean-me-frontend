/**
 * Minimalist Black, Gray & White Theme for Trash Clean App
 * Pure minimalism with extremely sparing use of neutral green for most important actions only
 */

const tintColorLight = '#6B7280'; // Neutral gray for light mode
const tintColorDark = '#16A34A'; // Neutral green - ONLY for most important elements

export const Colors = {
  light: {
    text: '#111111',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF', // Pure white text
    background: '#000000', // Pure black background
    tint: tintColorDark, // Neutral green - reserved for most important elements
    icon: '#9CA3AF', // Medium gray for icons
    tabIconDefault: '#6B7280', // Darker gray for inactive tabs
    tabIconSelected: tintColorDark, // Green only for selected/important tabs
  },
};
