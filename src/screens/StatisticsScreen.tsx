import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Award, Flame, CheckCircle2, TrendingUp, Calendar, Zap } from 'lucide-react-native';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { AppHeader } from '../components/common/AppHeader';
import { ProgressBar } from '../components/common/ProgressBar';
import { RADIUS, SPACING, TYPOGRAPHY, useThemeColors } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import { getDatabase } from '../db/client';
import { HabitRepository } from '../db/repositories/habitRepository';
import { EntryRepository } from '../db/repositories/entryRepository';
import { StreakEngine } from '../services/streakEngine';
import { formatISODate, addDays, parseISODate } from '../utils/date';
import { Habit } from '../types';
import { haptic } from '../utils/haptics';

type PeriodType = '7days' | '30days' | 'month' | 'year' | 'all';

interface StatisticsScreenProps {
  onBack?: () => void;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ onBack }) => {
  const colors = useThemeColors();
  const [period, setPeriod] = useState<PeriodType>('30days');
  const [completionRate, setCompletionRate] = useState(0);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [maxCurrentStreak, setMaxCurrentStreak] = useState(0);
  const [maxLongestStreak, setMaxLongestStreak] = useState(0);
  const [bestDayName, setBestDayName] = useState('Pazartesi');
  const [weekdayRates, setWeekdayRates] = useState<{ day: string; rate: number; count: number }[]>([]);
  const [habitRankings, setHabitRankings] = useState<{ habit: Habit; completedCount: number; rate: number }[]>([]);

  useEffect(() => {
    calculateStatistics(period);
  }, [period]);

  const calculateStatistics = (selectedPeriod: PeriodType) => {
    const db = getDatabase();
    const today = new Date();
    const todayStr = formatISODate(today);
    let startDate = addDays(todayStr, -30);

    if (selectedPeriod === '7days') {
      startDate = addDays(todayStr, -7);
    } else if (selectedPeriod === '30days') {
      startDate = addDays(todayStr, -30);
    } else if (selectedPeriod === 'month') {
      startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    } else if (selectedPeriod === 'year') {
      startDate = `${today.getFullYear()}-01-01`;
    } else if (selectedPeriod === 'all') {
      startDate = '2020-01-01';
    }

    // 1. Genel Tamamlanma Oranı ve Toplam Tamamlama
    const entries = EntryRepository.getEntriesInDateRange(startDate, todayStr);
    const completedEntries = entries.filter((e) => e.isCompleted);
    setTotalCompletions(completedEntries.length);

    const habits = HabitRepository.getAllActive();
    if (entries.length > 0) {
      setCompletionRate(Math.round((completedEntries.length / entries.length) * 100));
    } else {
      setCompletionRate(0);
    }

    // 2. Maksimum Mevcut ve Rekor Seri
    let maxCur = 0;
    let maxLong = 0;
    for (const h of habits) {
      const stats = StreakEngine.calculateStreaks(h.id);
      if (stats.currentStreak > maxCur) maxCur = stats.currentStreak;
      if (stats.longestStreak > maxLong) maxLong = stats.longestStreak;
    }
    setMaxCurrentStreak(maxCur);
    setMaxLongestStreak(maxLong);

    // 3. Haftanın En İyi Günü ve Günlük Dağılım
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Pzt..Paz
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];

    for (const e of entries) {
      const d = parseISODate(e.entryDate);
      const dayIdx = (d.getDay() + 6) % 7; // Pzt=0 .. Paz=6
      dayTotals[dayIdx]++;
      if (e.isCompleted) dayCounts[dayIdx]++;
    }

    const rates = STRINGS.common.daysShort.map((name, idx) => {
      const tot = dayTotals[idx];
      const comp = dayCounts[idx];
      const r = tot > 0 ? Math.round((comp / tot) * 100) : 0;
      return { day: name, rate: r, count: comp };
    });
    setWeekdayRates(rates);

    let bestIdx = 0;
    let maxRate = -1;
    rates.forEach((item, idx) => {
      if (item.rate > maxRate && dayTotals[idx] > 0) {
        maxRate = item.rate;
        bestIdx = idx;
      }
    });
    setBestDayName(STRINGS.common.daysFull[bestIdx]);

    // 4. Alışkanlık Bazında Sıralama
    const habitStats = habits.map((h) => {
      const habitEntries = entries.filter((e) => e.habitId === h.id);
      const done = habitEntries.filter((e) => e.isCompleted).length;
      const rate = habitEntries.length > 0 ? Math.round((done / habitEntries.length) * 100) : 0;
      return { habit: h, completedCount: done, rate };
    });

    habitStats.sort((a, b) => b.rate - a.rate);
    setHabitRankings(habitStats);
  };

  const periods: { key: PeriodType; label: string }[] = [
    { key: '7days', label: STRINGS.statistics.period7Days },
    { key: '30days', label: STRINGS.statistics.period30Days },
    { key: 'month', label: STRINGS.statistics.periodMonth },
    { key: 'year', label: STRINGS.statistics.periodYear },
    { key: 'all', label: STRINGS.statistics.periodAll },
  ];

  return (
    <ScreenContainer>
      <AppHeader
        title={STRINGS.statistics.title}
        showBack={!!onBack}
        onBack={onBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Dönem Seçici Çipler */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.periodRow}
        >
          {periods.map((p) => {
            const isActive = period === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                onPress={() => {
                  haptic.selection();
                  setPeriod(p.key);
                }}
                style={[
                  styles.periodChip,
                  { backgroundColor: colors.surface1, borderColor: colors.borderSubtle },
                  isActive && [styles.periodChipActive, { backgroundColor: colors.surfaceElevated, borderColor: colors.blue }],
                ]}
              >
                <Text
                  style={[
                    styles.periodText,
                    { color: isActive ? colors.blue : colors.textSecondary },
                    isActive && styles.periodTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 4'lü Temel Metrik Kartları */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: colors.surface1, borderColor: colors.borderSubtle }]}>
            <View style={[styles.metricIconBox, { backgroundColor: `${colors.blue}20` }]}>
              <TrendingUp size={20} color={colors.blue} />
            </View>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>%{completionRate}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{STRINGS.statistics.completionRate}</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surface1, borderColor: colors.borderSubtle }]}>
            <View style={[styles.metricIconBox, { backgroundColor: `${colors.amber}20` }]}>
              <Flame size={20} color={colors.amber} />
            </View>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{STRINGS.common.dayCount(maxCurrentStreak)}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{STRINGS.statistics.currentStreak}</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surface1, borderColor: colors.borderSubtle }]}>
            <View style={[styles.metricIconBox, { backgroundColor: `${colors.emerald}20` }]}>
              <Award size={20} color={colors.emerald} />
            </View>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{STRINGS.common.dayCount(maxLongestStreak)}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{STRINGS.statistics.longestStreak}</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.surface1, borderColor: colors.borderSubtle }]}>
            <View style={[styles.metricIconBox, { backgroundColor: `${colors.violet}20` }]}>
              <CheckCircle2 size={20} color={colors.violet} />
            </View>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{totalCompletions}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{STRINGS.statistics.totalCompletions}</Text>
          </View>
        </View>

        {/* En Başarılı Gün Vurgu Kartı */}
        <View style={[styles.highlightCard, { backgroundColor: colors.surface1, borderColor: colors.borderSubtle }]}>
          <View style={styles.highlightLeft}>
            <Zap size={22} color={colors.amber} />
            <View>
              <Text style={[styles.highlightTitle, { color: colors.textMuted }]}>{STRINGS.statistics.bestDay}</Text>
              <Text style={[styles.highlightDay, { color: colors.textPrimary }]}>{bestDayName}</Text>
            </View>
          </View>
        </View>

        {/* Haftalık Tutarlılık Dağılımı (Bar Chart) */}
        <View style={[styles.chartCard, { backgroundColor: colors.surface1, borderColor: colors.borderSubtle }]}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>{STRINGS.statistics.weeklyConsistency}</Text>
          <View style={styles.barChartContainer}>
            {weekdayRates.map((item) => (
              <View key={item.day} style={styles.barColumn}>
                <View style={[styles.barTrack, { backgroundColor: colors.surface2 }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${Math.max(8, item.rate)}%`,
                        backgroundColor: item.rate >= 70 ? colors.emerald : colors.blue,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{item.day}</Text>
                <Text style={[styles.barPercent, { color: colors.textMuted }]}>%{item.rate}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Alışkanlık Bazında Sıralama */}
        <View style={[styles.rankingCard, { backgroundColor: colors.surface1, borderColor: colors.borderSubtle }]}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>{STRINGS.statistics.habitsOverview}</Text>
          {habitRankings.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{STRINGS.statistics.noDataForPeriod}</Text>
          ) : (
            <View style={styles.rankingList}>
              {habitRankings.map((item) => (
                <View
                  key={item.habit.id}
                  style={[
                    styles.rankingItem,
                    { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                  ]}
                >
                  <View style={styles.rankingHeader}>
                    <Text style={[styles.rankingName, { color: colors.textPrimary }]}>{item.habit.name}</Text>
                    <Text style={[styles.rankingRate, { color: colors.blue }]}>%{item.rate}</Text>
                  </View>
                  <ProgressBar
                    progress={item.rate}
                    color={item.habit.color || colors.blue}
                    height={5}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 90,
  },
  periodRow: {
    gap: 8,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  periodChipActive: {},
  periodText: {
    ...TYPOGRAPHY.caption,
  },
  periodTextActive: {
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    width: '48%',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  metricValue: {
    ...TYPOGRAPHY.h2,
  },
  metricLabel: {
    ...TYPOGRAPHY.tiny,
    marginTop: 2,
  },
  highlightCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  highlightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightTitle: {
    ...TYPOGRAPHY.tiny,
    textTransform: 'uppercase',
  },
  highlightDay: {
    ...TYPOGRAPHY.h2,
    marginTop: 2,
  },
  chartCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: SPACING.md,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 14,
    height: 90,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barLabel: {
    ...TYPOGRAPHY.tiny,
    marginTop: 6,
  },
  barPercent: {
    fontSize: 9,
    marginTop: 2,
  },
  rankingCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
  },
  rankingList: {
    gap: 12,
  },
  rankingItem: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
  },
  rankingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rankingName: {
    ...TYPOGRAPHY.body,
  },
  rankingRate: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  emptyText: {
    ...TYPOGRAPHY.body,
  },
});
