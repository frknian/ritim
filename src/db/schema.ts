/**
 * SQLite DDL Şemaları ve İndeks Tanımları
 * DATA_MODEL.md belgesi uyarınca hazırlanmıştır.
 */

export const CREATE_TABLES_SQL = `
-- Yaşam Alanları
CREATE TABLE IF NOT EXISTS areas (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Alışkanlıklar
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
    frequency_config TEXT NOT NULL DEFAULT '{}',
    streak_goal INTEGER DEFAULT 21,
    is_archived INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
);

-- Alışkanlık Hatırlatıcıları
CREATE TABLE IF NOT EXISTS habit_reminders (
    id TEXT PRIMARY KEY NOT NULL,
    habit_id TEXT NOT NULL,
    time_of_day TEXT NOT NULL,
    days_of_week TEXT NOT NULL DEFAULT '[1,2,3,4,5,6,7]',
    is_enabled INTEGER NOT NULL DEFAULT 1,
    notification_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);

-- Günlük Kayıtlar
CREATE TABLE IF NOT EXISTS habit_entries (
    id TEXT PRIMARY KEY NOT NULL,
    habit_id TEXT NOT NULL,
    entry_date TEXT NOT NULL,
    value REAL NOT NULL DEFAULT 0.0,
    is_completed INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, entry_date)
);

-- Kullanıcı Ayarları
CREATE TABLE IF NOT EXISTS user_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Gelecekteki Supabase Eşitleme ve Denetim Günlüğü
CREATE TABLE IF NOT EXISTS sync_log (
    id TEXT PRIMARY KEY NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    client_timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    synced_at TEXT
);

-- Hedef Ödülleri (Milestone Rewards)
CREATE TABLE IF NOT EXISTS rewards (
    id TEXT PRIMARY KEY NOT NULL,
    habit_id TEXT,
    title TEXT NOT NULL,
    streak_target INTEGER NOT NULL,
    is_unlocked INTEGER NOT NULL DEFAULT 0,
    is_claimed INTEGER NOT NULL DEFAULT 0,
    claimed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);
`;

export const CREATE_INDEXES_SQL = `
CREATE INDEX IF NOT EXISTS idx_entries_date ON habit_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_entries_habit_date ON habit_entries(habit_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(is_archived, sort_order);
CREATE INDEX IF NOT EXISTS idx_habits_area ON habits(area_id);
CREATE INDEX IF NOT EXISTS idx_reminders_habit ON habit_reminders(habit_id);
CREATE INDEX IF NOT EXISTS idx_rewards_habit ON rewards(habit_id);
`;

export const SEED_AREAS = [
  { id: 'area_health', name: 'Sağlık & Spor', icon: 'heart', color: '#10B981', sort_order: 0 },
  { id: 'area_reading', name: 'Kitap & Entelektüel', icon: 'book-open', color: '#6366F1', sort_order: 1 },
  { id: 'area_tech', name: 'Yazılım & Odak', icon: 'code', color: '#3B82F6', sort_order: 2 },
  { id: 'area_mind', name: 'Zihin & Meditasyon', icon: 'brain', color: '#8B5CF6', sort_order: 3 },
  { id: 'area_personal', name: 'Kişisel Gelişim', icon: 'sparkles', color: '#F59E0B', sort_order: 4 },
];

export const SEED_HABITS = [
  {
    id: 'habit_water',
    area_id: 'area_health',
    type: 'build',
    name: 'Günde 2 Litre Su İç',
    description: 'Vücudun su dengesini korumak için 8 bardak su iç.',
    icon: 'droplet',
    color: '#06B6D4',
    tracking_mode: 'numeric',
    target_value: 8,
    unit: 'bardak',
    frequency_type: 'daily',
    frequency_config: '{}',
    streak_goal: 30,
    is_archived: 0,
    sort_order: 0,
  },
  {
    id: 'habit_read',
    area_id: 'area_reading',
    type: 'build',
    name: 'Kitap Oku',
    description: 'Her gün en az 20 sayfa felsefe veya teknik kitap oku.',
    icon: 'book-open',
    color: '#6366F1',
    tracking_mode: 'numeric',
    target_value: 20,
    unit: 'sayfa',
    frequency_type: 'daily',
    frequency_config: '{}',
    streak_goal: 66,
    is_archived: 0,
    sort_order: 1,
  },
  {
    id: 'habit_meditation',
    area_id: 'area_mind',
    type: 'build',
    name: 'Zihinsel Farkındalık & Meditasyon',
    description: 'Güne sakin başlamak için 15 dakika odaklan.',
    icon: 'brain',
    color: '#8B5CF6',
    tracking_mode: 'duration',
    target_value: 15,
    unit: 'dk',
    frequency_type: 'daily',
    frequency_config: '{}',
    streak_goal: 21,
    is_archived: 0,
    sort_order: 2,
  },
  {
    id: 'habit_quit_sugar',
    area_id: 'area_health',
    type: 'quit',
    name: 'İlave Şeker Tüketme',
    description: 'Paketli şekerli gıdalardan uzak dur.',
    icon: 'shield-alert',
    color: '#F43F5E',
    tracking_mode: 'boolean',
    target_value: 1,
    unit: '',
    frequency_type: 'daily',
    frequency_config: '{}',
    streak_goal: 30,
    is_archived: 0,
    sort_order: 3,
  },
];
