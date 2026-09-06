import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Flame, ShieldAlert } from 'lucide-react-native';
import { HabitWithTodayEntry, FrequencyType, FrequencyConfig } from '../../types';
import { AppIcon } from '../common/AppIcon';
import { useThemeColors } from '../../constants/theme';
import { formatISODate, getMonthMatrix } from '../../utils/date';
import { haptic } from '../../utils/haptics';

interface GridHabitCardProps {
  habit: HabitWithTodayEntry;
  cardWidth: number;
  monthEntries?: Record<string, boolean>;
  onPress: () => void;
  onToggleDay: (dateStr: string) => void;
}

const WEEK_LETTERS = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];

function formatHabitFrequency(type: FrequencyType, config?: FrequencyConfig): string {
  switch (type) {
    case 'daily':
      return 'Her gün';
    case 'weekdays':
      return 'Hafta içi';
    case 'weekends':
      return 'Hafta sonu';
    case 'specific_days': {
      const count = config?.days?.length || 0;
      return count > 0 ? `Haftada ${count} gün` : 'Belirli günler';
    }
    case 'x_per_week':
      return `Haftada ${config?.target_times || 3} gün`;
    case 'x_per_month':
      return `Ayda ${config?.target_times || 10} gün`;
    case 'interval':
      return `${config?.interval_days || 2} günde bir`;
    default:
      return 'Her gün';
  }
}

export const GridHabitCard: React.FC<GridHabitCardProps> = ({
  habit,
  cardWidth,
  monthEntries = {},
  onPress,
  onToggleDay,
}) => {
  const colors = useThemeColors();
  const habitColor = habit.color || colors.blue;
  const isQuit = habit.type === 'quit';

  const todayISO = formatISODate();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  // O ayın 7 sütunlu takvim hücreleri
  const matrix = useMemo(() => {
    return getMonthMatrix(currentYear, currentMonthIndex);
  }, [currentYear, currentMonthIndex]);

  const frequencyLabel = useMemo(() => {
    return formatHabitFrequency(habit.frequencyType, habit.frequencyConfig);
  }, [habit.frequencyType, habit.frequencyConfig]);

  // Hücre boyutunu kart genişliğine göre dinamik hesapla
  // cardWidth - 20 (padding) -> 7 sütuna böl
  const cellColWidth = Math.floor((cardWidth - 20) / 7);
  const cellInnerSize = Math.max(16, Math.min(21, cellColWidth - 3));

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: colors.surface1,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      {/* 1. Üst Başlık ve Sıklık / Seri */}
      <View style={styles.topRow}>
        <View style={styles.freqLeft}>
          <View style={[styles.accentStrip, { backgroundColor: habitColor }]} />
          <Text style={[styles.freqText, { color: colors.textMuted }]} numberOfLines={1}>
            {frequencyLabel}
          </Text>
        </View>

        {habit.currentStreak > 0 && (
          <View style={styles.streakBadge}>
            <Flame size={12} color={colors.amber} />
            <Text style={[styles.streakText, { color: colors.amber }]}>
              {habit.currentStreak}
            </Text>
          </View>
        )}
      </View>

      {/* 2. Alışkanlık İkonu ve Adı */}
      <View style={styles.habitHeader}>
        <View style={[styles.iconCircle, { backgroundColor: `${habitColor}16` }]}>
          <AppIcon name={habit.icon} size={14} color={habitColor} />
        </View>
        <Text
          style={[styles.habitTitle, { color: colors.textPrimary }]}
          numberOfLines={2}
        >
          {habit.name}
        </Text>
        {isQuit && (
          <ShieldAlert size={12} color={colors.rose} style={{ marginLeft: 3 }} />
        )}
      </View>

      {/* 3. Hafta Günleri Başlığı (P S Ç P C C P) */}
      <View style={styles.calendarWeekRow}>
        {WEEK_LETTERS.map((letter, idx) => (
          <View key={`wl-${idx}`} style={{ width: cellColWidth, alignItems: 'center' }}>
            <Text style={[styles.weekLetter, { color: colors.textMuted }]}>
              {letter}
            </Text>
          </View>
        ))}
      </View>

      {/* 4. Mini Takvim Hücreleri (7 Sütunlu Grid) */}
      <View style={styles.gridContainer}>
        {matrix.map((cell, index) => {
          if (!cell.dayNumber || !cell.dateStr) {
            return (
              <View
                key={`empty-${index}`}
                style={[styles.cellSlot, { width: cellColWidth, height: cellInnerSize + 4 }]}
              />
            );
          }

          const dateStr = cell.dateStr;
          const isCompleted = Boolean(monthEntries[dateStr]);
          const isToday = dateStr === todayISO;
          const isFuture = dateStr > todayISO;

          return (
            <View
              key={dateStr}
              style={[styles.cellSlot, { width: cellColWidth, height: cellInnerSize + 4 }]}
            >
              <TouchableOpacity
                activeOpacity={0.65}
                hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
                onPress={() => onToggleDay(dateStr)}
                style={[
                  styles.dayBox,
                  {
                    width: cellInnerSize,
                    height: cellInnerSize,
                    borderRadius: 4,
                    backgroundColor: isCompleted ? habitColor : colors.surface2,
                  },
                  isToday && [
                    styles.dayBoxToday,
                    { borderColor: habitColor },
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.dayNumberText,
                    {
                      fontSize: cellInnerSize > 18 ? 9.5 : 8.5,
                      color: isCompleted
                        ? '#FFFFFF'
                        : isToday
                        ? habitColor
                        : isFuture
                        ? colors.textMuted
                        : colors.textSecondary,
                      fontWeight: isCompleted || isToday ? '700' : '500',
                      opacity: isFuture && !isCompleted ? 0.45 : 1,
                    },
                  ]}
                >
                  {cell.dayNumber}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  freqLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accentStrip: {
    width: 3.5,
    height: 11,
    borderRadius: 2,
    marginRight: 5,
  },
  freqText: {
    fontSize: 11,
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 28,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  habitTitle: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    flex: 1,
  },
  calendarWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 4,
  },
  weekLetter: {
    fontSize: 8.5,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  cellSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBoxToday: {
    borderWidth: 1.5,
  },
  dayNumberText: {
    textAlign: 'center',
  },
});
