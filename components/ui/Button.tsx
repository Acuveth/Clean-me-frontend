import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../src/config/constants';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'floating';
export type ButtonSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  elevated?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
  elevated = false,
}) => {
  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: variant === 'floating' ? RADIUS.round : RADIUS.xl,
      overflow: 'hidden',
      ...(elevated && SHADOWS.lg),
    };

    // Size-based styles
    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      small: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        minHeight: 40,
      },
      medium: {
        paddingVertical: SPACING.md + 2,
        paddingHorizontal: SPACING.lg,
        minHeight: 52,
      },
      large: {
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        minHeight: 60,
      },
      xlarge: {
        paddingVertical: SPACING.xl,
        paddingHorizontal: SPACING.xxl,
        minHeight: 68,
      },
    };

    // Variant-based styles
    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: COLORS.BUTTON.PRIMARY_BG,
        ...SHADOWS.sm,
      },
      secondary: {
        backgroundColor: COLORS.SURFACE_VARIANT,
        borderWidth: 2,
        borderColor: COLORS.BORDER_LIGHT,
        ...SHADOWS.xs,
      },
      success: {
        backgroundColor: COLORS.BUTTON.SUCCESS_BG,
        ...SHADOWS.md,
      },
      danger: {
        backgroundColor: COLORS.BUTTON.DANGER_BG,
        ...SHADOWS.sm,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.BORDER,
      },
      floating: {
        backgroundColor: COLORS.BUTTON.SUCCESS_BG,
        width: 64,
        height: 64,
        borderRadius: RADIUS.round,
        ...SHADOWS.xl,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled || loading ? 0.5 : 1,
      ...(fullWidth && { width: '100%' }),
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
      letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
      textAlign: 'center',
    };

    // Size-based text styles
    const sizeStyles: Record<ButtonSize, TextStyle> = {
      small: {
        fontSize: TYPOGRAPHY.FONT_SIZE.sm,
      },
      medium: {
        fontSize: TYPOGRAPHY.FONT_SIZE.base,
      },
      large: {
        fontSize: TYPOGRAPHY.FONT_SIZE.md,
      },
      xlarge: {
        fontSize: TYPOGRAPHY.FONT_SIZE.lg,
      },
    };

    // Variant-based text styles
    const variantStyles: Record<ButtonVariant, TextStyle> = {
      primary: {
        color: COLORS.BUTTON.PRIMARY_TEXT,
      },
      secondary: {
        color: COLORS.TEXT_PRIMARY,
      },
      success: {
        color: COLORS.BUTTON.SUCCESS_TEXT,
      },
      danger: {
        color: COLORS.BUTTON.DANGER_TEXT,
      },
      ghost: {
        color: COLORS.TEXT_SECONDARY,
      },
      floating: {
        color: COLORS.BUTTON.SUCCESS_TEXT,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getIconSize = (): number => {
    // Special case for floating buttons - make icons larger
    if (variant === 'floating') {
      return 28;
    }
    
    const iconSizes: Record<ButtonSize, number> = {
      small: 16,
      medium: 20,
      large: 24,
      xlarge: 28,
    };
    return iconSizes[size];
  };

  const getIconColor = (): string => {
    const iconColors: Record<ButtonVariant, string> = {
      primary: COLORS.BUTTON.PRIMARY_TEXT,
      secondary: COLORS.TEXT_PRIMARY,
      success: COLORS.BUTTON.SUCCESS_TEXT,
      danger: COLORS.BUTTON.DANGER_TEXT,
      ghost: COLORS.TEXT_SECONDARY,
      floating: COLORS.TEXT_PRIMARY, // Use white text for floating buttons
    };
    return iconColors[variant];
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getIconColor()} size="small" />;
    }

    // For floating buttons, only show icon
    if (variant === 'floating') {
      return icon ? (
        <MaterialIcons
          name={icon}
          size={getIconSize()}
          color={getIconColor()}
        />
      ) : null;
    }

    const iconElement = icon ? (
      <MaterialIcons
        name={icon}
        size={getIconSize()}
        color={getIconColor()}
        style={[
          iconPosition === 'left' ? { marginRight: SPACING.sm } : { marginLeft: SPACING.sm }
        ]}
      />
    ) : null;

    const textElement = title ? (
      <Text style={[getTextStyles(), textStyle]}>
        {title}
      </Text>
    ) : null;

    return iconPosition === 'left' ? (
      <>
        {iconElement}
        {textElement}
      </>
    ) : (
      <>
        {textElement}
        {iconElement}
      </>
    );
  };

  // For success buttons, use a subtle gradient effect
  if (variant === 'success' || variant === 'floating') {
    return (
      <TouchableOpacity
        style={[getButtonStyles(), style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <View style={styles.gradientOverlay}>
          {renderContent()}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradientOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    paddingHorizontal: SPACING.md,
  },
});