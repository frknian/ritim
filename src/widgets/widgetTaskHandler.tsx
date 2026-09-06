import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { getWidgetData, WidgetService } from '../services/widgetService';
import { HabbitTodayWidget } from './HabbitTodayWidget';
import { HabbitSummaryWidget } from './HabbitSummaryWidget';
import { HabbitChainWidget } from './HabbitChainWidget';
import { HabitRepository } from '../db/repositories/habitRepository';
import { EntryRepository } from '../db/repositories/entryRepository';
import { formatISODate } from '../utils/date';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetAction, widgetInfo, clickAction, clickActionData, renderWidget } = props;
  const todayISO = formatISODate();

  if (widgetAction === 'WIDGET_CLICK') {
    if (clickAction === 'TOGGLE_HABIT' && clickActionData?.habitId) {
      const habitId = String(clickActionData.habitId);
      const habit = HabitRepository.getById(habitId);

      if (habit) {
        const currentEntry = EntryRepository.getEntry(habitId, todayISO);
        const curVal = currentEntry ? currentEntry.value : 0;
        const curComp = currentEntry ? currentEntry.isCompleted : false;

        let newVal = curVal;
        let newComp = !curComp;

        if (habit.trackingMode === 'numeric' || habit.trackingMode === 'duration') {
          if (curComp) {
            // Tamamlanmışsa sıfırla
            newVal = 0;
            newComp = false;
          } else {
            // Değeri 1 birim artır
            newVal = curVal + 1;
            newComp = newVal >= habit.targetValue;
          }
        } else {
          // Boolean mod
          newComp = !curComp;
          newVal = newComp ? 1 : 0;
        }

        EntryRepository.upsertEntry(habitId, todayISO, newVal, newComp);

        // Ana ekrandaki tüm widget'ları senkronize et
        WidgetService.syncWidgets();
      }
    }
  }

  // Widget içeriğini hazırla ve render et
  const data = getWidgetData();

  switch (widgetInfo.widgetName) {
    case 'HabbitTodayWidget':
      renderWidget(
        <HabbitTodayWidget
          dateDisplay={data.dateDisplay}
          completedCount={data.completedCount}
          totalCount={data.totalCount}
          completionRate={data.completionRate}
          habits={data.widgetHabits}
        />
      );
      break;

    case 'HabbitSummaryWidget':
      renderWidget(
        <HabbitSummaryWidget
          completionRate={data.completionRate}
          completedCount={data.completedCount}
          totalCount={data.totalCount}
          remainingCount={data.remainingCount}
        />
      );
      break;

    case 'HabbitChainWidget':
      if (data.featuredHabit) {
        renderWidget(
          <HabbitChainWidget
            habitId={data.featuredHabit.id}
            habitName={data.featuredHabit.name}
            habitColor={data.featuredHabit.color}
            currentStreak={data.featuredHabit.currentStreak}
            streakGoal={data.featuredHabit.streakGoal}
            isCompletedToday={data.featuredHabit.isCompletedToday}
            chainDays={data.chainDays}
          />
        );
      }
      break;

    default:
      break;
  }
}
