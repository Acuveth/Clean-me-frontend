import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/config/constants';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
}) => {
  const getCardStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
    };

    const paddingStyles = {
      none: {},
      small: { padding: SPACING.md },
      medium: { padding: SPACING.lg },
      large: { padding: SPACING.xl },
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: COLORS.SURFACE,
        ...SHADOWS.xs,
      },
      elevated: {
        backgroundColor: COLORS.SURFACE,
        ...SHADOWS.lg,
      },
      outlined: {
        backgroundColor: COLORS.SURFACE,
        borderWidth: 1,
        borderColor: COLORS.BORDER_LIGHT,
      },
      glass: {
        backgroundColor: COLORS.SURFACE + '80', // 50% opacity
        borderWidth: 1,
        borderColor: COLORS.BORDER_LIGHT + '40',
        backdropFilter: 'blur(10px)',
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...variantStyles[variant],
    };
  };

  return (
    <View style={[getCardStyles(), style]}>
      {children}
    </View>
  );
};