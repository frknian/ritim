import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Plus, Edit2, Trash2 } from 'lucide-react-native';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { AppHeader } from '../components/common/AppHeader';
import { AppIcon } from '../components/common/AppIcon';
import { ProgressBar } from '../components/common/ProgressBar';
import { RADIUS, SPACING, TYPOGRAPHY, useThemeColors } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import { useAreaStore } from '../store/useAreaStore';
import { AreaWithStats } from '../types';
import { haptic } from '../utils/haptics';

interface AreasScreenProps {
  onOpenCreateArea: () => void;
  onEditArea: (area: AreaWithStats) => void;
  onBack?: () => void;
}

export const AreasScreen: React.FC<AreasScreenProps> = ({
  onOpenCreateArea,
  onEditArea,
  onBack,
}) => {
  const colors = useThemeColors();
  const { areas, deleteArea } = useAreaStore();

  const handleDeleteArea = (area: AreaWithStats) => {
    Alert.alert(
      area.name,
      STRINGS.areas.deleteAreaConfirm,
      [
        { text: STRINGS.common.cancel, style: 'cancel' },
        {
          text: STRINGS.common.delete,
          style: 'destructive',
          onPress: () => {
            haptic.warning();
            deleteArea(area.id);
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={STRINGS.areas.title}
        subtitle={STRINGS.areas.subtitle}
        showBack={!!onBack}
        onBack={onBack}
        rightAction={
          <TouchableOpacity
            onPress={() => {
              haptic.light();
              onOpenCreateArea();
            }}
            style={[styles.addButton, { backgroundColor: colors.blue }]}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {areas.length === 0 ? (
          <View
            style={[
              styles.emptyContainer,
              { backgroundColor: colors.surface1, borderColor: colors.borderSubtle },
            ]}
          >
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{STRINGS.areas.noAreasYet}</Text>
          </View>
        ) : (
          areas.map((area) => {
            const areaColor = area.color || colors.emerald;

            return (
              <View
                key={area.id}
                style={[
                  styles.areaCard,
                  { backgroundColor: colors.surface1, borderColor: colors.borderSubtle },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.leftInfo}>
                    <View style={[styles.iconBox, { backgroundColor: `${areaColor}20` }]}>
                      <AppIcon name={area.icon} size={22} color={areaColor} />
                    </View>
                    <View>
                      <Text style={[styles.areaName, { color: colors.textPrimary }]}>{area.name}</Text>
                      <Text style={[styles.habitCount, { color: colors.textSecondary }]}>
                        {STRINGS.areas.activeHabitsCount(area.activeHabitCount)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => onEditArea(area)}
                      style={[styles.iconAction, { backgroundColor: colors.surface2 }]}
                    >
                      <Edit2 size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteArea(area)}
                      style={[styles.iconAction, { backgroundColor: colors.surface2 }]}
                    >
                      <Trash2 size={16} color={colors.rose} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Haftalık Başarı Çubuğu */}
                <View style={styles.rateSection}>
                  <View style={styles.rateRow}>
                    <Text style={[styles.rateLabel, { color: colors.textMuted }]}>{STRINGS.areas.weeklyRate}</Text>
                    <Text style={[styles.rateValue, { color: areaColor }]}>
                      %{area.weeklyCompletionRate}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={area.weeklyCompletionRate}
                    color={areaColor}
                    height={6}
                  />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 90,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
  },
  areaCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
  },
  habitCount: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateSection: {
    marginTop: SPACING.xs,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  rateLabel: {
    ...TYPOGRAPHY.tiny,
  },
  rateValue: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
});
