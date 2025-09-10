import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, ANIMATION } from '../config/constants';

const Card = ({
  children,
  title,
  subtitle,
  icon,
  onPress,
  variant = 'default',
  padding = 'medium',
  style,
  headerStyle,
  contentStyle,
  ...props
}) => {
  const animatedScale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(animatedScale, {
        toValue: 0.98,
        duration: ANIMATION.fast,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(animatedScale, {
        toValue: 1,
        duration: ANIMATION.fast,
        useNativeDriver: true,
      }).start();
    }
  };

  const getCardStyle = () => {
    const baseStyles = [
      styles.card,
      styles[`card_${variant}`],
      styles[`card_${padding}`],
    ];
    
    return baseStyles;
  };

  const renderHeader = () => {
    if (!title && !subtitle && !icon) return null;

    return (
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerContent}>
          {icon && (
            <MaterialIcons
              name={icon}
              size={24}
              color={COLORS.PRIMARY}
              style={styles.headerIcon}
            />
          )}
          <View style={styles.headerText}>
            {title && (
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <Animated.View style={[{ transform: [{ scale: animatedScale }] }, style]}>
      <CardContainer
        style={getCardStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={onPress ? 0.95 : 1}
        {...props}
      >
        {renderHeader()}
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      </CardContainer>
    </Animated.View>
  );
};

const StatCard = ({ title, value, icon, trend, trendValue, color = COLORS.PRIMARY }) => {
  return (
    <Card variant="elevated" padding="medium">
      <View style={styles.statContainer}>
        <View style={styles.statHeader}>
          <MaterialIcons name={icon} size={20} color={color} />
          {trend && (
            <View style={styles.trendContainer}>
              <MaterialIcons
                name={trend === 'up' ? 'trending-up' : 'trending-down'}
                size={16}
                color={trend === 'up' ? COLORS.SUCCESS : COLORS.ERROR}
              />
              <Text style={[
                styles.trendText,
                { color: trend === 'up' ? COLORS.SUCCESS : COLORS.ERROR }
              ]}>
                {trendValue}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </Card>
  );
};

const ActionCard = ({ title, description, icon, onPress, variant = 'primary' }) => {
  return (
    <Card onPress={onPress} variant="elevated" padding="medium">
      <View style={styles.actionContainer}>
        <View style={[
          styles.actionIcon,
          { backgroundColor: variant === 'primary' ? COLORS.PRIMARY : COLORS.SECONDARY }
        ]}>
          <MaterialIcons
            name={icon}
            size={24}
            color="#FFFFFF"
          />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionDescription}>{description}</Text>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={COLORS.TEXT_TERTIARY}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  
  // Variants
  card_default: {
    backgroundColor: COLORS.SURFACE,
    borderColor: COLORS.BORDER,
  },
  
  card_elevated: {
    backgroundColor: COLORS.SURFACE,
    borderColor: COLORS.BORDER,
    ...SHADOWS.md,
  },
  
  card_outlined: {
    backgroundColor: 'transparent',
    borderColor: COLORS.BORDER,
    borderWidth: 1,
  },
  
  card_filled: {
    backgroundColor: COLORS.SURFACE_VARIANT,
    borderColor: 'transparent',
  },
  
  // Padding
  card_small: {
    padding: SPACING.sm,
  },
  
  card_medium: {
    padding: SPACING.md,
  },
  
  card_large: {
    padding: SPACING.lg,
  },
  
  header: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.md,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerIcon: {
    marginRight: SPACING.sm,
  },
  
  headerText: {
    flex: 1,
  },
  
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.normal,
  },
  
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.xs,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.normal * TYPOGRAPHY.FONT_SIZE.sm,
  },
  
  content: {
    flex: 1,
  },
  
  // StatCard styles
  statContainer: {
    alignItems: 'center',
  },
  
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.sm,
  },
  
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  trendText: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xs,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
    marginLeft: SPACING.xs,
  },
  
  statValue: {
    fontSize: TYPOGRAPHY.FONT_SIZE.xxl,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.bold,
    marginBottom: SPACING.xs,
    letterSpacing: TYPOGRAPHY.LETTER_SPACING.tight,
  },
  
  statTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.medium,
  },
  
  // ActionCard styles
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  
  actionContent: {
    flex: 1,
  },
  
  actionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZE.md,
    fontWeight: TYPOGRAPHY.FONT_WEIGHT.semibold,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  
  actionDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHT.normal * TYPOGRAPHY.FONT_SIZE.sm,
  },
});

Card.Stat = StatCard;
Card.Action = ActionCard;

export default Card;