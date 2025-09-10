import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION } from '../config/constants';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  variant = 'default',
  size = 'medium',
  disabled = false,
  required = false,
  style,
  inputStyle,
  labelStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedBorder = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedBorder, {
      toValue: isFocused ? 1 : 0,
      duration: ANIMATION.fast,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const getContainerStyle = () => {
    const baseStyles = [
      styles.container,
      styles[`container_${variant}`],
      styles[`container_${size}`]
    ];

    if (isFocused) {
      baseStyles.push(styles.containerFocused);
    }

    if (error) {
      baseStyles.push(styles.containerError);
    }

    if (disabled) {
      baseStyles.push(styles.containerDisabled);
    }

    return baseStyles;
  };

  const getInputStyle = () => {
    const baseStyles = [
      styles.input,
      styles[`input_${size}`]
    ];

    if (disabled) {
      baseStyles.push(styles.inputDisabled);
    }

    return baseStyles;
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return null;

    return (
      <MaterialIcons
        name={leftIcon}
        size={size === 'small' ? 18 : size === 'large' ? 24 : 20}
        color={
          error 
            ? COLORS.ERROR 
            : isFocused 
              ? COLORS.PRIMARY 
              : COLORS.TEXT_TERTIARY
        }
        style={styles.leftIcon}
      />
    );
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity onPress={togglePassword} style={styles.rightIconContainer}>
          <MaterialIcons
            name={showPassword ? 'visibility-off' : 'visibility'}
            size={size === 'small' ? 18 : size === 'large' ? 24 : 20}
            color={COLORS.TEXT_TERTIARY}
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      const IconContainer = onRightIconPress ? TouchableOpacity : View;
      return (
        <IconContainer onPress={onRightIconPress} style={styles.rightIconContainer}>
          <MaterialIcons
            name={rightIcon}
            size={size === 'small' ? 18 : size === 'large' ? 24 : 20}
            color={COLORS.TEXT_TERTIARY}
          />
        </IconContainer>
      );
    }

    return null;
  };

  const borderColor = animatedBorder.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? COLORS.ERROR : COLORS.BORDER,
      error ? COLORS.ERROR : COLORS.PRIMARY
    ],
  });

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <Animated.View style={[getContainerStyle(), { borderColor }]}>
        {renderLeftIcon()}
        
        <TextInput
          style={[getInputStyle(), inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.TEXT_TERTIARY}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          selectTextOnFocus={!disabled}
          {...props}
        />
        
        {renderRightIcon()}
      </Animated.View>
      
      {(error || helperText) && (
        <View style={styles.helperContainer}>
          {error && (
            <MaterialIcons
              name="error"
              size={14}
              color={COLORS.ERROR}
              style={styles.helperIcon}
            />
          )}
          <Text style={[
            styles.helperText,
            error ? styles.errorText : styles.normalHelperText
          ]}>
            {error || helperText}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  
  label: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.normal,
  },
  
  required: {
    color: COLORS.ERROR,
  },
  
  container: {
    flexDirection: 'row',
    alignItems: multiline ? 'flex-start' : 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.SURFACE_VARIANT,
  },
  
  // Variants
  container_default: {
    borderColor: COLORS.BORDER,
  },
  
  container_filled: {
    backgroundColor: COLORS.SURFACE_VARIANT,
    borderColor: 'transparent',
  },
  
  container_outlined: {
    backgroundColor: 'transparent',
    borderColor: COLORS.BORDER,
  },
  
  // Sizes
  container_small: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minHeight: 36,
  },
  
  container_medium: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 48,
  },
  
  container_large: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    minHeight: 56,
  },
  
  containerFocused: {
    borderWidth: 2,
    ...SHADOWS.xs,
  },
  
  containerError: {
    borderColor: COLORS.ERROR,
  },
  
  containerDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.SURFACE,
  },
  
  input: {
    flex: 1,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.regular,
  },
  
  input_small: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.normal * TYPOGRAPHY.FONT_SIZE.sm,
  },
  
  input_medium: {
    fontSize: TYPOGRAPHY.FONT_SIZE.base,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.normal * TYPOGRAPHY.FONT_SIZE.base,
  },
  
  input_large: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.normal * TYPOGRAPHY.FONT_SIZE.md,
  },
  
  inputDisabled: {
    color: COLORS.TEXT_DISABLED,
  },
  
  leftIcon: {
    marginRight: SPACING.sm,
  },
  
  rightIconContainer: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
  
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  
  helperIcon: {
    marginRight: SPACING.xs,
  },
  
  helperText: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZE.xs,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.normal * TYPOGRAPHY.FONT_SIZE.xs,
  },
  
  errorText: {
    color: COLORS.ERROR,
  },
  
  normalHelperText: {
    color: COLORS.TEXT_SECONDARY,
  },
});

export default Input;