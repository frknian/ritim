import { create } from 'zustand';
import { HabitWithTodayEntry, Habit, HabitType } from '../types';
import { HabitRepository } from '../db/repositories/habitRepository';
import { EntryRepository } from '../db/repositories/entryRepository';
import { RewardRepository } from '../db/repositories/rewardRepository';
import { formatISODate } from '../utils/date';
import { haptic } from '../utils/haptics';
import { NotificationService } from '../services/notificationService';
import { WidgetService } from '../services/widgetService';

interface HabitState {
  todayHabits: HabitWithTodayEntry[];
  archivedHabits: Habit[];
  monthEntries: Record<string, Record<string, boolean>>;
  selectedAreaId: string | null;
  selectedTypeFilter: 'all' | 'build' | 'quit';
  loading: boolean;

  // Eylemler
  loadTodayHabits: (date?: string) => void;
  loadMonthEntries: (year?: number, monthIndex?: number) => void;
  loadArchivedHabits: () => void;
  setSelectedAreaId: (areaId: string | null) => void;
  setSelectedTypeFilter: (filter: 'all' | 'build' | 'quit') => void;

  // Alışkanlık İlerleme / Tamamlama Eylemleri (Optimistic)
  toggleCompletion: (habitId: string, date?: string) => void;
  toggleDay: (habitId: string, dateStr: string) => void;
  incrementValue: (habitId: string, amount: number, date?: string) => void;
  logQuitRelapse: (habitId: string, note?: string, date?: string) => void;
  revertEntry: (habitId: string, previousValue: number, previousCompleted: boolean, date?: string) => void;
  setCustomEntry: (habitId: string, date: string, value: number, isCompleted: boolean) => void;

  // CRUD Eylemleri
  createHabit: (
    habit: Omit<Habit, 'createdAt' | 'updatedAt'>,
    reminders?: { timeOfDay: string; daysOfWeek: number[] }[]
  ) => Promise<void>;
  updateHabit: (
    habit: Partial<Habit> & { id: string },
    reminders?: { timeOfDay: string; daysOfWeek: number[] }[]
  ) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  restoreHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  todayHabits: [],
  archivedHabits: [],
  monthEntries: {},
  selectedAreaId: null,
  selectedTypeFilter: 'all',
  loading: false,

  loadTodayHabits: (date = formatISODate()) => {
    try {
      const habits = HabitRepository.getTodayHabitsWithEntries(date);
      set({ todayHabits: habits });
      get().loadMonthEntries();
      WidgetService.syncWidgets();
    } catch (error) {
      console.error('Alışkanlıklar yüklenirken hata:', error);
    }
  },

  loadMonthEntries: (year?: number, monthIndex?: number) => {
    try {
      const now = new Date();
      const y = year ?? now.getFullYear();
      const m = monthIndex ?? now.getMonth();
      const startDate = `${y}-${String(m + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(y, m + 1, 0).getDate();
      const endDate = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const entries = EntryRepository.getEntriesInDateRange(startDate, endDate);
      const mapping: Record<string, Record<string, boolean>> = {};

      for (const ent of entries) {
        if (!mapping[ent.habitId]) mapping[ent.habitId] = {};
        mapping[ent.habitId][ent.entryDate] = ent.isCompleted;
      }

      set({ monthEntries: mapping });
    } catch (error) {
      console.error('Ay kayıtları yüklenemedi:', error);
    }
  },

  loadArchivedHabits: () => {
    try {
      const archived = HabitRepository.getAllArchived();
      set({ archivedHabits: archived });
    } catch (error) {
      console.error('Arşiv yüklenirken hata:', error);
    }
  },

  setSelectedAreaId: (areaId: string | null) => {
    haptic.selection();
    set({ selectedAreaId: areaId });
  },

  setSelectedTypeFilter: (filter: 'all' | 'build' | 'quit') => {
    haptic.selection();
    set({ selectedTypeFilter: filter });
  },

  toggleCompletion: (habitId: string, date = formatISODate()) => {
    const currentList = get().todayHabits;
    const target = currentList.find((h) => h.id === habitId);
    if (!target) return;

    const newCompleted = !target.isCompletedToday;
    const newValue = newCompleted
      ? Math.max(target.targetValue, target.currentValue || 1)
      : 0;

    // Haptic geri bildirim
    if (newCompleted) {
      haptic.success();
    } else {
      haptic.light();
    }

    // İyimser UI güncellemesi
    set({
      todayHabits: currentList.map((h) => {
        if (h.id === habitId) {
          const streakDelta = newCompleted ? 1 : Math.max(0, h.currentStreak - 1);
          return {
            ...h,
            isCompletedToday: newCompleted,
            currentValue: newValue,
            currentStreak: newCompleted ? h.currentStreak + 1 : streakDelta,
          };
        }
        return h;
      }),
    });

    // Veritabanına kaydet
    try {
      EntryRepository.upsertEntry(habitId, date, newValue, newCompleted);
      WidgetService.syncWidgets();

      if (newCompleted) {
        const newStreak = target.currentStreak + 1;
        const unlocked = RewardRepository.checkAndUnlockRewards(habitId, newStreak);
        unlocked.forEach((rew) => {
          NotificationService.sendMilestoneUnlockedNotification(target.name, rew.title, newStreak);
        });
      }
    } catch (error) {
      console.error('Tamamlama durumu kaydedilemedi:', error);
      // Hata durumunda yeniden yükle
      get().loadTodayHabits(date);
    }
  },

  toggleDay: (habitId: string, dateStr: string) => {
    const currentMapping = get().monthEntries;
    const currentCompleted = Boolean(currentMapping[habitId]?.[dateStr]);
    const newCompleted = !currentCompleted;

    if (newCompleted) {
      haptic.success();
    } else {
      haptic.light();
    }

    // İyimser ay verisi güncellemesi
    const updatedHabitEntries = { ...(currentMapping[habitId] || {}), [dateStr]: newCompleted };
    const updatedMapping = { ...currentMapping, [habitId]: updatedHabitEntries };
    set({ monthEntries: updatedMapping });

    const todayISO = formatISODate();
    if (dateStr === todayISO) {
      // Eğer bugünün günü tıklandıysa todayHabits listesini de güncelle
      const currentList = get().todayHabits;
      set({
        todayHabits: currentList.map((h) => {
          if (h.id === habitId) {
            return {
              ...h,
              isCompletedToday: newCompleted,
              currentStreak: newCompleted ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1),
            };
          }
          return h;
        }),
      });
    }

    try {
      const habit = HabitRepository.getById(habitId);
      const targetVal = habit?.targetValue || 1;
      EntryRepository.upsertEntry(habitId, dateStr, newCompleted ? targetVal : 0, newCompleted);
      WidgetService.syncWidgets();

      if (newCompleted) {
        const targetHabit = get().todayHabits.find((h) => h.id === habitId);
        if (targetHabit) {
          const unlocked = RewardRepository.checkAndUnlockRewards(habitId, targetHabit.currentStreak);
          unlocked.forEach((rew) => {
            NotificationService.sendMilestoneUnlockedNotification(targetHabit.name, rew.title, targetHabit.currentStreak);
          });
        }
      }
    } catch (error) {
      console.error('Gün durumu kaydedilemedi:', error);
      get().loadMonthEntries();
      get().loadTodayHabits();
    }
  },

  incrementValue: (habitId: string, amount: number, date = formatISODate()) => {
    const currentList = get().todayHabits;
    const target = currentList.find((h) => h.id === habitId);
    if (!target) return;

    const newValue = Math.max(0, (target.currentValue || 0) + amount);
    const newCompleted = newValue >= target.targetValue;

    if (newCompleted && !target.isCompletedToday) {
      haptic.success();
    } else {
      haptic.light();
    }

    // İyimser güncelleme
    set({
      todayHabits: currentList.map((h) => {
        if (h.id === habitId) {
          const streakDelta = newCompleted && !h.isCompletedToday ? h.currentStreak + 1 : h.currentStreak;
          return {
            ...h,
            currentValue: newValue,
            isCompletedToday: newCompleted,
            currentStreak: streakDelta,
          };
        }
        return h;
      }),
    });

    // DB kaydı
    try {
      EntryRepository.upsertEntry(habitId, date, newValue, newCompleted);
      WidgetService.syncWidgets();

      if (newCompleted && !target.isCompletedToday) {
        const newStreak = target.currentStreak + 1;
        const unlocked = RewardRepository.checkAndUnlockRewards(habitId, newStreak);
        unlocked.forEach((rew) => {
          NotificationService.sendMilestoneUnlockedNotification(target.name, rew.title, newStreak);
        });
      }
    } catch (error) {
      console.error('Sayaç değeri kaydedilemedi:', error);
      get().loadTodayHabits(date);
    }
  },

  revertEntry: (habitId: string, previousValue: number, previousCompleted: boolean, date = formatISODate()) => {
    haptic.medium();
    try {
      EntryRepository.upsertEntry(habitId, date, previousValue, previousCompleted);
      get().loadTodayHabits(date);
      WidgetService.syncWidgets();
    } catch (error) {
      console.error('İşlem geri alınamadı:', error);
    }
  },

  setCustomEntry: (habitId: string, date: string, value: number, isCompleted: boolean) => {
    haptic.light();
    try {
      EntryRepository.upsertEntry(habitId, date, value, isCompleted);
      get().loadTodayHabits();
      WidgetService.syncWidgets();
    } catch (error) {
      console.error('Özel gün kaydı yapılamadı:', error);
    }
  },

  logQuitRelapse: (habitId: string, note?: string, date = formatISODate()) => {
    haptic.warning();
    try {
      // Nüksetme: is_completed = 0 ve value = 1 ile işaretlenir
      EntryRepository.upsertEntry(habitId, date, 1, false, note || 'Nüksetti');
      get().loadTodayHabits(date);
    } catch (error) {
      console.error('Nüksetme kaydedilemedi:', error);
    }
  },

  createHabit: async (habit, reminders) => {
    try {
      HabitRepository.create(habit, reminders);

      // Hatırlatıcıları zamanla
      if (reminders && reminders.length > 0) {
        for (const rem of reminders) {
          await NotificationService.scheduleHabitReminder(
            habit.id,
            habit.name,
            rem.timeOfDay,
            rem.daysOfWeek
          );
        }
      }

      get().loadTodayHabits();
    } catch (error) {
      console.error('Alışkanlık oluşturulamadı:', error);
      throw error;
    }
  },

  updateHabit: async (habit, reminders) => {
    try {
      HabitRepository.update(habit, reminders);

      // Eski alarmları iptal et, yenilerini kur
      await NotificationService.cancelHabitReminders(habit.id);
      if (reminders && reminders.length > 0) {
        const habitName = habit.name || 'Alışkanlık';
        for (const rem of reminders) {
          await NotificationService.scheduleHabitReminder(
            habit.id,
            habitName,
            rem.timeOfDay,
            rem.daysOfWeek
          );
        }
      }

      get().loadTodayHabits();
    } catch (error) {
      console.error('Alışkanlık güncellenemedi:', error);
      throw error;
    }
  },

  archiveHabit: async (id: string) => {
    try {
      haptic.warning();
      HabitRepository.archive(id);
      await NotificationService.cancelHabitReminders(id);
      get().loadTodayHabits();
      get().loadArchivedHabits();
    } catch (error) {
      console.error('Alışkanlık arşivlenemedi:', error);
    }
  },

  restoreHabit: async (id: string) => {
    try {
      haptic.success();
      HabitRepository.restore(id);
      get().loadTodayHabits();
      get().loadArchivedHabits();
    } catch (error) {
      console.error('Alışkanlık geri yüklenemedi:', error);
    }
  },

  deleteHabit: async (id: string) => {
    try {
      haptic.warning();
      HabitRepository.delete(id);
      await NotificationService.cancelHabitReminders(id);
      get().loadTodayHabits();
      get().loadArchivedHabits();
    } catch (error) {
      console.error('Alışkanlık silinemedi:', error);
    }
  },
}));
