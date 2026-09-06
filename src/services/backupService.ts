import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '../db/client';
import { AreaRepository } from '../db/repositories/areaRepository';
import { formatISODate } from '../utils/date';

export const BackupService = {
  /**
   * Tüm veritabanını JSON dosyası olarak dışa aktarır ve paylaşım menüsünü açar.
   */
  async exportJSON(): Promise<boolean> {
    try {
      const db = getDatabase();
      const areas = AreaRepository.getAll();
      const habits = db.getAllSync<any>('SELECT * FROM habits;');
      const entries = db.getAllSync<any>('SELECT * FROM habit_entries;');
      const settings = db.getAllSync<any>('SELECT * FROM user_settings;');
      const reminders = db.getAllSync<any>('SELECT * FROM habit_reminders;');

      const payload = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        data: {
          areas,
          habits,
          entries,
          settings,
          reminders,
        },
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const fileName = `Ritim_Yedek_${formatISODate()}_${Date.now()}.json`;
      const file = new File(Paths.document, fileName);

      if (file.exists) {
        file.delete();
      }
      file.create();
      file.write(jsonStr);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Ritim JSON Yedeğini Dışa Aktar',
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('JSON dışa aktarma hatası:', error);
      return false;
    }
  },

  /**
   * Tamamlanan tüm aktiviteleri CSV formatında dışa aktarır.
   */
  async exportCSV(): Promise<boolean> {
    try {
      const db = getDatabase();
      const rows = db.getAllSync<{
        entry_date: string;
        habit_name: string;
        type: string;
        value: number;
        target_value: number;
        unit: string | null;
        is_completed: number;
        notes: string | null;
      }>(`
        SELECT 
          e.entry_date,
          h.name as habit_name,
          h.type,
          e.value,
          h.target_value,
          h.unit,
          e.is_completed,
          e.notes
        FROM habit_entries e
        JOIN habits h ON e.habit_id = h.id
        ORDER BY e.entry_date DESC;
      `);

      let csv = 'Tarih,Aliskanlik,Tip,Gerceklesen,Hedef,Birim,Tamamlandi,Notlar\n';

      for (const r of rows) {
        const typeStr = r.type === 'build' ? 'Kazan' : 'Bırak';
        const completedStr = r.is_completed === 1 ? 'Evet' : 'Hayır';
        const notesClean = (r.notes || '').replace(/"/g, '""');
        csv += `"${r.entry_date}","${r.habit_name}","${typeStr}",${r.value},${r.target_value},"${r.unit || ''}","${completedStr}","${notesClean}"\n`;
      }

      const fileName = `Ritim_Aktivite_${formatISODate()}.csv`;
      const file = new File(Paths.document, fileName);

      if (file.exists) {
        file.delete();
      }
      file.create();
      file.write(csv);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Ritim CSV Aktivite Dökümünü İndir',
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('CSV dışa aktarma hatası:', error);
      return false;
    }
  },

  /**
   * JSON metin verisinden veritabanını geri yükler.
   */
  importJSON(jsonContent: string): boolean {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed.data) return false;

      const db = getDatabase();

      db.withTransactionSync(() => {
        // Tabloları temizle
        db.runSync('DELETE FROM habit_entries;');
        db.runSync('DELETE FROM habit_reminders;');
        db.runSync('DELETE FROM habits;');
        db.runSync('DELETE FROM areas;');
        db.runSync('DELETE FROM user_settings;');

        // Alanları yükle
        if (parsed.data.areas && Array.isArray(parsed.data.areas)) {
          for (const a of parsed.data.areas) {
            db.runSync(
              'INSERT INTO areas (id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?);',
              [a.id, a.name, a.icon, a.color, a.sort_order ?? 0]
            );
          }
        }

        // Alışkanlıkları yükle
        if (parsed.data.habits && Array.isArray(parsed.data.habits)) {
          for (const h of parsed.data.habits) {
            db.runSync(
              `INSERT INTO habits (
                id, area_id, type, name, description, icon, color,
                tracking_mode, target_value, unit, frequency_type,
                frequency_config, streak_goal, is_archived, sort_order
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
              [
                h.id,
                h.area_id,
                h.type,
                h.name,
                h.description ?? null,
                h.icon,
                h.color,
                h.tracking_mode,
                h.target_value,
                h.unit ?? null,
                h.frequency_type,
                h.frequency_config,
                h.streak_goal,
                h.is_archived,
                h.sort_order ?? 0,
              ]
            );
          }
        }

        // Kayıtları yükle
        if (parsed.data.entries && Array.isArray(parsed.data.entries)) {
          for (const e of parsed.data.entries) {
            db.runSync(
              `INSERT INTO habit_entries (id, habit_id, entry_date, value, is_completed, notes)
               VALUES (?, ?, ?, ?, ?, ?);`,
              [e.id, e.habit_id, e.entry_date, e.value, e.is_completed, e.notes ?? null]
            );
          }
        }

        // Ayarları yükle
        if (parsed.data.settings && Array.isArray(parsed.data.settings)) {
          for (const s of parsed.data.settings) {
            db.runSync(
              'INSERT INTO user_settings (key, value) VALUES (?, ?);',
              [s.key, s.value]
            );
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Yedek geri yükleme hatası:', error);
      return false;
    }
  },
};
