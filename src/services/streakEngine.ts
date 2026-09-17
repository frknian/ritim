import { getDatabase } from '../db/client';
import { formatISODate, parseISODate, addDays, toDateOnly } from '../utils/date';
import { RecurrenceEngine } from './recurrenceEngine';
import { Habit } from '../types';

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

export const StreakEngine = {
  calculateStreaks(habitId: string): StreakResult {
    const db = getDatabase();

    // Alışkanlık bilgilerini al
    const habitRow = db.getFirstSync<any>(
      'SELECT * FROM habits WHERE id = ?;',
      [habitId]
    );

    if (!habitRow) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let freqConfig = {};
    try {
      freqConfig = JSON.parse(habitRow.frequency_config || '{}');
    } catch {}

    const habit: Habit = {
      id: habitRow.id,
      areaId: habitRow.area_id,
      type: habitRow.type,
      name: habitRow.name,
      description: habitRow.description,
      icon: habitRow.icon,
      color: habitRow.color,
      trackingMode: habitRow.tracking_mode,
      targetValue: habitRow.target_value,
      unit: habitRow.unit,
      frequencyType: habitRow.frequency_type,
      frequencyConfig: freqConfig,
      streakGoal: habitRow.streak_goal,
      isArchived: habitRow.is_archived === 1,
      sortOrder: habitRow.sort_order,
      createdAt: habitRow.created_at,
      updatedAt: habitRow.updated_at,
    };

    // Bırakılan (Quit) alışkanlıklar için seri mantığı
    if (habit.type === 'quit') {
      return this.calculateQuitStreak(habit);
    }

    // Kazanılan (Build) alışkanlıklar için seri mantığı
    return this.calculateBuildStreak(habit);
  },

  calculateBuildStreak(habit: Habit): StreakResult {
    const db = getDatabase();
    // Tamamlanan günleri tarih sırasına göre al
    const entries = db.getAllSync<{ entry_date: string }>(
      `SELECT entry_date FROM habit_entries 
       WHERE habit_id = ? AND is_completed = 1 
       ORDER BY entry_date DESC;`,
      [habit.id]
    );

    if (entries.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const completedDates = new Set(entries.map((e) => e.entry_date));
    const todayStr = formatISODate();
    const yesterdayStr = addDays(todayStr, -1);

    // Mevcut seri hesabı:
    // Bugün tamamlanmışsa bugünden, tamamlanmamışsa dünden geriye doğru kontrol et
    let checkDateStr = completedDates.has(todayStr) ? todayStr : yesterdayStr;
    let currentStreak = 0;

    // Eğer bugün yapılmamışsa VE dünkü gün de aktif olup yapılmamışsa seri 0'dır
    if (!completedDates.has(todayStr)) {
      if (RecurrenceEngine.isHabitActiveOnDate(habit, yesterdayStr) && !completedDates.has(yesterdayStr)) {
        currentStreak = 0;
      }
    }

    // Geriye doğru tara (en fazla 365 gün)
    let iterDate = checkDateStr;
    const createdDateStr = toDateOnly(habit.createdAt);

    for (let i = 0; i < 365; i++) {
      if (iterDate < createdDateStr) break;

      const isActive = RecurrenceEngine.isHabitActiveOnDate(habit, iterDate);
      if (isActive) {
        if (completedDates.has(iterDate)) {
          currentStreak++;
        } else {
          // Aktif bir gün kaçırılmış, seri sonlandı
          break;
        }
      }
      iterDate = addDays(iterDate, -1);
    }

    // En uzun seri (Longest Streak) hesabı:
    // Tarihleri kronolojik (eskiden yeniye) sıralayarak en uzun kesintisiz diziyi bul
    const ascEntries = db.getAllSync<{ entry_date: string }>(
      `SELECT entry_date FROM habit_entries 
       WHERE habit_id = ? AND is_completed = 1 
       ORDER BY entry_date ASC;`,
      [habit.id]
    );

    let maxStreak = currentStreak;
    let tempStreak = 0;
    let lastActiveDate: string | null = null;

    for (const entry of ascEntries) {
      if (!lastActiveDate) {
        tempStreak = 1;
        lastActiveDate = entry.entry_date;
      } else {
        // İki tamamlanma arasında kaçırılan aktif gün var mıydı?
        let intermediate = addDays(lastActiveDate, 1);
        let missedActive = false;

        while (intermediate < entry.entry_date) {
          if (RecurrenceEngine.isHabitActiveOnDate(habit, intermediate)) {
            missedActive = true;
            break;
          }
          intermediate = addDays(intermediate, 1);
        }

        if (missedActive) {
          tempStreak = 1;
        } else {
          tempStreak++;
        }
        lastActiveDate = entry.entry_date;
      }

      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, maxStreak),
    };
  },

  calculateQuitStreak(habit: Habit): StreakResult {
    const db = getDatabase();
    // Bırakılan alışkanlıkta "nüksetme" (relapse) kayıtları: is_completed = 0 olan veya değeri > 0 olan kayıtlar
    const lastRelapse = db.getFirstSync<{ entry_date: string }>(
      `SELECT entry_date FROM habit_entries 
       WHERE habit_id = ? AND is_completed = 0 AND value > 0
       ORDER BY entry_date DESC LIMIT 1;`,
      [habit.id]
    );

    const todayStr = formatISODate();
    const startDateStr = lastRelapse ? lastRelapse.entry_date : toDateOnly(habit.createdAt);

    const d1 = parseISODate(startDateStr).getTime();
    const d2 = parseISODate(todayStr).getTime();
    const cleanDays = Math.max(0, Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));

    // En uzun seriyi bul
    const allRelapses = db.getAllSync<{ entry_date: string }>(
      `SELECT entry_date FROM habit_entries 
       WHERE habit_id = ? AND is_completed = 0 AND value > 0
       ORDER BY entry_date ASC;`,
      [habit.id]
    );

    let longest = cleanDays;
    let prev = toDateOnly(habit.createdAt);

    for (const r of allRelapses) {
      const diff = Math.max(
        0,
        Math.floor((parseISODate(r.entry_date).getTime() - parseISODate(prev).getTime()) / (1000 * 60 * 60 * 24))
      );
      if (diff > longest) longest = diff;
      prev = r.entry_date;
    }

    return {
      currentStreak: cleanDays,
      longestStreak: Math.max(cleanDays, longest),
    };
  },
};
