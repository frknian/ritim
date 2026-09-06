/**
 * Habbit Domain ve Veri Tipleri
 */

export type HabitType = 'build' | 'quit';

export type TrackingMode = 'boolean' | 'numeric' | 'duration';

export type FrequencyType =
  | 'daily'
  | 'specific_days'
  | 'weekdays'
  | 'weekends'
  | 'x_per_week'
  | 'x_per_month'
  | 'interval';

export interface FrequencyConfig {
  days?: number[];         // 1 = Pazartesi, ..., 7 = Pazar
  target_times?: number;   // Haftada veya ayda X kez için
  interval_days?: number;  // N günde bir için
}

export interface Area {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  areaId: string | null;
  type: HabitType;
  name: string;
  description?: string;
  icon: string;
  color: string;
  trackingMode: TrackingMode;
  targetValue: number;
  unit?: string;
  frequencyType: FrequencyType;
  frequencyConfig: FrequencyConfig;
  streakGoal: number;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface HabitReminder {
  id: string;
  habitId: string;
  timeOfDay: string; // 'HH:mm'
  daysOfWeek: number[]; // [1, 2, 3, 4, 5, 6, 7]
  isEnabled: boolean;
  notificationId?: string;
  createdAt: string;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  entryDate: string; // 'YYYY-MM-DD'
  value: number;
  isCompleted: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitWithTodayEntry extends Habit {
  currentValue: number;
  isCompletedToday: boolean;
  todayNotes?: string;
  currentStreak: number;
  longestStreak: number;
  areaName?: string;
  areaColor?: string;
}

export interface AreaWithStats extends Area {
  activeHabitCount: number;
  weeklyCompletionRate: number; // 0-100
  monthlyCompletionRate: number; // 0-100
}

export interface Reward {
  id: string;
  habitId?: string | null;
  title: string;
  streakTarget: number;
  isUnlocked: boolean;
  isClaimed: boolean;
  claimedAt?: string | null;
  createdAt: string;
}

export interface UserSettings {
  dailyReviewEnabled: boolean;
  dailyReviewTime: string; // '21:30'
  compactMode: boolean;
  dashboardSections: string[];
  theme: 'dark' | 'light';
  vibrationEnabled: boolean;
  vibrationIntensity: 'light' | 'medium' | 'heavy';
  notificationsEnabled: boolean;
  showStreakInNotification: boolean;
  widgetHabitId?: string | null;
}

export interface StatisticsOverview {
  completionRate: number;
  currentStreakMax: number;
  longestStreakEver: number;
  totalCompletions: number;
  bestDayOfWeek: string;
  weeklyConsistency: { day: string; rate: number }[];
}

export interface DayHabitSummary {
  date: string;
  totalScheduled: number;
  completedCount: number;
  rate: number;
}
