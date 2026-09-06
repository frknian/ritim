# Habbit — Veri Modeli ve Veritabanı Şeması (DATA_MODEL.md)

Bu belge, Habbit uygulamasının yerel **SQLite** ilişkisel veritabanı şemasını, indeksleme stratejisini, TypeScript veri tiplerini ve gelecekteki bulut senkronizasyonu / dışa aktarım formatlarını tanımlar.

---

## 1. Veritabanı Şeması (SQLite DDL)

Veritabanı adı: `habbit.db`  
Tarih formatı: ISO 8601 dizgisi (`YYYY-MM-DD` ve `YYYY-MM-DDTHH:mm:ss.sssZ`).

```sql
-- 1. YAŞAM ALANLARI TABLOSU (areas)
CREATE TABLE IF NOT EXISTS areas (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. ALIŞKANLIKLAR TABLOSU (habits)
CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY NOT NULL,
    area_id TEXT,
    type TEXT NOT NULL CHECK (type IN ('build', 'quit')),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    tracking_mode TEXT NOT NULL CHECK (tracking_mode IN ('boolean', 'numeric', 'duration')),
    target_value REAL NOT NULL DEFAULT 1.0,
    unit TEXT,
    frequency_type TEXT NOT NULL CHECK (frequency_type IN ('daily', 'specific_days', 'weekdays', 'weekends', 'x_per_week', 'x_per_month', 'interval')),
    frequency_config TEXT NOT NULL DEFAULT '{}', -- JSON: örn. {"days": [1,3,5]} veya {"interval_days": 2}
    streak_goal INTEGER DEFAULT 21,
    is_archived INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
);

-- 3. ALIŞKANLIK HATIRLATICILARI (habit_reminders)
CREATE TABLE IF NOT EXISTS habit_reminders (
    id TEXT PRIMARY KEY NOT NULL,
    habit_id TEXT NOT NULL,
    time_of_day TEXT NOT NULL, -- 'HH:mm' formatında (örn: '08:30')
    days_of_week TEXT NOT NULL DEFAULT '[1,2,3,4,5,6,7]', -- JSON int dizisi (1=Pazartesi, 7=Pazar)
    is_enabled INTEGER NOT NULL DEFAULT 1,
    notification_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);

-- 4. GÜNLÜK KAYITLAR VE TAMAMLAMALAR (habit_entries)
CREATE TABLE IF NOT EXISTS habit_entries (
    id TEXT PRIMARY KEY NOT NULL,
    habit_id TEXT NOT NULL,
    entry_date TEXT NOT NULL, -- 'YYYY-MM-DD'
    value REAL NOT NULL DEFAULT 0.0,
    is_completed INTEGER NOT NULL DEFAULT 0, -- 1: Başarılı, 0: Devam Ediyor / Eksik
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, entry_date) -- Bir alışkanlığın bir günde yalnızca tek kaydı olabilir
);

-- 5. KULLANICI AYARLARI (user_settings)
CREATE TABLE IF NOT EXISTS user_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 6. SENKRONİZASYON VE DEĞİŞİKLİK GÜNLÜĞÜ (sync_log - Gelecekteki Supabase Senkronizasyonu İçin)
CREATE TABLE IF NOT EXISTS sync_log (
    id TEXT PRIMARY KEY NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    client_timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    synced_at TEXT
);
```

---

## 2. İndeksleme ve Performans Stratejisi

Mobil cihazlarda 10.000+ kayıt üzerinde takvim ve istatistik sorgularının <10ms çalışması için hedeflenen indeksler:

```sql
-- Belirli bir günün tüm alışkanlık kayıtlarını anında çekmek için:
CREATE INDEX IF NOT EXISTS idx_entries_date ON habit_entries(entry_date);

-- Bir alışkanlığın geçmişini ve seri hesaplamasını tarih sırasıyla hızlandırmak için:
CREATE INDEX IF NOT EXISTS idx_entries_habit_date ON habit_entries(habit_id, entry_date DESC);

-- Aktif (arşivlenmemiş) alışkanlıkları ve sıralamalarını getirmek için:
CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(is_archived, sort_order);

-- Alana göre alışkanlıkları filtrelemek için:
CREATE INDEX IF NOT EXISTS idx_habits_area ON habits(area_id);

-- Hatırlatıcı sorguları için:
CREATE INDEX IF NOT EXISTS idx_reminders_habit ON habit_reminders(habit_id);
```

---

## 3. TypeScript Domain Modelleri

```typescript
// Alışkanlık Tipleri
export type HabitType = 'build' | 'quit';

// Takip Modları
export type TrackingMode = 'boolean' | 'numeric' | 'duration';

// Tekrar Tipleri
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

// Yaşam Alanı Modeli
export interface Area {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Alışkanlık Modeli
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

// Günlük Kayıt Modeli
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

// Hatırlatıcı Modeli
export interface HabitReminder {
  id: string;
  habitId: string;
  timeOfDay: string; // 'HH:mm'
  daysOfWeek: number[]; // [1, 2, 3, 4, 5, 6, 7]
  isEnabled: boolean;
  notificationId?: string;
  createdAt: string;
}

// Kullanıcı Ayarları Modeli
export interface UserSettings {
  dailyReviewEnabled: boolean;
  dailyReviewTime: string; // '21:30'
  compactMode: boolean;
  dashboardSections: string[]; // ['summary', 'today_habits', 'areas', 'weekly_progress']
  theme: 'dark';
}
```

---

## 4. Kritik SQL Sorguları

### 4.1. Bugünün Alışkanlık Durumunu Çekme
```sql
SELECT 
    h.*,
    COALESCE(e.value, 0) as current_value,
    COALESCE(e.is_completed, 0) as is_completed,
    e.notes as today_notes
FROM habits h
LEFT JOIN habit_entries e 
    ON h.id = e.habit_id AND e.entry_date = :todayDate
WHERE h.is_archived = 0
ORDER BY h.sort_order ASC;
```

### 4.2. Alan Bazlı Tamamlanma İstatistiği (Son 30 Gün)
```sql
SELECT 
    h.area_id,
    COUNT(DISTINCT h.id) as total_habits,
    COUNT(CASE WHEN e.is_completed = 1 THEN 1 END) as completed_entries,
    COUNT(e.id) as total_logged_entries
FROM habits h
LEFT JOIN habit_entries e ON h.id = e.habit_id 
    AND e.entry_date >= date('now', '-30 days')
WHERE h.is_archived = 0 AND h.area_id IS NOT NULL
GROUP BY h.area_id;
```

---

## 5. Dışa Aktarma ve Yedekleme Formatı (JSON Örneği)

```json
{
  "version": "1.0",
  "exported_at": "2026-09-05T15:45:00.000Z",
  "data": {
    "areas": [
      {
        "id": "area-1",
        "name": "Kitap & Entelektüel",
        "icon": "book-open",
        "color": "#6366F1",
        "sort_order": 0
      }
    ],
    "habits": [
      {
        "id": "habit-1",
        "area_id": "area-1",
        "type": "build",
        "name": "Kitap Oku",
        "tracking_mode": "numeric",
        "target_value": 20,
        "unit": "sayfa",
        "frequency_type": "daily",
        "frequency_config": "{}",
        "is_archived": 0
      }
    ],
    "entries": [
      {
        "id": "entry-1",
        "habit_id": "habit-1",
        "entry_date": "2026-09-05",
        "value": 20,
        "is_completed": 1,
        "notes": "Marcus Aurelius - Kendime Düşünceler"
      }
    ],
    "settings": {
      "dailyReviewEnabled": "true",
      "dailyReviewTime": "21:30"
    }
  }
}
```
