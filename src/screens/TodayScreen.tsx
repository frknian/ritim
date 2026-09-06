import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Settings, Plus, Sparkles, RotateCcw } from 'lucide-react-native';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { GridHabitCard } from '../components/habit/GridHabitCard';
import { AppIcon } from '../components/common/AppIcon';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, useThemeColors } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import { useHabitStore } from '../store/useHabitStore';
import { useAreaStore } from '../store/useAreaStore';
import { formatTurkishDisplayDate, formatISODate } from '../utils/date';
import { HabitWithTodayEntry } from '../types';
import { haptic } from '../utils/haptics';

interface TodayScreenProps {
  onOpenSettings: () => void;
  onOpenCreateHabit: () => void;
  onOpenHabitDetail: (habit: HabitWithTodayEntry) => void;
  onEditHabit: (habit: HabitWithTodayEntry) => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  onOpenSettings,
  onOpenCreateHabit,
  onOpenHabitDetail,
}) => {
  const {
    todayHabits,
    monthEntries,
    selectedAreaId,
    selectedTypeFilter,
    setSelectedAreaId,
    setSelectedTypeFilter,
    toggleDay,
    loadTodayHabits,
    loadMonthEntries,
    revertEntry,
  } = useHabitStore();

  const { areas } = useAreaStore();
  const colors = useThemeColors();

  const [undoAction, setUndoAction] = useState<{
    habitId: string;
    habitName: string;
    dateStr: string;
    wasCompleted: boolean;
    previousValue: number;
    message: string;
  } | null>(null);
  const undoTimerRef = useRef<any>(null);

  const todayDateStr = formatISODate();
  const displayDate = formatTurkishDisplayDate();

  useEffect(() => {
    loadTodayHabits();
    loadMonthEntries();
  }, [loadTodayHabits, loadMonthEntries]);

  // Filtrelenmiş alışkanlık listesi
  const filteredHabits = todayHabits.filter((h) => {
    if (selectedAreaId && h.areaId !== selectedAreaId) return false;
    if (selectedTypeFilter === 'build' && h.type !== 'build') return false;
    if (selectedTypeFilter === 'quit' && h.type !== 'quit') return false;
    return true;
  });

  const totalActiveCount = todayHabits.length;

  // 2 sütunlu kart genişliği hesaplaması
  const screenWidth = Dimensions.get('window').width;
  const PADDING_HORIZONTAL = 16;
  const GRID_GAP = 10;
  const cardWidth = Math.floor((screenWidth - (PADDING_HORIZONTAL * 2) - GRID_GAP) / 2);

  // Gün kutucuğuna tıklandığında doğrudan tamamlama / geri alma
  const handleToggleDay = (habit: HabitWithTodayEntry, dateStr: string) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const wasCompleted = Boolean(monthEntries[habit.id]?.[dateStr]);
    const prevVal = habit.currentValue;

    toggleDay(habit.id, dateStr);

    setUndoAction({
      habitId: habit.id,
      habitName: habit.name,
      dateStr,
      wasCompleted,
      previousValue: prevVal,
      message: wasCompleted
        ? `"${habit.name}" iptal edildi`
        : `"${habit.name}" tamamlandı! ✨`,
    });

    undoTimerRef.current = setTimeout(() => {
      setUndoAction(null);
    }, 4500);
  };

  const handleUndo = () => {
    if (!undoAction) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    // Kaydı önceki durumuna geri al
    toggleDay(undoAction.habitId, undoAction.dateStr);
    setUndoAction(null);
  };

  return (
    <ScreenContainer>
      {/* 1. Üst Çubuk (Tarih & Ayarlar) */}
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.todayDateText, { color: colors.textPrimary }]}>
            {displayDate}
          </Text>
          <Text style={[styles.todaySubText, { color: colors.textSecondary }]}>
            {STRINGS.app.name} • Günlük Rutinler
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            haptic.light();
            onOpenSettings();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[
            styles.settingsButton,
            { backgroundColor: colors.surface1, borderColor: colors.borderSubtle },
          ]}
          accessibilityLabel="Ayarlar"
        >
          <Settings size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* 2. Kategori Çipleri (Pill Tabs: Devam ediyor 17 | ✊ Mucize Sabah 3 | 🌱 Sağlık 5 ...) */}
      <View style={styles.pillContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillScrollContent}
        >
          {/* Tümü / Devam Ediyor Çipi */}
          <TouchableOpacity
            onPress={() => setSelectedAreaId(null)}
            activeOpacity={0.8}
            style={[
              styles.pillChip,
              selectedAreaId === null
                ? [styles.pillChipActive, { backgroundColor: colors.blue, borderColor: colors.blue }]
                : [styles.pillChipInactive, { backgroundColor: colors.surface1, borderColor: colors.borderSubtle }],
            ]}
          >
            <Text
              style={[
                styles.pillText,
                selectedAreaId === null
                  ? [styles.pillTextActive, { color: '#FFFFFF' }]
                  : [styles.pillTextInactive, { color: colors.textSecondary }],
              ]}
            >
              Devam ediyor
            </Text>
            <View
              style={[
                styles.pillBadge,
                selectedAreaId === null
                  ? { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
                  : { backgroundColor: colors.surface2 },
              ]}
            >
              <Text
                style={[
                  styles.pillBadgeText,
                  selectedAreaId === null
                    ? { color: '#FFFFFF' }
                    : { color: colors.textPrimary },
                ]}
              >
                {totalActiveCount}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Yaşam Alanı Çipleri */}
          {areas.map((area) => {
            const isSelected = selectedAreaId === area.id;
            const habitCount = todayHabits.filter((h) => h.areaId === area.id).length;

            return (
              <TouchableOpacity
                key={area.id}
                onPress={() => setSelectedAreaId(isSelected ? null : area.id)}
                activeOpacity={0.8}
                style={[
                  styles.pillChip,
                  isSelected
                    ? [styles.pillChipActive, { backgroundColor: area.color, borderColor: area.color }]
                    : [styles.pillChipInactive, { backgroundColor: colors.surface1, borderColor: colors.borderSubtle }],
                ]}
              >
                <View
                  style={[
                    styles.areaDot,
                    { backgroundColor: isSelected ? '#FFFFFF' : area.color },
                  ]}
                />
                <Text
                  style={[
                    styles.pillText,
                    isSelected
                      ? [styles.pillTextActive, { color: '#FFFFFF' }]
                      : [styles.pillTextInactive, { color: colors.textSecondary }],
                  ]}
                >
                  {area.name}
                </Text>
                <View
                  style={[
                    styles.pillBadge,
                    isSelected
                      ? { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
                      : { backgroundColor: colors.surface2 },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillBadgeText,
                      isSelected
                        ? { color: '#FFFFFF' }
                        : { color: colors.textPrimary },
                    ]}
                  >
                    {habitCount}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Tip Filtreleri (Tümü / Kazan / Bırak) */}
      <View style={styles.subFilterRow}>
        {[
          { key: 'all', label: STRINGS.today.filterAll },
          { key: 'build', label: STRINGS.today.filterBuild },
          { key: 'quit', label: STRINGS.today.filterQuit },
        ].map((f) => {
          const isActive = selectedTypeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setSelectedTypeFilter(f.key as any)}
              style={[
                styles.subFilterChip,
                isActive && [styles.subFilterChipActive, { backgroundColor: `${colors.blue}18` }],
              ]}
            >
              <Text
                style={[
                  styles.subFilterText,
                  { color: isActive ? colors.blue : colors.textMuted },
                  isActive && { fontWeight: '700' },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. 2 Sütunlu Alışkanlık Grid Listesi */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredHabits.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface1, borderColor: colors.borderSubtle }]}>
            <Sparkles size={42} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {STRINGS.today.noHabitsToday}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {STRINGS.today.createFirstHabit}
            </Text>
            <TouchableOpacity
              onPress={() => {
                haptic.light();
                onOpenCreateHabit();
              }}
              style={[styles.emptyButton, { backgroundColor: colors.blue }]}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={[styles.emptyButtonText, { color: '#FFFFFF' }]}>
                {STRINGS.habitForm.createTitle}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredHabits.map((habit) => (
              <GridHabitCard
                key={habit.id}
                habit={habit}
                cardWidth={cardWidth}
                monthEntries={monthEntries[habit.id] || {}}
                onPress={() => onOpenHabitDetail(habit)}
                onToggleDay={(dateStr) => handleToggleDay(habit, dateStr)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* 5. Floating Action Button (FAB: Sağ Altta + Butonu) */}
      <TouchableOpacity
        onPress={() => {
          haptic.medium();
          onOpenCreateHabit();
        }}
        activeOpacity={0.88}
        style={[
          styles.fab,
          {
            backgroundColor: colors.blue,
          },
        ]}
        accessibilityLabel="Yeni Alışkanlık Ekle"
      >
        <Plus size={26} color="#FFFFFF" strokeWidth={2.6} />
      </TouchableOpacity>

      {/* 6. Geri Al (Undo) Floating Snackbar */}
      {undoAction && (
        <View
          style={[
            styles.undoBanner,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
          ]}
        >
          <View style={styles.undoTextContainer}>
            <RotateCcw size={16} color={colors.amber} />
            <Text style={[styles.undoMessage, { color: colors.textPrimary }]} numberOfLines={1}>
              {undoAction.message}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleUndo}
            style={[styles.undoButton, { backgroundColor: colors.amber }]}
            activeOpacity={0.8}
          >
            <Text style={styles.undoButtonText}>GERİ AL</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  todayDateText: {
    ...TYPOGRAPHY.h2,
    fontSize: 20,
    fontWeight: '700',
  },
  todaySubText: {
    ...TYPOGRAPHY.tiny,
    letterSpacing: 0.4,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pillContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  pillScrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  pillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 22,
    borderWidth: 1,
    gap: 6,
  },
  pillChipActive: {},
  pillChipInactive: {},
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {},
  pillTextInactive: {},
  pillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  areaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 4,
    gap: 12,
    alignItems: 'center',
  },
  subFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subFilterChipActive: {},
  subFilterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 8,
    paddingBottom: 110,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyState: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    marginTop: SPACING.sm,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  emptyButtonText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
  },
  undoBanner: {
    position: 'absolute',
    bottom: 86,
    left: SPACING.lg,
    right: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  undoTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
    marginRight: SPACING.sm,
  },
  undoMessage: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    flex: 1,
  },
  undoButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  undoButtonText: {
    ...TYPOGRAPHY.tiny,
    color: '#080B10',
    fontWeight: '700',
  },
});
