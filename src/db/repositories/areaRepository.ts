import { getDatabase } from '../client';
import { Area, AreaWithStats } from '../../types';

export const AreaRepository = {
  getAll(): Area[] {
    const db = getDatabase();
    return db.getAllSync<Area>(
      'SELECT id, name, icon, color, sort_order as sortOrder, created_at as createdAt, updated_at as updatedAt FROM areas ORDER BY sort_order ASC;'
    );
  },

  getAllWithStats(): AreaWithStats[] {
    const db = getDatabase();
    const areas = this.getAll();

    return areas.map((area) => {
      // Aktif alışkanlık sayısı
      const habitCountRow = db.getFirstSync<{ count: number }>(
        'SELECT COUNT(*) as count FROM habits WHERE area_id = ? AND is_archived = 0;',
        [area.id]
      );
      const activeHabitCount = habitCountRow?.count || 0;

      // Son 7 günün tamamlanma yüzdesi
      const weeklyRow = db.getFirstSync<{ completed: number; total: number }>(
        `SELECT 
           COUNT(CASE WHEN e.is_completed = 1 THEN 1 END) as completed,
           COUNT(e.id) as total
         FROM habits h
         JOIN habit_entries e ON h.id = e.habit_id
         WHERE h.area_id = ? AND h.is_archived = 0 
           AND e.entry_date >= date('now', '-7 days');`,
        [area.id]
      );

      const weeklyCompletionRate =
        weeklyRow && weeklyRow.total > 0
          ? Math.round((weeklyRow.completed / weeklyRow.total) * 100)
          : 0;

      // Son 30 günün tamamlanma yüzdesi
      const monthlyRow = db.getFirstSync<{ completed: number; total: number }>(
        `SELECT 
           COUNT(CASE WHEN e.is_completed = 1 THEN 1 END) as completed,
           COUNT(e.id) as total
         FROM habits h
         JOIN habit_entries e ON h.id = e.habit_id
         WHERE h.area_id = ? AND h.is_archived = 0 
           AND e.entry_date >= date('now', '-30 days');`,
        [area.id]
      );

      const monthlyCompletionRate =
        monthlyRow && monthlyRow.total > 0
          ? Math.round((monthlyRow.completed / monthlyRow.total) * 100)
          : 0;

      return {
        ...area,
        activeHabitCount,
        weeklyCompletionRate,
        monthlyCompletionRate,
      };
    });
  },

  getById(id: string): Area | null {
    const db = getDatabase();
    return db.getFirstSync<Area>(
      'SELECT id, name, icon, color, sort_order as sortOrder, created_at as createdAt, updated_at as updatedAt FROM areas WHERE id = ?;',
      [id]
    );
  },

  create(area: Omit<Area, 'createdAt' | 'updatedAt'>): void {
    const db = getDatabase();
    db.runSync(
      'INSERT INTO areas (id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?);',
      [area.id, area.name, area.icon, area.color, area.sortOrder]
    );
  },

  update(area: Partial<Area> & { id: string }): void {
    const db = getDatabase();
    const current = this.getById(area.id);
    if (!current) return;

    const name = area.name ?? current.name;
    const icon = area.icon ?? current.icon;
    const color = area.color ?? current.color;
    const sortOrder = area.sortOrder ?? current.sortOrder;

    db.runSync(
      `UPDATE areas SET name = ?, icon = ?, color = ?, sort_order = ?, updated_at = datetime('now') WHERE id = ?;`,
      [name, icon, color, sortOrder, area.id]
    );
  },

  delete(id: string): void {
    const db = getDatabase();
    // Alana bağlı alışkanlıkların area_id'sini null yap, alanı sil
    db.withTransactionSync(() => {
      db.runSync('UPDATE habits SET area_id = NULL WHERE area_id = ?;', [id]);
      db.runSync('DELETE FROM areas WHERE id = ?;', [id]);
    });
  },
};
