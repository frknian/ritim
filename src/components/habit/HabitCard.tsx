import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Plus, Minus, Flame, ShieldAlert, Play } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, useThemeColors } from '../../constants/theme';
import { HabitWithTodayEntry } from '../../types';
import { AppIcon } from '../common/AppIcon';
import { ProgressBar } from '../common/ProgressBar';
import { AppBadge } from '../common/AppBadge';
import { STRINGS } from '../../constants/strings';
import { haptic } from '../../utils/haptics';

interface HabitCardProps {
  habit: HabitWithTodayEntry;
  compact?: boolean;
  onPress: () => void;
  onToggleComplete: () => void;
  onIncrement: (amount: number) => void;
  onLogRelapse: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  compact = false,
  onPress,
  onToggleComplete,
  onIncrement,
  onLogRelapse,
}) => {
  const colors = useThemeColors();
  const isQuit = habit.type === 'quit';
  const isCompleted = habit.isCompletedToday;
  const habitColor = habit.color || colors.blue;

  // Yüzdelik ilerleme (Sayısal veya Süre modları için)
  const progress = habit.targetValue > 0
    ? Math.min(100, Math.round((habit.currentValue / habit.targetValue) * 100))
    : isCompleted ? 100 : 0;

  return (
    <TouchableOpacity
      onPress={() => {
        haptic.light();
        onPress();
      }}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: isCompleted ? `${colors.emerald}15` : colors.surface1,
          borderColor: isCompleted ? colors.emerald : colors.borderSubtle,
        },
        compact ? styles.cardCompact : styles.cardStandard,
      ]}
    >
      {/* Sol Vurgu Şeridi */}
      <View style={[styles.accentStrip, { backgroundColor: habitColor }]} />

      <View style={styles.mainContent}>
        {/* Üst Kısım: İkon, Başlık, Alan, Seri */}
        <View style={styles.headerRow}>
          <View style={[styles.iconContainer, { backgroundColor: `${habitColor}18` }]}>
            <AppIcon name={habit.icon} size={20} color={habitColor} />
          </View>

          <View style={styles.titleArea}>
            <View style={styles.nameRow}>
              <Text style={[styles.habitName, { color: colors.textPrimary }]} numberOfLines={1}>
                {habit.name}
              </Text>
              {isQuit && (
                <View style={styles.quitBadge}>
                  <ShieldAlert size={12} color={colors.rose} />
                  <Text style={[styles.quitBadgeText, { color: colors.rose }]}>{STRINGS.habitForm.typeQuit}</Text>
                </View>
              )}
            </View>

            <View style={styles.metaRow}>
              {habit.areaName && (
                <Text style={[styles.areaText, { color: colors.textSecondary }]}>
                  {habit.areaName}
                </Text>
              )}
              {habit.currentStreak > 0 && (
                <View style={styles.streakContainer}>
                  <Flame size={13} color={colors.amber} />
                  <Text style={[styles.streakText, { color: colors.amber }]}>
                    {habit.currentStreak} {STRINGS.common.dayCount(habit.currentStreak)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Orta Kısım: Sayısal veya Süre İlerleme Çubuğu */}
        {!compact && (habit.trackingMode === 'numeric' || habit.trackingMode === 'duration') && (
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {habit.currentValue} / {habit.targetValue} {habit.unit || ''}
              </Text>
              <Text style={[styles.progressPercentage, { color: colors.textPrimary }]}>%{progress}</Text>
            </View>
            <ProgressBar progress={progress} color={habitColor} height={6} />
          </View>
        )}

        {/* Alt Kısım / Aksiyon Butonları */}
        <View style={styles.actionRow}>
          {isQuit ? (
            // Bırakılan Alışkanlık Aksiyonu
            <View style={styles.quitActions}>
              <View style={styles.cleanStatus}>
                <View style={[styles.statusDot, { backgroundColor: colors.emerald }]} />
                <Text style={[styles.cleanStatusText, { color: colors.textSecondary }]}>{STRINGS.today.cleanDayActive}</Text>
              </View>

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onLogRelapse();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.relapseButton}
              >
                <Text style={[styles.relapseButtonText, { color: colors.rose }]}>{STRINGS.today.quickRelapse}</Text>
              </TouchableOpacity>
            </View>
          ) : habit.trackingMode === 'boolean' ? (
            // Mantıksal (Boolean) Tamamlama Aksiyonu
            <View style={styles.booleanAction}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleComplete();
                }}
                activeOpacity={0.7}
                style={[
                  styles.checkCircle,
                  { backgroundColor: colors.surface2, borderColor: colors.surfaceElevated },
                  isCompleted && {
                    backgroundColor: colors.emerald,
                    borderColor: colors.emerald,
                  },
                ]}
              >
                {isCompleted && <Check size={20} color="#FFFFFF" strokeWidth={3} />}
              </TouchableOpacity>
            </View>
          ) : habit.trackingMode === 'numeric' ? (
            // Sayısal Sayaç Aksiyonları (- ve +)
            <View style={styles.counterActions}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onIncrement(-1);
                }}
                disabled={habit.currentValue <= 0}
                style={[
                  styles.counterButton,
                  { backgroundColor: colors.surface2 },
                  habit.currentValue <= 0 && styles.counterButtonDisabled,
                ]}
              >
                <Minus size={16} color={colors.textPrimary} />
              </TouchableOpacity>

              <Text style={[styles.counterValue, { color: colors.textPrimary }]}>
                {habit.currentValue}
              </Text>

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onIncrement(1);
                }}
                style={[styles.counterButton, { backgroundColor: habitColor }]}
              >
                <Plus size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            // Süre Hedefi Aksiyonu
            <View style={styles.durationActions}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onIncrement(15);
                }}
                style={[styles.quickDurationButton, { backgroundColor: colors.surface2, borderColor: `${habitColor}60` }]}
              >
                <Plus size={14} color={habitColor} />
                <Text style={[styles.quickDurationText, { color: habitColor }]}>+15 dk</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleComplete();
                }}
                style={[
                  styles.checkCircle,
                  { backgroundColor: colors.surface2, borderColor: colors.surfaceElevated },
                  isCompleted && {
                    backgroundColor: colors.emerald,
                    borderColor: colors.emerald,
                  },
                ]}
              >
                {isCompleted && <Check size={20} color="#FFFFFF" strokeWidth={3} />}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface1,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardStandard: {
    padding: SPACING.lg,
  },
  cardCompact: {
    padding: SPACING.md,
  },
  cardCompleted: {
    borderColor: 'rgba(16, 185, 129, 0.35)',
    backgroundColor: '#0F1822',
  },
  accentStrip: {
    width: 4,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  mainContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  titleArea: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitName: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textPrimary,
    flex: 1,
  },
  quitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginLeft: 6,
  },
  quitBadgeText: {
    fontSize: 10,
    color: COLORS.rose,
    fontWeight: '600',
    marginLeft: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 10,
  },
  areaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  streakText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.amber,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: SPACING.md,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  progressPercentage: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  actionRow: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  booleanAction: {
    alignItems: 'flex-end',
  },
  checkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface2,
  },
  counterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonDisabled: {
    opacity: 0.35,
  },
  counterValue: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textPrimary,
    minWidth: 28,
    textAlign: 'center',
  },
  durationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickDurationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    backgroundColor: COLORS.surface2,
    gap: 4,
  },
  quickDurationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quitActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  cleanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cleanStatusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  relapseButton: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  relapseButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.rose,
  },
});
