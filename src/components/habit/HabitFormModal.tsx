import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AppModal } from '../common/AppModal';
import { AppInput } from '../common/AppInput';
import { AppButton } from '../common/AppButton';
import { AppIcon } from '../common/AppIcon';
import { PALETTE_OPTIONS, ICON_OPTIONS, RADIUS, SPACING, TYPOGRAPHY, useThemeColors } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { Habit, HabitType, TrackingMode, FrequencyType } from '../../types';
import { useAreaStore } from '../../store/useAreaStore';
import { haptic } from '../../utils/haptics';

interface HabitFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (habitData: any, reminders?: { timeOfDay: string; daysOfWeek: number[] }[]) => void;
  initialHabit?: Habit | null;
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  visible,
  onClose,
  onSave,
  initialHabit,
}) => {
  const { areas } = useAreaStore();
  const colors = useThemeColors();

  const [type, setType] = useState<HabitType>('build');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [areaId, setAreaId] = useState<string | null>(null);
  const [color, setColor] = useState<string>(colors.emerald);
  const [icon, setIcon] = useState<string>('check-circle-2');
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('boolean');
  const [targetValue, setTargetValue] = useState('1');
  const [unit, setUnit] = useState('');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [intervalDays, setIntervalDays] = useState('2');
  const [streakGoal, setStreakGoal] = useState('21');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [hasReminder, setHasReminder] = useState(false);
  const [errorName, setErrorName] = useState('');

  useEffect(() => {
    if (initialHabit) {
      setType(initialHabit.type);
      setName(initialHabit.name);
      setDescription(initialHabit.description || '');
      setAreaId(initialHabit.areaId);
      setColor(initialHabit.color);
      setIcon(initialHabit.icon);
      setTrackingMode(initialHabit.trackingMode);
      setTargetValue(String(initialHabit.targetValue));
      setUnit(initialHabit.unit || '');
      setFrequencyType(initialHabit.frequencyType);
      setSelectedDays(initialHabit.frequencyConfig.days || [1, 2, 3, 4, 5, 6, 7]);
      setIntervalDays(String(initialHabit.frequencyConfig.interval_days || 2));
      setStreakGoal(String(initialHabit.streakGoal || 21));
    } else {
      setType('build');
      setName('');
      setDescription('');
      setAreaId(areas.length > 0 ? areas[0].id : null);
      setColor(colors.emerald);
      setIcon('check-circle-2');
      setTrackingMode('boolean');
      setTargetValue('1');
      setUnit('');
      setFrequencyType('daily');
      setSelectedDays([1, 2, 3, 4, 5, 6, 7]);
      setIntervalDays('2');
      setStreakGoal('21');
      setHasReminder(false);
    }
    setErrorName('');
  }, [initialHabit, visible, areas, colors]);

  const toggleDay = (dayIndex: number) => {
    haptic.selection();
    if (selectedDays.includes(dayIndex)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
      }
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrorName(STRINGS.habitForm.validationNameRequired);
      haptic.warning();
      return;
    }

    const numericTarget = Number(targetValue);
    if (trackingMode !== 'boolean' && (!numericTarget || numericTarget <= 0)) {
      setErrorName(STRINGS.habitForm.validationTargetPositive);
      haptic.warning();
      return;
    }

    const payload = {
      id: initialHabit ? initialHabit.id : `habit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      description: description.trim() || undefined,
      areaId,
      type,
      color,
      icon,
      trackingMode,
      targetValue: trackingMode === 'boolean' ? 1 : numericTarget,
      unit: trackingMode !== 'boolean' ? unit.trim() : undefined,
      frequencyType,
      frequencyConfig: {
        days: frequencyType === 'specific_days' ? selectedDays : undefined,
        interval_days: frequencyType === 'interval' ? Number(intervalDays) : undefined,
      },
      streakGoal: Number(streakGoal) || 21,
      isArchived: initialHabit ? initialHabit.isArchived : false,
      sortOrder: initialHabit ? initialHabit.sortOrder : 0,
    };

    const reminders = hasReminder
      ? [
          {
            timeOfDay: reminderTime,
            daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
          },
        ]
      : [];

    haptic.success();
    onSave(payload, reminders);
    onClose();
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={initialHabit ? STRINGS.habitForm.editTitle : STRINGS.habitForm.createTitle}
    >
      <View style={styles.form}>
        {/* 1. Alışkanlık Tipi Seçici (Kazan / Bırak) */}
        <View style={[styles.typeSelectorRow, { backgroundColor: colors.surface2 }]}>
          <TouchableOpacity
            onPress={() => {
              haptic.selection();
              setType('build');
              if (color === colors.rose) setColor(colors.emerald);
            }}
            style={[
              styles.typeTab,
              type === 'build' && [styles.typeTabActiveBuild, { backgroundColor: colors.emerald }],
            ]}
          >
            <Text
              style={[
                styles.typeTabText,
                { color: type === 'build' ? '#FFFFFF' : colors.textSecondary },
                type === 'build' && styles.typeTabTextActive,
              ]}
            >
              {STRINGS.habitForm.typeBuild}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              haptic.selection();
              setType('quit');
              setColor(colors.rose);
            }}
            style={[
              styles.typeTab,
              type === 'quit' && [styles.typeTabActiveQuit, { backgroundColor: colors.rose }],
            ]}
          >
            <Text
              style={[
                styles.typeTabText,
                { color: type === 'quit' ? '#FFFFFF' : colors.textSecondary },
                type === 'quit' && styles.typeTabTextActive,
              ]}
            >
              {STRINGS.habitForm.typeQuit}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. Temel Bilgiler */}
        <AppInput
          label={STRINGS.habitForm.nameLabel}
          placeholder={STRINGS.habitForm.namePlaceholder}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errorName) setErrorName('');
          }}
          error={errorName}
        />

        <AppInput
          label={STRINGS.habitForm.descLabel}
          placeholder={STRINGS.habitForm.descPlaceholder}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* 3. Renk Seçimi */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          {STRINGS.habitForm.iconAndColorLabel}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.scrollList}
        >
          {PALETTE_OPTIONS.map((item) => (
            <TouchableOpacity
              key={item.name}
              onPress={() => {
                haptic.selection();
                setColor(item.value);
              }}
              style={[
                styles.colorCircle,
                { backgroundColor: item.value },
                color === item.value && styles.colorCircleSelected,
              ]}
            />
          ))}
        </ScrollView>

        {/* 4. İkon Seçimi */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.scrollList}
        >
          {ICON_OPTIONS.map((iconName) => (
            <TouchableOpacity
              key={iconName}
              onPress={() => {
                haptic.selection();
                setIcon(iconName);
              }}
              style={[
                styles.iconBox,
                { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                icon === iconName && {
                  borderColor: color,
                  backgroundColor: `${color}20`,
                },
              ]}
            >
              <AppIcon
                name={iconName}
                size={22}
                color={icon === iconName ? color : colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 5. Yaşam Alanı Seçimi */}
        {areas.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {STRINGS.habitForm.areaLabel}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              <TouchableOpacity
                onPress={() => {
                  haptic.selection();
                  setAreaId(null);
                }}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                  areaId === null && [styles.chipActive, { backgroundColor: colors.surfaceElevated, borderColor: colors.blue }],
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: areaId === null ? colors.blue : colors.textSecondary },
                    areaId === null && styles.chipTextActive,
                  ]}
                >
                  {STRINGS.habitForm.noAreaOption}
                </Text>
              </TouchableOpacity>

              {areas.map((area) => (
                <TouchableOpacity
                  key={area.id}
                  onPress={() => {
                    haptic.selection();
                    setAreaId(area.id);
                  }}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                    areaId === area.id && {
                      backgroundColor: `${area.color}25`,
                      borderColor: area.color,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: areaId === area.id ? area.color : colors.textSecondary },
                      areaId === area.id && { fontWeight: '700' },
                    ]}
                  >
                    {area.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 6. Takip Modu (Yalnızca Build için) */}
        {type === 'build' && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              {STRINGS.habitForm.trackingModeLabel}
            </Text>
            <View style={styles.trackingModeRow}>
              <TouchableOpacity
                onPress={() => {
                  haptic.selection();
                  setTrackingMode('boolean');
                }}
                style={[
                  styles.modeButton,
                  { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                  trackingMode === 'boolean' && [
                    styles.modeButtonActive,
                    { borderColor: colors.blue, backgroundColor: `${colors.blue}18` },
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    { color: trackingMode === 'boolean' ? colors.blue : colors.textSecondary },
                    trackingMode === 'boolean' && styles.modeButtonTextActive,
                  ]}
                >
                  {STRINGS.habitForm.modeBoolean}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  haptic.selection();
                  setTrackingMode('numeric');
                  if (!unit) setUnit('sayfa');
                  if (targetValue === '1') setTargetValue('20');
                }}
                style={[
                  styles.modeButton,
                  { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                  trackingMode === 'numeric' && [
                    styles.modeButtonActive,
                    { borderColor: colors.blue, backgroundColor: `${colors.blue}18` },
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    { color: trackingMode === 'numeric' ? colors.blue : colors.textSecondary },
                    trackingMode === 'numeric' && styles.modeButtonTextActive,
                  ]}
                >
                  {STRINGS.habitForm.modeNumeric}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  haptic.selection();
                  setTrackingMode('duration');
                  setUnit('dk');
                  if (targetValue === '1') setTargetValue('30');
                }}
                style={[
                  styles.modeButton,
                  { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                  trackingMode === 'duration' && [
                    styles.modeButtonActive,
                    { borderColor: colors.blue, backgroundColor: `${colors.blue}18` },
                  ],
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    { color: trackingMode === 'duration' ? colors.blue : colors.textSecondary },
                    trackingMode === 'duration' && styles.modeButtonTextActive,
                  ]}
                >
                  {STRINGS.habitForm.modeDuration}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mod Değer Alanları */}
            {trackingMode === 'numeric' && (
              <View style={styles.targetRow}>
                <View style={{ flex: 1, marginRight: SPACING.md }}>
                  <AppInput
                    label={STRINGS.habitForm.targetValueLabel}
                    value={targetValue}
                    onChangeText={setTargetValue}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppInput
                    label={STRINGS.habitForm.unitLabel}
                    placeholder="sayfa, bardak..."
                    value={unit}
                    onChangeText={setUnit}
                  />
                </View>
              </View>
            )}

            {trackingMode === 'duration' && (
              <AppInput
                label={STRINGS.habitForm.durationMinutesLabel}
                value={targetValue}
                onChangeText={setTargetValue}
                keyboardType="numeric"
              />
            )}
          </View>
        )}

        {/* 7. Tekrar Planı */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            {STRINGS.habitForm.frequencyLabel}
          </Text>
          <View style={styles.freqRow}>
            {[
              { key: 'daily', label: STRINGS.habitForm.freqDaily },
              { key: 'weekdays', label: STRINGS.habitForm.freqWeekdays },
              { key: 'weekends', label: STRINGS.habitForm.freqWeekends },
              { key: 'specific_days', label: STRINGS.habitForm.freqSpecificDays },
              { key: 'interval', label: STRINGS.habitForm.freqInterval },
            ].map((f) => {
              const isActive = frequencyType === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => {
                    haptic.selection();
                    setFrequencyType(f.key as FrequencyType);
                  }}
                  style={[
                    styles.freqChip,
                    { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                    isActive && [
                      styles.freqChipActive,
                      { borderColor: colors.blue, backgroundColor: `${colors.blue}18` },
                    ],
                  ]}
                >
                  <Text
                    style={[
                      styles.freqChipText,
                      { color: isActive ? colors.blue : colors.textSecondary },
                      isActive && styles.freqChipTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Seçili Günler Çizelgesi */}
          {frequencyType === 'specific_days' && (
            <View style={styles.daysPickerRow}>
              {STRINGS.common.daysShort.map((dayName, idx) => {
                const dayNum = idx + 1;
                const isSelected = selectedDays.includes(dayNum);
                return (
                  <TouchableOpacity
                    key={dayName}
                    onPress={() => toggleDay(dayNum)}
                    style={[
                      styles.dayCircle,
                      { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                      isSelected && {
                        backgroundColor: color,
                        borderColor: color,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayCircleText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                        isSelected && styles.dayCircleTextActive,
                      ]}
                    >
                      {dayName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {frequencyType === 'interval' && (
            <AppInput
              label={STRINGS.habitForm.intervalDaysLabel}
              value={intervalDays}
              onChangeText={setIntervalDays}
              keyboardType="numeric"
            />
          )}
        </View>

        {/* 8. Seri Hedefi */}
        <AppInput
          label={STRINGS.habitForm.streakGoalLabel}
          value={streakGoal}
          onChangeText={setStreakGoal}
          keyboardType="numeric"
        />

        {/* 9. Hatırlatıcı Seçeneği */}
        <View style={styles.reminderSection}>
          <TouchableOpacity
            onPress={() => {
              haptic.selection();
              setHasReminder(!hasReminder);
            }}
            style={styles.reminderToggleRow}
          >
            <View
              style={[
                styles.reminderCheckbox,
                { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                hasReminder && [styles.reminderCheckboxActive, { backgroundColor: colors.blue, borderColor: colors.blue }],
              ]}
            >
              {hasReminder && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={[styles.reminderToggleLabel, { color: colors.textPrimary }]}>
              {STRINGS.habitForm.remindersLabel}
            </Text>
          </TouchableOpacity>

          {hasReminder && (
            <View style={styles.reminderTimeRow}>
              <AppInput
                label="Saat (HH:mm)"
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="09:00"
              />
            </View>
          )}
        </View>

        {/* Kaydet Butonu */}
        <AppButton
          title={initialHabit ? STRINGS.habitForm.updateHabit : STRINGS.habitForm.saveHabit}
          onPress={handleSave}
          size="lg"
          style={{ marginTop: SPACING.md }}
        />
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  form: {
    paddingBottom: SPACING.xl,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  typeTabActiveBuild: {},
  typeTabActiveQuit: {},
  typeTabText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  typeTabTextActive: {
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.xs,
  },
  horizontalScroll: {
    marginBottom: SPACING.md,
  },
  scrollList: {
    gap: 10,
    paddingVertical: 4,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipRow: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  chipActive: {},
  chipText: {
    ...TYPOGRAPHY.caption,
  },
  chipTextActive: {
    fontWeight: '700',
  },
  trackingModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  modeButtonActive: {},
  modeButtonText: {
    ...TYPOGRAPHY.caption,
  },
  modeButtonTextActive: {
    fontWeight: '700',
  },
  targetRow: {
    flexDirection: 'row',
  },
  freqRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.md,
  },
  freqChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  freqChipActive: {},
  freqChipText: {
    fontSize: 12,
  },
  freqChipTextActive: {
    fontWeight: '700',
  },
  daysPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayCircleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dayCircleTextActive: {
    fontWeight: '700',
  },
  reminderSection: {
    marginBottom: SPACING.lg,
  },
  reminderToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: SPACING.xs,
  },
  reminderCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderCheckboxActive: {},
  checkMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  reminderToggleLabel: {
    ...TYPOGRAPHY.body,
  },
  reminderTimeRow: {
    marginTop: SPACING.sm,
  },
});
