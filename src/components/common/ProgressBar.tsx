import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, useThemeColors } from '../../constants/theme';

interface ProgressBarProps {
  progress: number; // 0 ile 100 arasında
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = COLORS.emerald,
  height = 8,
  style,
}) => {
  const colors = useThemeColors();
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: colors.surface2 }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: COLORS.surface2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
