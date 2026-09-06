import { getDatabase } from '../client';
import { HabitEntry } from '../../types';
import { formatISODate } from '../../utils/date';

interface RawEntryRow {
  id: string;
  habit_id: string;
  entry_date: string;
  value: number;
  is_completed: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: RawEntryRow): HabitEntry {
  return {
    id: row.id,
    habitId: row.habit_id,
    entryDate: row.entry_date,
    value: row.value,
    isCompleted: row.is_completed === 1,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const EntryRepository = {
  getEntry(habitId: string, date: string): HabitEntry | null {
    const db = getDatabase();
    const row = db.getFirstSync<RawEntryRow>(
      'SELECT * FROM habit_entries WHERE habit_id = ? AND entry_date = ?;',
      [habitId, date]
    );
    return row ? mapRow(row) : null;
  },

  getEntriesForDate(date: string): HabitEntry[] {
    const db = getDatabase();
    const rows = db.getAllSync<RawEntryRow>(
      'SELECT * FROM habit_entries WHERE entry_date = ?;',
      [date]
    );
    return rows.map(mapRow);
  },

  getEntriesForHabit(habitId: string, limit = 60): HabitEntry[] {
    const db = getDatabase();
    const rows = db.getAllSync<RawEntryRow>(
      'SELECT * FROM habit_entries WHERE habit_id = ? ORDER BY entry_date DESC LIMIT ?;',
      [habitId, limit]
    );
    return rows.map(mapRow);
  },

  getEntriesInDateRange(startDate: string, endDate: string): HabitEntry[] {
    const db = getDatabase();
    const rows = db.getAllSync<RawEntryRow>(
      'SELECT * FROM habit_entries WHERE entry_date >= ? AND entry_date <= ? ORDER BY entry_date ASC;',
      [startDate, endDate]
    );
    return rows.map(mapRow);
  },

  upsertEntry(
    habitId: string,
    date: string,
    value: number,
    isCompleted: boolean,
    notes?: string
  ): HabitEntry {
    const db = getDatabase();
    const existing = this.getEntry(habitId, date);
    const entryId = existing ? existing.id : `entry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const completedInt = isCompleted ? 1 : 0;

    if (existing) {
      db.runSync(
        `UPDATE habit_entries 
         SET value = ?, is_completed = ?, notes = COALESCE(?, notes), updated_at = datetime('now')
         WHERE id = ?;`,
        [value, completedInt, notes ?? null, existing.id]
      );
    } else {
      db.runSync(
        `INSERT INTO habit_entries (id, habit_id, entry_date, value, is_completed, notes)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [entryId, habitId, date, value, completedInt, notes ?? null]
      );
    }

    return this.getEntry(habitId, date)!;
  },

  deleteEntry(habitId: string, date: string): void {
    const db = getDatabase();
    db.runSync(
      'DELETE FROM habit_entries WHERE habit_id = ? AND entry_date = ?;',
      [habitId, date]
    );
  },

  getTotalCompletedCount(): number {
    const db = getDatabase();
    const row = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM habit_entries WHERE is_completed = 1;'
    );
    return row?.count || 0;
  },
};
