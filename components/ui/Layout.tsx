import React from 'react';
import { View, ScrollView, ViewStyle, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../src/config/constants';

export interface LayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
  safeArea?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  style,
  scrollable = false,
  padding = 'medium',
  backgroundColor = COLORS.BACKGROUND,
  safeArea = true,
}) => {
  const insets = useSafeAreaInsets();

  const getLayoutStyles = (): ViewStyle => {
    const paddingStyles = {
      none: {},
      small: { padding: SPACING.md },
      medium: { padding: SPACING.lg },
      large: { padding: SPACING.xl },
    };

    const baseStyle: ViewStyle = {
      flex: 1,
      backgroundColor,
      ...paddingStyles[padding],
      ...(safeArea && {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }),
    };

    return baseStyle;
  };

  const Container = scrollable ? ScrollView : View;
  const containerProps = scrollable 
    ? {
        contentContainerStyle: { flexGrow: 1 },
        showsVerticalScrollIndicator: false,
        keyboardShouldPersistTaps: 'handled' as const,
      }
    : {};

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.BACKGROUND}
        translucent
      />
      <Container
        style={[getLayoutStyles(), style]}
        {...containerProps}
      >
        {children}
      </Container>
    </>
  );
};