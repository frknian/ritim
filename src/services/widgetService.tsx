import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { HabitRepository } from '../db/repositories/habitRepository';
import { EntryRepository } from '../db/repositories/entryRepository';
import { SettingsRepository } from '../db/repositories/settingsRepository';
import { formatISODate, formatTurkishDisplayDate, getWeekDays } from '../utils/date';
import { HabbitTodayWidget, WidgetHabitItem } from '../widgets/HabbitTodayWidget';
import { HabbitSummaryWidget } from '../widgets/HabbitSummaryWidget';
import { HabbitChainWidget, ChainDayItem } from '../widgets/HabbitChainWidget';

export function getWidgetData() {
  const todayISO = formatISODate();
  const habitsWithEntries = HabitRepository.getTodayHabitsWithEntries(todayISO);
  const settings = SettingsRepository.getSettings();

  const totalCount = habitsWithEntries.length;
  const completedCount = habitsWithEntries.filter((h) => h.isCompletedToday).length;
  const remainingCount = Math.max(0, totalCount - completedCount);
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Kısa Türkçe tarih gösterimi: ör. "5 Eylül"
  const fullDate = formatTurkishDisplayDate();
  const dateParts = fullDate.split(' ');
  const dateDisplay = dateParts.length >= 2 ? `${dateParts[0]} ${dateParts[1]}` : fullDate;

  const widgetHabits: WidgetHabitItem[] = habitsWithEntries.map((h) => ({
    id: h.id,
    name: h.name,
    color: h.color,
    currentValue: h.currentValue,
    targetValue: h.targetValue,
    unit: h.unit,
    isCompleted: h.isCompletedToday,
    type: h.type,
  }));

  // Zinciri Kırma Widget için alışkanlık seçimi (Kullanıcı ayarından veya en yüksek seriye sahip olan)
  let featuredHabit = settings.widgetHabitId
    ? habitsWithEntries.find((h) => h.id === settings.widgetHabitId)
    : null;

  if (!featuredHabit && habitsWithEntries.length > 0) {
    // En yüksek serili alışkanlık
    featuredHabit = [...habitsWithEntries].sort((a, b) => b.currentStreak - a.currentStreak)[0];
  }

  const weekDayLetters = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];
  const weekDays = getWeekDays();
  const chainDays: ChainDayItem[] = [];

  if (featuredHabit) {
    const habitEntries = EntryRepository.getEntriesForHabit(featuredHabit.id, 14);
    const entryMap = new Map<string, boolean>();
    habitEntries.forEach((e) => entryMap.set(e.entryDate, e.isCompleted));

    weekDays.forEach((dStr, idx) => {
      const isToday = dStr === todayISO;
      const isPast = dStr < todayISO;
      const isCompleted = isToday
        ? Boolean(featuredHabit?.isCompletedToday)
        : Boolean(entryMap.get(dStr));

      chainDays.push({
        dayLabel: weekDayLetters[idx] || 'G',
        dateStr: dStr,
        isCompleted,
        isToday,
        isPast,
      });
    });
  }

  return {
    todayISO,
    dateDisplay,
    totalCount,
    completedCount,
    remainingCount,
    completionRate,
    widgetHabits,
    featuredHabit: featuredHabit || null,
    chainDays,
  };
}

export const WidgetService = {
  syncWidgets() {
    try {
      const data = getWidgetData();

      // 1. Günlük Alışkanlıklar Widget'ı
      requestWidgetUpdate({
        widgetName: 'HabbitTodayWidget',
        renderWidget: () => (
          <HabbitTodayWidget
            dateDisplay={data.dateDisplay}
            completedCount={data.completedCount}
            totalCount={data.totalCount}
            completionRate={data.completionRate}
            habits={data.widgetHabits}
          />
        ),
      });

      // 2. Günlük İlerleme Özeti Widget'ı
      requestWidgetUpdate({
        widgetName: 'HabbitSummaryWidget',
        renderWidget: () => (
          <HabbitSummaryWidget
            completionRate={data.completionRate}
            completedCount={data.completedCount}
            totalCount={data.totalCount}
            remainingCount={data.remainingCount}
          />
        ),
      });

      // 3. Zinciri Kırma Widget'ı
      if (data.featuredHabit) {
        requestWidgetUpdate({
          widgetName: 'HabbitChainWidget',
          renderWidget: () => (
            <HabbitChainWidget
              habitId={data.featuredHabit!.id}
              habitName={data.featuredHabit!.name}
              habitColor={data.featuredHabit!.color}
              currentStreak={data.featuredHabit!.currentStreak}
              streakGoal={data.featuredHabit!.streakGoal}
              isCompletedToday={data.featuredHabit!.isCompletedToday}
              chainDays={data.chainDays}
            />
          ),
        });
      }
    } catch (e) {
      console.warn('[WidgetService] syncWidgets error:', e);
    }
  },
};
