import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, Calendar, BarChart3, Layers } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, useThemeColors } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { haptic } from '../../utils/haptics';

export type TabKey = 'today' | 'calendar' | 'stats' | 'areas';

interface TabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ size: number; color: string }> }[] = [
    { key: 'today', label: STRINGS.tabs.today, icon: CheckCircle2 },
    { key: 'calendar', label: STRINGS.tabs.calendar, icon: Calendar },
    { key: 'stats', label: STRINGS.tabs.statistics, icon: BarChart3 },
    { key: 'areas', label: STRINGS.tabs.areas, icon: Layers },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface1,
          borderTopColor: colors.borderSubtle,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const IconComponent = tab.icon;
        const activeColor = colors.blue;
        const inactiveColor = colors.textMuted;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => {
              if (!isActive) {
                haptic.selection();
                onTabChange(tab.key);
              }
            }}
            activeOpacity={0.75}
            style={styles.tabButton}
          >
            <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
              <IconComponent
                size={22}
                color={isActive ? activeColor : inactiveColor}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? activeColor : inactiveColor },
                isActive && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface1,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  tabLabel: {
    ...TYPOGRAPHY.tiny,
    marginTop: 2,
    fontWeight: '500',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
});
