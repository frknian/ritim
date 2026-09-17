import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import { getDatabase } from '../src/db/client';
import { StreakEngine } from '../src/services/streakEngine';

// Not: db/client.ts, expo-sqlite yerine tests/support/expo-sqlite-mock.mjs'i kullanır
// (bkz. tests/support/hooks.mjs). Bu sayede gerçek uygulama kodu (client.ts, schema.ts,
// streakEngine.ts) hiç değiştirilmeden node:sqlite üzerinde test edilebilir.
//
// getDatabase() ilk çağrıda şemayı kurar ve schema.ts'deki SEED_HABITS ile tohumlar;
// bu tohumlama sırasında created_at, SQLite'ın `datetime('now')` DEFAULT'u üzerinden
// 'YYYY-MM-DD HH:MM:SS' biçiminde (boşluk ayraçlı, 'T' değil) üretilir — hatanın
// tetiklendiği gerçek koşul budur.

function seedRelapseHabit() {
  const db = getDatabase();
  const id = 'habit_quit_relapse_test';
  const createdAt = '2026-08-01 09:00:00';

  db.runSync(
    `INSERT INTO habits (
      id, area_id, type, name, description, icon, color,
      tracking_mode, target_value, unit, frequency_type,
      frequency_config, streak_goal, is_archived, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      'area_health',
      'quit',
      'Test Bırakma Alışkanlığı',
      null,
      'shield-alert',
      '#F43F5E',
      'boolean',
      1,
      '',
      'daily',
      '{}',
      30,
      0,
      99,
      createdAt,
      createdAt,
    ]
  );

  return id;
}

test('seed edilen quit alışkanlığında (habit_quit_sugar) seri NaN döndürmez', () => {
  const { currentStreak, longestStreak } = StreakEngine.calculateStreaks('habit_quit_sugar');

  assert.equal(Number.isNaN(currentStreak), false, 'currentStreak NaN olmamalı');
  assert.equal(Number.isNaN(longestStreak), false, 'longestStreak NaN olmamalı');
  assert.equal(typeof currentStreak, 'number');
  assert.equal(typeof longestStreak, 'number');
  assert.ok(currentStreak >= 0);
  assert.ok(longestStreak >= currentStreak);
});

test('quit tipi alışkanlıkta nükseme sonrası seri doğru hesaplanır', () => {
  const db = getDatabase();
  const habitId = seedRelapseHabit();

  // 5 gün önce bir nüksetme kaydı ekle (is_completed = 0, value > 0).
  const relapseDate = new Date();
  relapseDate.setDate(relapseDate.getDate() - 5);
  const relapseDateStr = relapseDate.toISOString().split('T')[0];

  db.runSync(
    `INSERT INTO habit_entries (id, habit_id, entry_date, value, is_completed)
     VALUES (?, ?, ?, ?, ?);`,
    ['entry_relapse_1', habitId, relapseDateStr, 1, 0]
  );

  const { currentStreak, longestStreak } = StreakEngine.calculateStreaks(habitId);

  assert.equal(Number.isNaN(currentStreak), false, 'currentStreak NaN olmamalı');
  assert.equal(Number.isNaN(longestStreak), false, 'longestStreak NaN olmamalı');
  assert.equal(currentStreak, 5);
  assert.ok(longestStreak >= currentStreak);
});

// DatabaseSync doğrudan içe aktarılıyor olması, node:sqlite modülünün bu ortamda
// gerçekten mevcut olduğunu derleme zamanında da garanti eder.
test('node:sqlite mevcut', () => {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE t (x INTEGER);');
  db.close();
});
