import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, useThemeColors } from '../../constants/theme';
import { haptic } from '../../utils/haptics';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  activeOpacity?: number;
  elevated?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  style,
  onPress,
  activeOpacity = 0.75,
  elevated = false,
}) => {
  const colors = useThemeColors();
  const containerStyle = [
    styles.card,
    {
      borderColor: colors.borderSubtle,
      backgroundColor: elevated ? colors.surface2 : colors.surface1,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={() => {
          haptic.light();
          onPress();
        }}
        activeOpacity={activeOpacity}
        style={containerStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  standard: {
    backgroundColor: COLORS.surface1,
  },
  elevated: {
    backgroundColor: COLORS.surface2,
  },
});
