import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION } from '../config/constants';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props
}) => {
  const animatedScale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.96,
      duration: ANIMATION.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      duration: ANIMATION.fast,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    const baseStyles = [styles.button, styles[`button_${variant}`], styles[`button_${size}`]];
    
    if (disabled || loading) {
      baseStyles.push(styles.buttonDisabled);
    }
    
    return baseStyles;
  };

  const getTextStyle = () => {
    const baseStyles = [styles.text, styles[`text_${variant}`], styles[`text_${size}`]];
    
    if (disabled || loading) {
      baseStyles.push(styles.textDisabled);
    }
    
    return baseStyles;
  };

  const renderIcon = () => {
    if (!icon || loading) return null;
    
    const iconColor = variant === 'primary' || variant === 'danger' 
      ? '#FFFFFF' 
      : variant === 'secondary' 
        ? COLORS.PRIMARY 
        : COLORS.TEXT_PRIMARY;
    
    return (
      <MaterialIcons
        name={icon}
        size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
        color={iconColor}
        style={[
          styles.icon,
          iconPosition === 'right' ? styles.iconRight : styles.iconLeft
        ]}
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : COLORS.PRIMARY}
        />
      );
    }

    return (
      <>
        {iconPosition === 'left' && renderIcon()}
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        {iconPosition === 'right' && renderIcon()}
      </>
    );
  };

  return (
    <Animated.View style={[{ transform: [{ scale: animatedScale }] }, style]}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        {...props}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  
  // Variants
  button_primary: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
    ...SHADOWS.sm,
  },
  
  button_secondary: {
    backgroundColor: 'transparent',
    borderColor: COLORS.PRIMARY,
  },
  
  button_outline: {
    backgroundColor: 'transparent',
    borderColor: COLORS.BORDER,
  },
  
  button_ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  
  button_danger: {
    backgroundColor: COLORS.ERROR,
    borderColor: COLORS.ERROR,
    ...SHADOWS.sm,
  },
  
  button_success: {
    backgroundColor: COLORS.SUCCESS,
    borderColor: COLORS.SUCCESS,
    ...SHADOWS.sm,
  },
  
  // Sizes
  button_small: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minHeight: 32,
  },
  
  button_medium: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 44,
  },
  
  button_large: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 56,
  },
  
  buttonDisabled: {
    opacity: 0.6,
  },
  
  // Text styles
  text: {
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.wide,
  },
  
  text_primary: {
    color: '#FFFFFF',
  },
  
  text_secondary: {
    color: COLORS.PRIMARY,
  },
  
  text_outline: {
    color: COLORS.TEXT_PRIMARY,
  },
  
  text_ghost: {
    color: COLORS.TEXT_PRIMARY,
  },
  
  text_danger: {
    color: '#FFFFFF',
  },
  
  text_success: {
    color: '#FFFFFF',
  },
  
  text_small: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
  },
  
  text_medium: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
  },
  
  text_large: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
  },
  
  textDisabled: {
    opacity: 0.7,
  },
  
  // Icon styles
  icon: {
    alignSelf: 'center',
  },
  
  iconLeft: {
    marginRight: SPACING.xs,
  },
  
  iconRight: {
    marginLeft: SPACING.xs,
  },
});

export default Button;