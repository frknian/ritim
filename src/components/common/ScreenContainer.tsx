import React from 'react';
import { StyleSheet, StatusBar, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../constants/theme';
import { useSettingsStore } from '../../store/useSettingsStore';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  edges = ['top', 'left', 'right'],
}) => {
  const colors = useThemeColors();
  const theme = useSettingsStore((s) => s.settings.theme);

  return (
    <SafeAreaView edges={edges} style={[styles.container, { backgroundColor: colors.bgPrimary }, style]}>
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.bgPrimary}
        translucent={false}
      />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
