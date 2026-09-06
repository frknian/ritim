import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar as CalendarIcon,
  Save,
  Edit2,
  Plus,
  Sliders,
  FileText,
  Minus,
  RotateCcw,
  X,
} from 'lucide-react-native';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { AppHeader } from '../components/common/AppHeader';
import { AppIcon } from '../components/common/AppIcon';
import { AppModal } from '../components/common/AppModal';
import { AppButton } from '../components/common/AppButton';
import { RADIUS, SPACING, TYPOGRAPHY, useThemeColors } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import {
  formatISODate,
  getMonthMatrix,
  formatTurkishMonthYear,
  parseISODate,
  formatTurkishDisplayDate,
} from '../utils/date';
import { EntryRepository } from '../db/repositories/entryRepository';
import { HabitRepository } from '../db/repositories/habitRepository';
import { HabitWithTodayEntry } from '../types';
import { haptic } from '../utils/haptics';
import { useHabitStore } from '../store/useHabitStore';
import { WidgetService } from '../services/widgetService';
import { RecurrenceEngine } from '../services/recurrenceEngine';

interface CalendarScreenProps {
  onBack?: () => void;
  onOpenCreateHabit?: () => void;
  onEditHabit?: (habit: HabitWithTodayEntry) => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  onBack,
  onOpenCreateHabit,
  onEditHabit,
}) => {
  const colors = useThemeColors();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(formatISODate(today));
  const [dayHabits, setDayHabits] = useState<HabitWithTodayEntry[]>([]);
  const [dayNote, setDayNote] = useState('');
  const [monthEntriesMap, setMonthEntriesMap] = useState<Map<string, { total: number; completed: number }>>(new Map());

  // Günlük yapılacak alışkanlık düzenleme/özelleştirme modal durumu
  const [selectedHabitForEdit, setSelectedHabitForEdit] = useState<HabitWithTodayEntry | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [editCompleted, setEditCompleted] = useState<boolean>(false);
  const [editNotes, setEditNotes] = useState<string>('');

  const monthMatrix = getMonthMatrix(currentYear, currentMonth);

  // Global store'daki alışkanlık değişikliklerini dinle
  const storeTodayHabits = useHabitStore((state) => state.todayHabits);

  // Ayın verilerini ve seçili günün alışkanlıklarını yükle
  useEffect(() => {
    loadMonthData();
    loadDayHabits(selectedDate);
  }, [currentYear, currentMonth, selectedDate, storeTodayHabits]);

  const loadMonthData = () => {
    const startStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const endStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const entries = EntryRepository.getEntriesInDateRange(startStr, endStr);
    const activeHabits = HabitRepository.getAllActive();
    const map = new Map<string, { total: number; completed: number }>();

    // Günlük tamamlanan alışkanlıkları grupla
    const completedByDate = new Map<string, Set<string>>();
    for (const e of entries) {
      if (e.isCompleted) {
        if (!completedByDate.has(e.entryDate)) {
          completedByDate.set(e.entryDate, new Set());
        }
        completedByDate.get(e.entryDate)!.add(e.habitId);
      }
    }

    for (let d = 1; d <= lastDay; d++) {
      const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const habitsOnDay = activeHabits.filter((h) => RecurrenceEngine.isHabitActiveOnDate(h, dayStr));
      const total = habitsOnDay.length > 0 ? habitsOnDay.length : activeHabits.length;

      const completedSet = completedByDate.get(dayStr);
      let completed = 0;
      if (completedSet) {
        const targetList = habitsOnDay.length > 0 ? habitsOnDay : activeHabits;
        for (const h of targetList) {
          if (completedSet.has(h.id)) {
            completed++;
          }
        }
      }

      if (total > 0) {
        map.set(dayStr, { total, completed });
      }
    }
    setMonthEntriesMap(map);
  };

  const loadDayHabits = (dateStr: string) => {
    const habits = HabitRepository.getTodayHabitsWithEntries(dateStr);
    setDayHabits(habits);

    // Varsa günün ilk notunu getir
    const foundWithNote = habits.find((h) => h.todayNotes);
    setDayNote(foundWithNote?.todayNotes || '');
  };

  const handlePrevMonth = () => {
    haptic.light();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    haptic.light();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    haptic.light();
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(formatISODate(now));
  };

  const handleToggleHabitOnDay = (habitId: string) => {
    const habit = dayHabits.find((h) => h.id === habitId);
    if (!habit) return;

    haptic.medium();
    const newCompleted = !habit.isCompletedToday;
    const newVal = newCompleted ? habit.targetValue : 0;

    EntryRepository.upsertEntry(habitId, selectedDate, newVal, newCompleted, dayNote);
    loadDayHabits(selectedDate);
    loadMonthData();

    // Global durum ve widget senkronizasyonu
    useHabitStore.getState().loadTodayHabits();
    useHabitStore.getState().loadMonthEntries();
    WidgetService.syncWidgets();
  };

  const handleSaveNote = () => {
    if (dayHabits.length === 0) return;
    haptic.success();
    const firstHabit = dayHabits[0];
    EntryRepository.upsertEntry(
      firstHabit.id,
      selectedDate,
      firstHabit.currentValue,
      firstHabit.isCompletedToday,
      dayNote.trim()
    );
    loadDayHabits(selectedDate);
    useHabitStore.getState().loadTodayHabits();
    WidgetService.syncWidgets();
  };

  // Özelleştirme / Düzenleme Modal İşlemleri
  const handleOpenEditHabit = (habit: HabitWithTodayEntry) => {
    haptic.light();
    setSelectedHabitForEdit(habit);
    setEditValue(habit.currentValue ?? 0);
    setEditCompleted(habit.isCompletedToday ?? false);
    setEditNotes(habit.todayNotes || '');
  };

  const handleSaveEditHabit = () => {
    if (!selectedHabitForEdit) return;
    haptic.success();
    EntryRepository.upsertEntry(
      selectedHabitForEdit.id,
      selectedDate,
      editValue,
      editCompleted,
      editNotes.trim()
    );
    setSelectedHabitForEdit(null);
    loadDayHabits(selectedDate);
    loadMonthData();

    // Global durum ve widget senkronizasyonu
    useHabitStore.getState().loadTodayHabits();
    useHabitStore.getState().loadMonthEntries();
    WidgetService.syncWidgets();
  };

  const handleGoToFullHabitEdit = () => {
    if (!selectedHabitForEdit) return;
    const h = selectedHabitForEdit;
    setSelectedHabitForEdit(null);
    if (onEditHabit) {
      onEditHabit(h);
    }
  };

  const adjustValue = (delta: number) => {
    haptic.light();
    const updated = Math.max(0, editValue + delta);
    setEditValue(updated);
    if (selectedHabitForEdit) {
      if (updated >= selectedHabitForEdit.targetValue) {
        setEditCompleted(true);
      } else if (updated === 0) {
        setEditCompleted(false);
      }
    }
  };

  const setMaxTarget = () => {
    haptic.light();
    if (selectedHabitForEdit) {
      setEditValue(selectedHabitForEdit.targetValue);
      setEditCompleted(true);
    }
  };

  const resetValue = () => {
    haptic.light();
    setEditValue(0);
    setEditCompleted(false);
  };

  const selectedDisplayDate = formatTurkishDisplayDate(parseISODate(selectedDate));
  const todayISO = formatISODate();
  const completedHabitsCount = dayHabits.filter((h) => h.isCompletedToday).length;

  return (
    <ScreenContainer>
      <AppHeader
        title={STRINGS.calendar.title}
        showBack={!!onBack}
        onBack={onBack}
        rightAction={
          <TouchableOpacity
            onPress={handleGoToToday}
            style={[
              styles.todayButton,
              { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
            ]}
          >
            <Text style={[styles.todayButtonText, { color: colors.blue }]}>
              {STRINGS.calendar.goToToday}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Ay Gezintisi Başlığı */}
        <View style={styles.monthHeader}>
          <TouchableOpacity
            onPress={handlePrevMonth}
            style={[styles.navArrow, { backgroundColor: colors.surface2 }]}
          >
            <ChevronLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>
            {formatTurkishMonthYear(new Date(currentYear, currentMonth, 1))}
          </Text>

          <TouchableOpacity
            onPress={handleNextMonth}
            style={[styles.navArrow, { backgroundColor: colors.surface2 }]}
          >
            <ChevronRight size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Gün Başlıkları (Pzt, Sal...) */}
        <View style={styles.weekDaysRow}>
          {STRINGS.common.daysShort.map((day) => (
            <Text key={day} style={[styles.weekDayHeader, { color: colors.textMuted }]}>
              {day}
            </Text>
          ))}
        </View>

        {/* Aylık Matris Izgarası */}
        <View style={styles.calendarGrid}>
          {monthMatrix.map((cell, index) => {
            if (!cell.dateStr) {
              return (
                <View
                  key={`empty_${index}`}
                  style={[styles.emptyDayCell, { backgroundColor: 'transparent' }]}
                />
              );
            }

            const isSelected = cell.dateStr === selectedDate;
            const isToday = cell.dateStr === todayISO;
            const stats = monthEntriesMap.get(cell.dateStr);
            const rate = stats && stats.total > 0 ? stats.completed / stats.total : 0;

            let cellBg: string = colors.surface1;
            if (rate === 1) {
              cellBg = `${colors.emerald}30`;
            } else if (rate > 0) {
              cellBg = `${colors.blue}25`;
            }

            return (
              <TouchableOpacity
                key={cell.dateStr}
                onPress={() => {
                  haptic.selection();
                  setSelectedDate(cell.dateStr!);
                }}
                activeOpacity={0.7}
                style={[
                  styles.dayCell,
                  { backgroundColor: cellBg, borderColor: colors.borderSubtle },
                  isToday && [styles.dayCellToday, { borderColor: colors.blue }],
                  isSelected && [styles.dayCellSelected, { borderColor: colors.textPrimary, borderWidth: 2 }],
                ]}
              >
                <Text
                  style={[
                    styles.dayNumberText,
                    {
                      color: isSelected
                        ? colors.textPrimary
                        : isToday
                        ? colors.blue
                        : colors.textSecondary,
                    },
                    isToday && styles.dayNumberToday,
                    isSelected && styles.dayNumberSelected,
                  ]}
                >
                  {cell.dayNumber}
                </Text>

                {/* Tamamlanma Gösterge Noktası */}
                {rate > 0 && (
                  <View
                    style={[
                      styles.completionDot,
                      { backgroundColor: rate === 1 ? colors.emerald : colors.blue },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Seçili Günün Detay Çekmecesi */}
        <View
          style={[
            styles.dayDetailsCard,
            { backgroundColor: colors.surface1, borderColor: colors.borderSubtle },
          ]}
        >
          <View style={styles.dayDetailHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <CalendarIcon size={18} color={colors.blue} />
              <Text style={[styles.selectedDayTitle, { color: colors.textPrimary }]}>
                {selectedDisplayDate}
              </Text>
              {dayHabits.length > 0 && (
                <View
                  style={[
                    styles.dayCounterBadge,
                    {
                      backgroundColor:
                        completedHabitsCount === dayHabits.length
                          ? `${colors.emerald}25`
                          : colors.surface2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayCounterText,
                      {
                        color:
                          completedHabitsCount === dayHabits.length
                            ? colors.emerald
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {completedHabitsCount}/{dayHabits.length}
                  </Text>
                </View>
              )}
            </View>

            {onOpenCreateHabit && (
              <TouchableOpacity
                onPress={() => {
                  haptic.light();
                  onOpenCreateHabit();
                }}
                activeOpacity={0.7}
                style={[
                  styles.addHabitDayBtn,
                  { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                ]}
              >
                <Plus size={14} color={colors.blue} />
                <Text style={[styles.addHabitDayText, { color: colors.blue }]}>Ekle</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* O Güne Ait Alışkanlıklar Listesi */}
          {dayHabits.length === 0 ? (
            <View style={styles.emptyDayContainer}>
              <Text style={[styles.noHabitsText, { color: colors.textMuted }]}>
                {STRINGS.calendar.noHabitsForDay}
              </Text>
              {onOpenCreateHabit && (
                <TouchableOpacity
                  onPress={() => {
                    haptic.light();
                    onOpenCreateHabit();
                  }}
                  activeOpacity={0.8}
                  style={[styles.emptyAddBtn, { backgroundColor: colors.blue }]}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.emptyAddBtnText}>Yeni Alışkanlık Ekle</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.dayHabitsList}>
              {dayHabits.map((habit) => {
                const habitColor = habit.color || colors.emerald;
                return (
                  <View
                    key={habit.id}
                    style={[
                      styles.dayHabitItem,
                      {
                        backgroundColor: colors.surface2,
                        borderColor: habit.isCompletedToday ? `${colors.emerald}50` : colors.borderSubtle,
                      },
                    ]}
                  >
                    {/* Alışkanlık İkon & Bilgi (Dokunulduğunda da düzenleme açılır) */}
                    <TouchableOpacity
                      onPress={() => handleOpenEditHabit(habit)}
                      activeOpacity={0.7}
                      style={styles.dayHabitLeftRow}
                    >
                      <View
                        style={[
                          styles.dayHabitIconBadge,
                          { backgroundColor: `${habitColor}20` },
                        ]}
                      >
                        <AppIcon name={habit.icon} size={18} color={habitColor} />
                      </View>

                      <View style={styles.dayHabitInfo}>
                        <Text
                          style={[
                            styles.dayHabitName,
                            { color: colors.textPrimary },
                            habit.isCompletedToday && styles.dayHabitNameDone,
                          ]}
                          numberOfLines={1}
                        >
                          {habit.name}
                        </Text>
                        <Text style={[styles.dayHabitMeta, { color: colors.textSecondary }]}>
                          {habit.trackingMode === 'boolean'
                            ? habit.isCompletedToday
                              ? '✓ Tamamlandı'
                              : '○ Yapılmadı'
                            : `${habit.currentValue} / ${habit.targetValue} ${habit.unit || ''}`}
                        </Text>
                        {!!habit.todayNotes && (
                          <View style={styles.dayHabitNoteRow}>
                            <FileText size={10} color={colors.textMuted} />
                            <Text
                              style={[styles.dayHabitNoteSnippet, { color: colors.textMuted }]}
                              numberOfLines={1}
                            >
                              {habit.todayNotes}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Sağ Taraf: Düzenle Butonu ve Tamamlama Onayı */}
                    <View style={styles.dayHabitActions}>
                      <TouchableOpacity
                        onPress={() => handleOpenEditHabit(habit)}
                        activeOpacity={0.7}
                        style={[
                          styles.dayEditButton,
                          { backgroundColor: colors.surface1, borderColor: colors.borderSubtle },
                        ]}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        accessibilityLabel={`${habit.name} düzenle`}
                      >
                        <Edit2 size={12} color={colors.blue} />
                        <Text style={[styles.dayEditText, { color: colors.blue }]}>Düzenle</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleToggleHabitOnDay(habit.id)}
                        activeOpacity={0.7}
                        style={[
                          styles.dayCheckButton,
                          { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
                          habit.isCompletedToday && [
                            styles.dayCheckButtonActive,
                            { backgroundColor: colors.emerald, borderColor: colors.emerald },
                          ],
                        ]}
                        accessibilityLabel={`${habit.name} durumunu değiştir`}
                      >
                        {habit.isCompletedToday && <Check size={16} color="#FFFFFF" />}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Günlük Genel Not Alanı */}
          <View style={styles.noteSection}>
            <TextInput
              placeholder={STRINGS.calendar.notePlaceholder}
              placeholderTextColor={colors.textMuted}
              value={dayNote}
              onChangeText={setDayNote}
              style={[
                styles.noteInput,
                {
                  backgroundColor: colors.surface2,
                  borderColor: colors.borderSubtle,
                  color: colors.textPrimary,
                },
              ]}
              multiline
            />
            {dayNote.length > 0 && (
              <TouchableOpacity
                onPress={handleSaveNote}
                style={[styles.saveNoteBtn, { backgroundColor: colors.blue }]}
              >
                <Save size={14} color="#FFFFFF" />
                <Text style={styles.saveNoteText}>{STRINGS.calendar.saveNote}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Seçili Alışkanlık & Gün Özelleştirme Modalı */}
      <AppModal
        visible={!!selectedHabitForEdit}
        onClose={() => setSelectedHabitForEdit(null)}
        title="Günü Özelleştir"
      >
        {selectedHabitForEdit && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.modalScrollContent}
          >
            {/* Alışkanlık Başlık Kartı */}
            <View
              style={[
                styles.modalHabitCard,
                { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
              ]}
            >
              <View
                style={[
                  styles.modalIconBadge,
                  { backgroundColor: `${selectedHabitForEdit.color || colors.emerald}25` },
                ]}
              >
                <AppIcon
                  name={selectedHabitForEdit.icon}
                  size={24}
                  color={selectedHabitForEdit.color || colors.emerald}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalHabitTitle, { color: colors.textPrimary }]}>
                  {selectedHabitForEdit.name}
                </Text>
                <Text style={[styles.modalHabitSubtitle, { color: colors.textSecondary }]}>
                  {selectedDisplayDate} •{' '}
                  {selectedHabitForEdit.trackingMode === 'boolean'
                    ? 'Evet / Hayır Takibi'
                    : `Hedef: ${selectedHabitForEdit.targetValue} ${selectedHabitForEdit.unit || ''}`}
                </Text>
              </View>
            </View>

            {/* 1. Tamamlanma Durumu Seçimi */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                DURUM
              </Text>
              <View style={styles.statusButtonsRow}>
                <TouchableOpacity
                  onPress={() => {
                    haptic.light();
                    setEditCompleted(true);
                    if (editValue === 0 && selectedHabitForEdit.targetValue > 0) {
                      setEditValue(selectedHabitForEdit.targetValue);
                    }
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.statusBtn,
                    { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                    editCompleted && [
                      styles.statusBtnActiveCompleted,
                      { backgroundColor: `${colors.emerald}20`, borderColor: colors.emerald },
                    ],
                  ]}
                >
                  <Check
                    size={16}
                    color={editCompleted ? colors.emerald : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.statusBtnText,
                      { color: editCompleted ? colors.emerald : colors.textSecondary },
                      editCompleted && styles.statusBtnTextActive,
                    ]}
                  >
                    Tamamlandı
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    haptic.light();
                    setEditCompleted(false);
                    if (selectedHabitForEdit.trackingMode === 'boolean') {
                      setEditValue(0);
                    }
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.statusBtn,
                    { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                    !editCompleted && [
                      styles.statusBtnActiveIncomplete,
                      { backgroundColor: `${colors.textMuted}20`, borderColor: colors.textMuted },
                    ],
                  ]}
                >
                  <X
                    size={16}
                    color={!editCompleted ? colors.textPrimary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.statusBtnText,
                      { color: !editCompleted ? colors.textPrimary : colors.textSecondary },
                      !editCompleted && styles.statusBtnTextActive,
                    ]}
                  >
                    Tamamlanmadı
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Sayısal / Süre Değeri Özelleştirme (Eğer boolean değilse) */}
            {selectedHabitForEdit.trackingMode !== 'boolean' && (
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                  İLERLEME DEĞERİ ({selectedHabitForEdit.unit || 'Birim'})
                </Text>

                {/* Hızlı Stepper & Değer Göstergesi */}
                <View
                  style={[
                    styles.stepperContainer,
                    { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => adjustValue(-5)}
                    activeOpacity={0.7}
                    style={[styles.stepBtn, { backgroundColor: colors.surface1 }]}
                  >
                    <Text style={[styles.stepBtnText, { color: colors.textPrimary }]}>-5</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => adjustValue(-1)}
                    activeOpacity={0.7}
                    style={[styles.stepBtn, { backgroundColor: colors.surface1 }]}
                  >
                    <Minus size={16} color={colors.textPrimary} />
                  </TouchableOpacity>

                  <View style={styles.valueInputWrapper}>
                    <TextInput
                      value={String(editValue)}
                      onChangeText={(val) => {
                        const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
                        setEditValue(num);
                        if (num >= selectedHabitForEdit.targetValue) {
                          setEditCompleted(true);
                        }
                      }}
                      keyboardType="number-pad"
                      style={[styles.valueInput, { color: colors.textPrimary }]}
                      selectTextOnFocus
                    />
                    <Text style={[styles.unitSubText, { color: colors.textMuted }]}>
                      / {selectedHabitForEdit.targetValue} {selectedHabitForEdit.unit || ''}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => adjustValue(+1)}
                    activeOpacity={0.7}
                    style={[styles.stepBtn, { backgroundColor: colors.surface1 }]}
                  >
                    <Plus size={16} color={colors.textPrimary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => adjustValue(+5)}
                    activeOpacity={0.7}
                    style={[styles.stepBtn, { backgroundColor: colors.surface1 }]}
                  >
                    <Text style={[styles.stepBtnText, { color: colors.textPrimary }]}>+5</Text>
                  </TouchableOpacity>
                </View>

                {/* Hızlı Kısayollar: Hedefe Ulaş & Sıfırla */}
                <View style={styles.quickShortcutsRow}>
                  <TouchableOpacity
                    onPress={resetValue}
                    activeOpacity={0.7}
                    style={[
                      styles.shortcutBtn,
                      { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                    ]}
                  >
                    <RotateCcw size={12} color={colors.textSecondary} />
                    <Text style={[styles.shortcutBtnText, { color: colors.textSecondary }]}>
                      Sıfırla (0)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={setMaxTarget}
                    activeOpacity={0.7}
                    style={[
                      styles.shortcutBtn,
                      { backgroundColor: `${colors.emerald}15`, borderColor: `${colors.emerald}40` },
                    ]}
                  >
                    <Check size={12} color={colors.emerald} />
                    <Text style={[styles.shortcutBtnText, { color: colors.emerald }]}>
                      Hedefe Ulaş ({selectedHabitForEdit.targetValue})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 3. Güne ve Alışkanlığa Özel Not */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>
                GÜNE ÖZEL NOT / AÇIKLAMA
              </Text>
              <TextInput
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Bu aktivite hakkında bir not ekleyin..."
                placeholderTextColor={colors.textMuted}
                multiline
                style={[
                  styles.modalNoteInput,
                  {
                    backgroundColor: colors.surface2,
                    borderColor: colors.borderSubtle,
                    color: colors.textPrimary,
                  },
                ]}
              />
            </View>

            {/* 4. Alışkanlığı Genel Olarak Düzenleme Bağlantısı */}
            {onEditHabit && (
              <TouchableOpacity
                onPress={handleGoToFullHabitEdit}
                activeOpacity={0.8}
                style={[
                  styles.fullEditHabitBtn,
                  { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                ]}
              >
                <Sliders size={16} color={colors.blue} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fullEditHabitTitle, { color: colors.textPrimary }]}>
                    Alışkanlığı Genel Olarak Düzenle
                  </Text>
                  <Text style={[styles.fullEditHabitSub, { color: colors.textMuted }]}>
                    Hedef, sıklık, anımsatıcı veya isim ayarlarını değiştir
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* 5. Kaydet Butonu */}
            <View style={styles.modalActionButtons}>
              <AppButton
                title="Değişiklikleri Kaydet"
                onPress={handleSaveEditHabit}
                variant="primary"
              />
            </View>
          </ScrollView>
        )}
      </AppModal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 90,
  },
  todayButton: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  todayButtonText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    ...TYPOGRAPHY.h2,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  weekDayHeader: {
    width: 40,
    textAlign: 'center',
    ...TYPOGRAPHY.tiny,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 4,
  },
  emptyDayCell: {
    width: 44,
    height: 48,
  },
  dayCell: {
    width: 44,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 4,
  },
  dayCellToday: {},
  dayCellSelected: {},
  dayNumberText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
  },
  dayNumberToday: {
    fontWeight: '700',
  },
  dayNumberSelected: {
    fontWeight: '700',
  },
  completionDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
  },
  dayDetailsCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    marginTop: SPACING.xl,
  },
  dayDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  selectedDayTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
  },
  dayCounterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  dayCounterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addHabitDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 4,
  },
  addHabitDayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyDayContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: 12,
  },
  noHabitsText: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  dayHabitsList: {
    gap: 8,
    marginBottom: SPACING.md,
  },
  dayHabitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  dayHabitLeftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 6,
  },
  dayHabitIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHabitInfo: {
    flex: 1,
  },
  dayHabitName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  dayHabitNameDone: {
    opacity: 0.85,
  },
  dayHabitMeta: {
    ...TYPOGRAPHY.tiny,
    marginTop: 2,
  },
  dayHabitNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  dayHabitNoteSnippet: {
    fontSize: 10,
    flex: 1,
  },
  dayHabitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 4,
  },
  dayEditText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dayCheckButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayCheckButtonActive: {},
  noteSection: {
    marginTop: SPACING.sm,
  },
  noteInput: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 13,
    minHeight: 56,
    borderWidth: 1,
  },
  saveNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    marginTop: 8,
    gap: 4,
  },
  saveNoteText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Modal Stilleri
  modalScrollContent: {
    paddingBottom: 24,
    gap: 16,
  },
  modalHabitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: 12,
  },
  modalIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHabitTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
  },
  modalHabitSubtitle: {
    ...TYPOGRAPHY.tiny,
    marginTop: 2,
  },
  modalSection: {
    gap: 8,
  },
  modalSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 8,
  },
  statusBtnActiveCompleted: {
    borderWidth: 1.5,
  },
  statusBtnActiveIncomplete: {
    borderWidth: 1.5,
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBtnTextActive: {
    fontWeight: '700',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  valueInputWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  valueInput: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    padding: 0,
  },
  unitSubText: {
    fontSize: 11,
    marginTop: 2,
  },
  quickShortcutsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  shortcutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 6,
  },
  shortcutBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalNoteInput: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 13,
    minHeight: 70,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  fullEditHabitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 12,
  },
  fullEditHabitTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  fullEditHabitSub: {
    fontSize: 11,
    marginTop: 2,
  },
  modalActionButtons: {
    marginTop: 8,
  },
});
