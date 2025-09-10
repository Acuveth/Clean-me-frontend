import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  TextInputProps 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../src/config/constants';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  iconPosition = 'left',
  variant = 'outlined',
  size = 'medium',
  containerStyle,
  inputStyle,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: RADIUS.md,
      borderWidth: variant === 'outlined' ? 2 : 0,
      borderColor: error 
        ? COLORS.ERROR 
        : isFocused 
          ? COLORS.SUCCESS 
          : COLORS.BORDER,
      backgroundColor: variant === 'filled' ? COLORS.SURFACE_VARIANT : 'transparent',
      ...SHADOWS.xs,
    };

    const sizeStyles = {
      small: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.sm,
        minHeight: 44,
      },
      medium: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        minHeight: 52,
      },
      large: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        minHeight: 60,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
    };
  };

  const getInputStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      fontSize: TYPOGRAPHY.FONT_SIZE.base,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.regular,
      color: COLORS.TEXT_PRIMARY,
      letterSpacing: TYPOGRAPHY.LETTER_SPACING.normal,
    };

    return baseStyle;
  };

  const getIconSize = (): number => {
    const iconSizes = {
      small: 18,
      medium: 20,
      large: 24,
    };
    return iconSizes[size];
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <MaterialIcons
        name={icon}
        size={getIconSize()}
        color={error ? COLORS.ERROR : isFocused ? COLORS.SUCCESS : COLORS.TEXT_TERTIARY}
        style={[
          iconPosition === 'left' ? styles.iconLeft : styles.iconRight
        ]}
      />
    );
  };

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[getContainerStyles(), error && styles.errorBorder]}>
        {iconPosition === 'left' && renderIcon()}
        
        <TextInput
          style={[getInputStyles(), inputStyle]}
          placeholderTextColor={COLORS.TEXT_TERTIARY}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
        
        {iconPosition === 'right' && renderIcon()}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.xs,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
  errorBorder: {
    borderColor: COLORS.ERROR,
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xs,
    color: COLORS.ERROR,
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },
});