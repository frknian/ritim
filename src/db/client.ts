import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, CREATE_INDEXES_SQL, SEED_AREAS, SEED_HABITS } from './schema';
import { formatISODate } from '../utils/date';

const DATABASE_NAME = 'habbit.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DATABASE_NAME);
    initDatabase(dbInstance);
  }
  return dbInstance;
}

function initDatabase(db: SQLite.SQLiteDatabase) {
  // WAL modunu etkinleştir ve yabancı anahtar kısıtlamalarını aç
  db.execSync('PRAGMA journal_mode = WAL;');
  db.execSync('PRAGMA foreign_keys = ON;');

  // Tabloları ve indeksleri oluştur
  db.execSync(CREATE_TABLES_SQL);
  db.execSync(CREATE_INDEXES_SQL);

  // Başlangıç tohum verisini kontrol et (Eğer alanlar tablosu boşsa tohumla)
  const existingAreas = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM areas;'
  );

  if (!existingAreas || existingAreas.count === 0) {
    db.withTransactionSync(() => {
      // Alanları ekle
      for (const area of SEED_AREAS) {
        db.runSync(
          'INSERT INTO areas (id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?);',
          [area.id, area.name, area.icon, area.color, area.sort_order]
        );
      }

      // Başlangıç alışkanlıklarını ekle
      for (const habit of SEED_HABITS) {
        db.runSync(
          `INSERT INTO habits (
            id, area_id, type, name, description, icon, color,
            tracking_mode, target_value, unit, frequency_type,
            frequency_config, streak_goal, is_archived, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            habit.id,
            habit.area_id,
            habit.type,
            habit.name,
            habit.description,
            habit.icon,
            habit.color,
            habit.tracking_mode,
            habit.target_value,
            habit.unit,
            habit.frequency_type,
            habit.frequency_config,
            habit.streak_goal,
            habit.is_archived,
            habit.sort_order,
          ]
        );
      }

      // Varsayılan ayarları ekle
      db.runSync(
        'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?);',
        ['daily_review_enabled', 'true']
      );
      db.runSync(
        'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?);',
        ['daily_review_time', '21:30']
      );
      db.runSync(
        'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?);',
        ['compact_mode', 'false']
      );

      // Bugün için örnek bir başlangıç kaydı (Su içme alışkanlığına 3 bardak)
      const today = formatISODate();
      db.runSync(
        `INSERT OR IGNORE INTO habit_entries (id, habit_id, entry_date, value, is_completed)
         VALUES (?, ?, ?, ?, ?);`,
        ['entry_seed_water', 'habit_water', today, 3, 0]
      );
    });
  }
}
