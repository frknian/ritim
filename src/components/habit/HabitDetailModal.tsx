import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import Svg, { Rect, Line, Text as SvgText, Circle } from 'react-native-svg';
import {
  Flame,
  Trophy,
  Target,
  Edit3,
  Archive,
  Trash2,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Gift,
  Plus,
  Check,
  Award,
} from 'lucide-react-native';
import { AppModal } from '../common/AppModal';
import { AppButton } from '../common/AppButton';
import { AppIcon } from '../common/AppIcon';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, useThemeColors } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { HabitWithTodayEntry, HabitEntry, Reward } from '../../types';
import { EntryRepository } from '../../db/repositories/entryRepository';
import { RewardRepository } from '../../db/repositories/rewardRepository';
import { useHabitStore } from '../../store/useHabitStore';
import {
  formatISODate,
  formatTurkishMonthYear,
  getMonthMatrix,
  addDays,
  parseISODate,
} from '../../utils/date';
import { haptic } from '../../utils/haptics';

interface HabitDetailModalProps {
  visible: boolean;
  habit: HabitWithTodayEntry | null;
  onClose: () => void;
  onEdit: (habit: HabitWithTodayEntry) => void;
  onArchive: (habitId: string) => void;
  onDelete: (habitId: string) => void;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  visible,
  habit,
  onClose,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const colors = useThemeColors();
  const { setCustomEntry } = useHabitStore();

  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  // Takvim ayı gezintisi (Varsayılan: mevcut ay)
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  // Geçmiş gün düzenleme durumu
  const [editingDay, setEditingDay] = useState<{
    dateStr: string;
    isCompleted: boolean;
    value: number;
    notes: string;
  } | null>(null);

  // Ödül ekleme formu durumu
  const [showAddReward, setShowAddReward] = useState(false);
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardTarget, setNewRewardTarget] = useState('7');

  const reloadData = () => {
    if (!habit) return;
    const recent = EntryRepository.getEntriesForHabit(habit.id, 90);
    setEntries(recent);
    const rews = RewardRepository.getRewardsForHabit(habit.id);
    setRewards(rews);
  };

  useEffect(() => {
    if (habit && visible) {
      reloadData();
      setEditingDay(null);
      setShowAddReward(false);
      setCalendarMonth(new Date());
    }
  }, [habit, visible]);

  if (!habit) return null;

  const habitColor = habit.color || colors.blue;
  const todayStr = formatISODate();

  // Harita oluştur
  const entriesMap = new Map<string, HabitEntry>();
  entries.forEach((e) => entriesMap.set(e.entryDate, e));

  // --- 1. AY GEZİNTİSİ & TAKVİM MATRİSİ ---
  const currentYear = calendarMonth.getFullYear();
  const currentMonthIdx = calendarMonth.getMonth();
  const monthMatrix = getMonthMatrix(currentYear, currentMonthIdx);
  const monthTitle = formatTurkishMonthYear(calendarMonth);

  const handlePrevMonth = () => {
    haptic.selection();
    const prev = new Date(calendarMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCalendarMonth(prev);
    setEditingDay(null);
  };

  const handleNextMonth = () => {
    haptic.selection();
    const next = new Date(calendarMonth);
    next.setMonth(next.getMonth() + 1);
    setCalendarMonth(next);
    setEditingDay(null);
  };

  const handleSelectDay = (dateStr: string | null) => {
    if (!dateStr) return;
    haptic.light();
    const existing = entriesMap.get(dateStr);
    setEditingDay({
      dateStr,
      isCompleted: existing ? existing.isCompleted : false,
      value: existing ? existing.value : (habit.targetValue || 1),
      notes: existing?.notes || '',
    });
  };

  const handleSaveDayEdit = () => {
    if (!editingDay) return;
    haptic.success();
    setCustomEntry(habit.id, editingDay.dateStr, editingDay.value, editingDay.isCompleted);
    reloadData();
    setEditingDay(null);
  };

  // --- 2. GRAFİK VERİLERİ (Son 14 Gün) ---
  const chartDaysCount = 14;
  const chartData: { dateStr: string; label: string; isCompleted: boolean; val: number }[] = [];
  for (let i = chartDaysCount - 1; i >= 0; i--) {
    const dStr = addDays(todayStr, -i);
    const ent = entriesMap.get(dStr);
    const dObj = parseISODate(dStr);
    chartData.push({
      dateStr: dStr,
      label: String(dObj.getDate()),
      isCompleted: ent ? ent.isCompleted : false,
      val: ent ? ent.value : 0,
    });
  }

  const completedInChart = chartData.filter((d) => d.isCompleted).length;
  const chartSuccessRate = Math.round((completedInChart / chartDaysCount) * 100);

  // SVG Çizim boyutları
  const svgWidth = 320;
  const svgHeight = 100;
  const barWidth = 14;
  const chartMaxVal = Math.max(habit.targetValue, ...chartData.map((d) => d.val), 1);

  // --- 3. ÖDÜLLER İŞLEYİCİSİ ---
  const handleAddReward = () => {
    if (!newRewardTitle.trim()) return;
    const targetStreak = Math.max(1, parseInt(newRewardTarget, 10) || 7);
    RewardRepository.create({
      habitId: habit.id,
      title: newRewardTitle.trim(),
      streakTarget: targetStreak,
    });
    haptic.success();
    setNewRewardTitle('');
    setNewRewardTarget('7');
    setShowAddReward(false);
    reloadData();
  };

  const handleClaimReward = (rewardId: string) => {
    haptic.success();
    RewardRepository.claimReward(rewardId);
    reloadData();
    Alert.alert('Tebrikler! 🎉', 'Ödülünü başarıyla kullandın. Harika bir iş çıkardın!');
  };

  const handleArchive = () => {
    Alert.alert(
      STRINGS.habitDetail.archive,
      STRINGS.habitDetail.archiveConfirm,
      [
        { text: STRINGS.common.cancel, style: 'cancel' },
        {
          text: STRINGS.habitDetail.archive,
          onPress: () => {
            onArchive(habit.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      STRINGS.habitDetail.delete,
      STRINGS.habitDetail.deleteConfirm,
      [
        { text: STRINGS.common.cancel, style: 'cancel' },
        {
          text: STRINGS.habitDetail.delete,
          style: 'destructive',
          onPress: () => {
            onDelete(habit.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <AppModal visible={visible} onClose={onClose} title={habit.name}>
      <View style={styles.container}>
        {/* Üst Kart / Başlık Bilgisi */}
        <View style={styles.headerBox}>
          <View style={[styles.iconContainer, { backgroundColor: `${habitColor}20` }]}>
            <AppIcon name={habit.icon} size={28} color={habitColor} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{habit.name}</Text>
            {habit.description ? (
              <Text style={[styles.desc, { color: colors.textSecondary }]}>{habit.description}</Text>
            ) : null}
            {habit.areaName ? (
              <View style={[styles.areaPill, { borderColor: `${habitColor}40` }]}>
                <Text style={[styles.areaPillText, { color: habitColor }]}>{habit.areaName}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* 3'lü İstatistik Metrikleri */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface2, borderColor: colors.borderSubtle }]}>
            <Flame size={20} color={colors.amber} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{habit.currentStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{STRINGS.habitDetail.currentStreak}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface2, borderColor: colors.borderSubtle }]}>
            <Trophy size={20} color={colors.emerald} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{habit.longestStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{STRINGS.habitDetail.longestStreak}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface2, borderColor: colors.borderSubtle }]}>
            <Target size={20} color={colors.blue} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{habit.streakGoal}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{STRINGS.habitDetail.streakGoal}</Text>
          </View>
        </View>

        {/* --- 1. GRAFİK & PERFORMANS TRENDİ --- */}
        <View style={[styles.section, { backgroundColor: colors.surface2, borderColor: colors.borderSubtle }]}>
          <View style={styles.sectionHeaderBetween}>
            <View style={styles.sectionHeaderLeft}>
              <TrendingUp size={16} color={habitColor} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Performans Grafiği (14 Gün)</Text>
            </View>
            <Text style={[styles.chartRateBadge, { color: colors.emerald, backgroundColor: `${colors.emerald}20` }]}>
              %{chartSuccessRate} Başarı
            </Text>
          </View>

          {/* SVG Çizim Alanı */}
          <View style={styles.chartContainer}>
            <Svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
              {/* Yatay Kılavuz Çizgileri */}
              <Line x1="0" y1={svgHeight - 20} x2={svgWidth} y2={svgHeight - 20} stroke={colors.borderSubtle} strokeWidth="1" />
              <Line x1="0" y1="20" x2={svgWidth} y2="20" stroke={colors.borderSubtle} strokeWidth="1" strokeDasharray="4, 4" />

              {/* Sütunlar */}
              {chartData.map((d, idx) => {
                const x = idx * (svgWidth / chartDaysCount) + 4;
                const ratio = Math.min(1, Math.max(0.1, d.val / chartMaxVal));
                const barH = d.isCompleted ? Math.max(14, (svgHeight - 35) * ratio) : 8;
                const y = (svgHeight - 20) - barH;

                return (
                  <React.Fragment key={d.dateStr}>
                    <Rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barH}
                      rx={4}
                      fill={d.isCompleted ? habitColor : colors.surfaceElevated}
                    />
                    <SvgText
                      x={x + barWidth / 2}
                      y={svgHeight - 4}
                      fontSize="9"
                      fill={d.dateStr === todayStr ? colors.blue : colors.textMuted}
                      textAnchor="middle"
                      fontWeight={d.dateStr === todayStr ? 'bold' : 'normal'}
                    >
                      {d.label}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
          <Text style={[styles.chartFootnote, { color: colors.textMuted }]}>
            Son 14 günde {completedInChart} gün tamamlandı.
          </Text>
        </View>

        {/* --- 2. ÖZELLEŞTİRİLEBİLİR & İNTERAKTİF TAKVİM --- */}
        <View style={[styles.section, { backgroundColor: colors.surface2, borderColor: colors.borderSubtle }]}>
          <View style={styles.calendarHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Calendar size={16} color={habitColor} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{monthTitle}</Text>
            </View>

            <View style={styles.monthNavActions}>
              <TouchableOpacity onPress={handlePrevMonth} style={[styles.navIconButton, { backgroundColor: colors.surfaceElevated }]}>
                <ChevronLeft size={16} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNextMonth} style={[styles.navIconButton, { backgroundColor: colors.surfaceElevated }]}>
                <ChevronRight size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hafta Günleri Başlığı */}
          <View style={styles.weekDaysHeaderRow}>
            {STRINGS.common.daysShort.map((dName) => (
              <Text key={dName} style={[styles.weekDayHeaderCell, { color: colors.textMuted }]}>
                {dName}
              </Text>
            ))}
          </View>

          {/* Gün Matrisi */}
          <View style={styles.calendarGrid}>
            {monthMatrix.map((cell, idx) => {
              if (!cell.dateStr) {
                return <View key={`empty_${idx}`} style={styles.calendarCell} />;
              }

              const entry = entriesMap.get(cell.dateStr);
              const isDone = Boolean(entry?.isCompleted);
              const isToday = cell.dateStr === todayStr;
              const isSelected = editingDay?.dateStr === cell.dateStr;

              return (
                <TouchableOpacity
                  key={cell.dateStr}
                  onPress={() => handleSelectDay(cell.dateStr)}
                  activeOpacity={0.7}
                  style={[
                    styles.calendarCell,
                    isSelected && [styles.calendarCellSelected, { borderColor: habitColor }],
                    isToday && styles.calendarCellToday,
                  ]}
                >
                  <View
                    style={[
                      styles.dayDotIndicator,
                      { backgroundColor: colors.surfaceElevated },
                      isDone && { backgroundColor: habitColor },
                      isToday && !isDone && { borderColor: colors.blue, borderWidth: 1.5 },
                    ]}
                  >
                    {isDone ? (
                      <Check size={11} color="#FFFFFF" strokeWidth={3} />
                    ) : (
                      <Text style={[styles.calendarDayNum, { color: colors.textSecondary }]}>
                        {cell.dayNumber}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Gün Düzenleme Mini Paneli */}
          {editingDay && (
            <View style={[styles.dayEditPanel, { backgroundColor: colors.surfaceElevated, borderColor: habitColor }]}>
              <Text style={[styles.dayEditTitle, { color: colors.textPrimary }]}>
                📅 {editingDay.dateStr} Durumu
              </Text>

              <View style={styles.dayEditActions}>
                <TouchableOpacity
                  onPress={() => setEditingDay({ ...editingDay, isCompleted: !editingDay.isCompleted })}
                  style={[
                    styles.dayStatusToggle,
                    { backgroundColor: editingDay.isCompleted ? habitColor : colors.surface2 },
                  ]}
                >
                  <Text style={[styles.dayStatusToggleText, { color: editingDay.isCompleted ? '#FFFFFF' : colors.textSecondary }]}>
                    {editingDay.isCompleted ? '✓ Tamamlandı' : '✕ Yapılmadı'}
                  </Text>
                </TouchableOpacity>

                {habit.trackingMode !== 'boolean' && (
                  <View style={styles.dayValInputRow}>
                    <Text style={[styles.dayValLabel, { color: colors.textSecondary }]}>Değer:</Text>
                    <TextInput
                      style={[styles.dayValInput, { color: colors.textPrimary, backgroundColor: colors.surface2 }]}
                      keyboardType="numeric"
                      value={String(editingDay.value)}
                      onChangeText={(t) => setEditingDay({ ...editingDay, value: parseFloat(t) || 0 })}
                    />
                    <Text style={[styles.dayValUnit, { color: colors.textMuted }]}>{habit.unit || ''}</Text>
                  </View>
                )}
              </View>

              <View style={styles.dayEditFooter}>
                <TouchableOpacity
                  onPress={() => setEditingDay(null)}
                  style={[styles.miniCancelButton, { borderColor: colors.borderSubtle }]}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Vazgeç</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveDayEdit}
                  style={[styles.miniSaveButton, { backgroundColor: habitColor }]}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text style={[styles.calendarHint, { color: colors.textMuted }]}>
            Geçmiş günleri düzenlemek için takvimdeki bir güne dokunun.
          </Text>
        </View>

        {/* --- 3. HEDEF ÖDÜLLERİ SİSTEMİ --- */}
        <View style={[styles.section, { backgroundColor: colors.surface2, borderColor: colors.borderSubtle }]}>
          <View style={styles.sectionHeaderBetween}>
            <View style={styles.sectionHeaderLeft}>
              <Gift size={16} color={colors.amber} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Hedef Ödülleri</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                haptic.light();
                setShowAddReward(!showAddReward);
              }}
              style={[styles.addRewardToggle, { backgroundColor: colors.surfaceElevated }]}
            >
              <Plus size={14} color={colors.textPrimary} />
              <Text style={[styles.addRewardToggleText, { color: colors.textPrimary }]}>Ödül Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* Yeni Ödül Ekleme Formu */}
          {showAddReward && (
            <View style={[styles.addRewardBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <Text style={[styles.rewardInputLabel, { color: colors.textSecondary }]}>Ödül Başlığı:</Text>
              <TextInput
                style={[styles.rewardInput, { color: colors.textPrimary, backgroundColor: colors.surface2, borderColor: colors.borderSubtle }]}
                placeholder="ör. Kendine kahve ısmarla ☕"
                placeholderTextColor={colors.textMuted}
                value={newRewardTitle}
                onChangeText={setNewRewardTitle}
              />

              <Text style={[styles.rewardInputLabel, { color: colors.textSecondary, marginTop: 8 }]}>
                Gerekli Seri Hedefi (Gün):
              </Text>
              <TextInput
                style={[styles.rewardInput, { color: colors.textPrimary, backgroundColor: colors.surface2, borderColor: colors.borderSubtle }]}
                keyboardType="numeric"
                placeholder="7"
                placeholderTextColor={colors.textMuted}
                value={newRewardTarget}
                onChangeText={setNewRewardTarget}
              />

              <TouchableOpacity
                onPress={handleAddReward}
                style={[styles.rewardSaveButton, { backgroundColor: colors.amber }]}
              >
                <Text style={styles.rewardSaveButtonText}>Ödülü Tanımla</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Ödül Listesi */}
          {rewards.length === 0 ? (
            <Text style={[styles.emptyRewardText, { color: colors.textMuted }]}>
              Bu alışkanlık için henüz ödül tanımlanmadı. Hedefe ulaştığında kendini ödüllendir!
            </Text>
          ) : (
            rewards.map((rew) => {
              const isUnlocked = rew.isUnlocked || habit.currentStreak >= rew.streakTarget;
              const isClaimed = rew.isClaimed;
              const progressPct = Math.min(100, Math.round((habit.currentStreak / rew.streakTarget) * 100));

              return (
                <View
                  key={rew.id}
                  style={[
                    styles.rewardItemCard,
                    { backgroundColor: colors.surfaceElevated, borderColor: isUnlocked ? colors.amber : colors.borderSubtle },
                  ]}
                >
                  <View style={styles.rewardItemHeader}>
                    <View style={styles.rewardTitleCol}>
                      <Text style={[styles.rewardItemTitle, { color: colors.textPrimary }]}>{rew.title}</Text>
                      <Text style={[styles.rewardTargetText, { color: colors.textMuted }]}>
                        Hedef: {rew.streakTarget} Günlük Seri ({habit.currentStreak}/{rew.streakTarget})
                      </Text>
                    </View>

                    {isClaimed ? (
                      <View style={[styles.claimedBadge, { backgroundColor: `${colors.emerald}20` }]}>
                        <Check size={12} color={colors.emerald} />
                        <Text style={[styles.claimedBadgeText, { color: colors.emerald }]}>Alındı</Text>
                      </View>
                    ) : isUnlocked ? (
                      <TouchableOpacity
                        onPress={() => handleClaimReward(rew.id)}
                        style={[styles.claimButton, { backgroundColor: colors.amber }]}
                      >
                        <Award size={13} color="#080B10" />
                        <Text style={styles.claimButtonText}>Ödülü Al</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.lockedBadge, { backgroundColor: colors.surface2 }]}>
                        <Text style={[styles.lockedBadgeText, { color: colors.textMuted }]}>🔒 {rew.streakTarget - habit.currentStreak} gün</Text>
                      </View>
                    )}
                  </View>

                  {/* İlerleme Çubuğu */}
                  {!isClaimed && (
                    <View style={[styles.rewardProgressBar, { backgroundColor: colors.surface2 }]}>
                      <View
                        style={[
                          styles.rewardProgressFill,
                          {
                            width: `${progressPct}%`,
                            backgroundColor: isUnlocked ? colors.amber : habitColor,
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Aksiyon Butonları */}
        <View style={styles.actionButtons}>
          <AppButton
            title={STRINGS.habitDetail.edit}
            icon={<Edit3 size={18} color={colors.textPrimary} />}
            variant="secondary"
            onPress={() => {
              onEdit(habit);
              onClose();
            }}
            style={{ marginBottom: SPACING.sm }}
          />

          <View style={styles.dualActionsRow}>
            <View style={{ flex: 1, marginRight: SPACING.sm }}>
              <AppButton
                title={STRINGS.habitDetail.archive}
                icon={<Archive size={16} color={colors.textSecondary} />}
                variant="secondary"
                onPress={handleArchive}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppButton
                title={STRINGS.common.delete}
                icon={<Trash2 size={16} color={colors.rose} />}
                variant="destructive"
                onPress={handleDelete}
              />
            </View>
          </View>
        </View>
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.h2,
  },
  desc: {
    ...TYPOGRAPHY.body,
    marginTop: 2,
  },
  areaPill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  areaPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    marginTop: 4,
  },
  statLabel: {
    ...TYPOGRAPHY.tiny,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
  },
  chartRateBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
  },
  chartFootnote: {
    ...TYPOGRAPHY.tiny,
    textAlign: 'center',
    marginTop: 4,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  monthNavActions: {
    flexDirection: 'row',
    gap: 6,
  },
  navIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDaysHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 4,
  },
  weekDayHeaderCell: {
    width: 38,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarCell: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 8,
  },
  calendarCellSelected: {
    borderWidth: 1.5,
  },
  calendarCellToday: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  dayDotIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayNum: {
    fontSize: 11,
    fontWeight: '500',
  },
  calendarHint: {
    ...TYPOGRAPHY.tiny,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  dayEditPanel: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  dayEditTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  dayEditActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dayStatusToggle: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
  },
  dayStatusToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dayValInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dayValLabel: {
    fontSize: 12,
  },
  dayValInput: {
    width: 50,
    height: 32,
    borderRadius: 6,
    textAlign: 'center',
    padding: 0,
    fontSize: 12,
    fontWeight: '600',
  },
  dayValUnit: {
    fontSize: 11,
  },
  dayEditFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: SPACING.sm,
  },
  miniCancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  miniSaveButton: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  addRewardToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  addRewardToggleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addRewardBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  rewardInputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardInput: {
    height: 38,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    fontSize: 13,
  },
  rewardSaveButton: {
    marginTop: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  rewardSaveButtonText: {
    color: '#080B10',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyRewardText: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
  },
  rewardItemCard: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  rewardItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  rewardItemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  rewardTargetText: {
    fontSize: 11,
    marginTop: 2,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  claimedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  claimButtonText: {
    color: '#080B10',
    fontWeight: '700',
    fontSize: 11,
  },
  lockedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  rewardProgressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  rewardProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionButtons: {
    marginTop: SPACING.md,
  },
  dualActionsRow: {
    flexDirection: 'row',
  },
});
