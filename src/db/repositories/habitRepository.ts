import { getDatabase } from '../client';
import {
  Habit,
  HabitWithTodayEntry,
  HabitReminder,
  HabitType,
  TrackingMode,
  FrequencyType,
} from '../../types';
import { formatISODate } from '../../utils/date';
import { StreakEngine } from '../../services/streakEngine';

interface RawHabitRow {
  id: string;
  area_id: string | null;
  type: HabitType;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  tracking_mode: TrackingMode;
  target_value: number;
  unit: string | null;
  frequency_type: FrequencyType;
  frequency_config: string;
  streak_goal: number;
  is_archived: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function mapHabitRow(row: RawHabitRow): Habit {
  let freqConfig = {};
  try {
    freqConfig = JSON.parse(row.frequency_config || '{}');
  } catch {
    freqConfig = {};
  }

  return {
    id: row.id,
    areaId: row.area_id,
    type: row.type,
    name: row.name,
    description: row.description || undefined,
    icon: row.icon,
    color: row.color,
    trackingMode: row.tracking_mode,
    targetValue: row.target_value,
    unit: row.unit || undefined,
    frequencyType: row.frequency_type,
    frequencyConfig: freqConfig,
    streakGoal: row.streak_goal,
    isArchived: row.is_archived === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const HabitRepository = {
  getAllActive(): Habit[] {
    const db = getDatabase();
    const rows = db.getAllSync<RawHabitRow>(
      'SELECT * FROM habits WHERE is_archived = 0 ORDER BY sort_order ASC, created_at ASC;'
    );
    return rows.map(mapHabitRow);
  },

  getAllArchived(): Habit[] {
    const db = getDatabase();
    const rows = db.getAllSync<RawHabitRow>(
      'SELECT * FROM habits WHERE is_archived = 1 ORDER BY updated_at DESC;'
    );
    return rows.map(mapHabitRow);
  },

  getById(id: string): Habit | null {
    const db = getDatabase();
    const row = db.getFirstSync<RawHabitRow>(
      'SELECT * FROM habits WHERE id = ?;',
      [id]
    );
    return row ? mapHabitRow(row) : null;
  },

  getTodayHabitsWithEntries(date: string = formatISODate()): HabitWithTodayEntry[] {
    const db = getDatabase();
    interface JoinedRow extends RawHabitRow {
      entry_value: number | null;
      entry_completed: number | null;
      entry_notes: string | null;
      area_name: string | null;
      area_color: string | null;
    }

    const rows = db.getAllSync<JoinedRow>(
      `SELECT 
         h.*,
         e.value as entry_value,
         e.is_completed as entry_completed,
         e.notes as entry_notes,
         a.name as area_name,
         a.color as area_color
       FROM habits h
       LEFT JOIN habit_entries e 
         ON h.id = e.habit_id AND e.entry_date = ?
       LEFT JOIN areas a 
         ON h.area_id = a.id
       WHERE h.is_archived = 0
       ORDER BY h.sort_order ASC, h.created_at ASC;`,
      [date]
    );

    return rows.map((row) => {
      const habit = mapHabitRow(row);
      const streaks = StreakEngine.calculateStreaks(habit.id);

      return {
        ...habit,
        currentValue: row.entry_value || 0,
        isCompletedToday: row.entry_completed === 1,
        todayNotes: row.entry_notes || undefined,
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
        areaName: row.area_name || undefined,
        areaColor: row.area_color || undefined,
      };
    });
  },

  create(habit: Omit<Habit, 'createdAt' | 'updatedAt'>, reminders?: { timeOfDay: string; daysOfWeek: number[] }[]): void {
    const db = getDatabase();
    db.withTransactionSync(() => {
      db.runSync(
        `INSERT INTO habits (
          id, area_id, type, name, description, icon, color,
          tracking_mode, target_value, unit, frequency_type,
          frequency_config, streak_goal, is_archived, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          habit.id,
          habit.areaId,
          habit.type,
          habit.name,
          habit.description ?? null,
          habit.icon,
          habit.color,
          habit.trackingMode,
          habit.targetValue,
          habit.unit ?? null,
          habit.frequencyType,
          JSON.stringify(habit.frequencyConfig || {}),
          habit.streakGoal,
          habit.isArchived ? 1 : 0,
          habit.sortOrder,
        ]
      );

      if (reminders && reminders.length > 0) {
        for (const rem of reminders) {
          const remId = `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          db.runSync(
            `INSERT INTO habit_reminders (id, habit_id, time_of_day, days_of_week, is_enabled)
             VALUES (?, ?, ?, ?, 1);`,
            [remId, habit.id, rem.timeOfDay, JSON.stringify(rem.daysOfWeek)]
          );
        }
      }
    });
  },

  update(habit: Partial<Habit> & { id: string }, reminders?: { timeOfDay: string; daysOfWeek: number[] }[]): void {
    const db = getDatabase();
    const current = this.getById(habit.id);
    if (!current) return;

    db.withTransactionSync(() => {
      db.runSync(
        `UPDATE habits SET 
           area_id = ?,
           type = ?,
           name = ?,
           description = ?,
           icon = ?,
           color = ?,
           tracking_mode = ?,
           target_value = ?,
           unit = ?,
           frequency_type = ?,
           frequency_config = ?,
           streak_goal = ?,
           updated_at = datetime('now')
         WHERE id = ?;`,
        [
          habit.areaId !== undefined ? habit.areaId : current.areaId,
          habit.type ?? current.type,
          habit.name ?? current.name,
          habit.description !== undefined ? habit.description : current.description ?? null,
          habit.icon ?? current.icon,
          habit.color ?? current.color,
          habit.trackingMode ?? current.trackingMode,
          habit.targetValue ?? current.targetValue,
          habit.unit !== undefined ? habit.unit : current.unit ?? null,
          habit.frequencyType ?? current.frequencyType,
          habit.frequencyConfig
            ? JSON.stringify(habit.frequencyConfig)
            : JSON.stringify(current.frequencyConfig),
          habit.streakGoal ?? current.streakGoal,
          habit.id,
        ]
      );

      if (reminders !== undefined) {
        db.runSync('DELETE FROM habit_reminders WHERE habit_id = ?;', [habit.id]);
        for (const rem of reminders) {
          const remId = `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          db.runSync(
            `INSERT INTO habit_reminders (id, habit_id, time_of_day, days_of_week, is_enabled)
             VALUES (?, ?, ?, ?, 1);`,
            [remId, habit.id, rem.timeOfDay, JSON.stringify(rem.daysOfWeek)]
          );
        }
      }
    });
  },

  archive(id: string): void {
    const db = getDatabase();
    db.runSync(
      `UPDATE habits SET is_archived = 1, updated_at = datetime('now') WHERE id = ?;`,
      [id]
    );
  },

  restore(id: string): void {
    const db = getDatabase();
    db.runSync(
      `UPDATE habits SET is_archived = 0, updated_at = datetime('now') WHERE id = ?;`,
      [id]
    );
  },

  delete(id: string): void {
    const db = getDatabase();
    db.withTransactionSync(() => {
      db.runSync('DELETE FROM habit_reminders WHERE habit_id = ?;', [id]);
      db.runSync('DELETE FROM habit_entries WHERE habit_id = ?;', [id]);
      db.runSync('DELETE FROM habits WHERE id = ?;', [id]);
    });
  },

  getReminders(habitId: string): HabitReminder[] {
    const db = getDatabase();
    interface RawReminder {
      id: string;
      habit_id: string;
      time_of_day: string;
      days_of_week: string;
      is_enabled: number;
      notification_id: string | null;
      created_at: string;
    }
    const rows = db.getAllSync<RawReminder>(
      'SELECT * FROM habit_reminders WHERE habit_id = ?;',
      [habitId]
    );
    return rows.map((r) => ({
      id: r.id,
      habitId: r.habit_id,
      timeOfDay: r.time_of_day,
      daysOfWeek: JSON.parse(r.days_of_week || '[]'),
      isEnabled: r.is_enabled === 1,
      notificationId: r.notification_id || undefined,
      createdAt: r.created_at,
    }));
  },
};
