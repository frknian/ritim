import { getDatabase } from '../client';
import { Reward } from '../../types';

interface RewardRow {
  id: string;
  habit_id: string | null;
  title: string;
  streak_target: number;
  is_unlocked: number;
  is_claimed: number;
  claimed_at: string | null;
  created_at: string;
}

function mapRowToReward(row: RewardRow): Reward {
  return {
    id: row.id,
    habitId: row.habit_id,
    title: row.title,
    streakTarget: row.streak_target,
    isUnlocked: Boolean(row.is_unlocked),
    isClaimed: Boolean(row.is_claimed),
    claimedAt: row.claimed_at,
    createdAt: row.created_at,
  };
}

export const RewardRepository = {
  getRewardsForHabit(habitId: string): Reward[] {
    const db = getDatabase();
    const rows = db.getAllSync<RewardRow>(
      'SELECT * FROM rewards WHERE habit_id = ? ORDER BY streak_target ASC;',
      [habitId]
    );
    return rows.map(mapRowToReward);
  },

  getAll(): Reward[] {
    const db = getDatabase();
    const rows = db.getAllSync<RewardRow>(
      'SELECT * FROM rewards ORDER BY streak_target ASC;'
    );
    return rows.map(mapRowToReward);
  },

  create(reward: {
    id?: string;
    habitId?: string | null;
    title: string;
    streakTarget: number;
  }): Reward {
    const db = getDatabase();
    const id = reward.id || `reward_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    db.runSync(
      `INSERT INTO rewards (id, habit_id, title, streak_target, is_unlocked, is_claimed)
       VALUES (?, ?, ?, ?, 0, 0);`,
      [id, reward.habitId || null, reward.title, reward.streakTarget]
    );

    return {
      id,
      habitId: reward.habitId || null,
      title: reward.title,
      streakTarget: reward.streakTarget,
      isUnlocked: false,
      isClaimed: false,
      createdAt: new Date().toISOString(),
    };
  },

  claimReward(rewardId: string): void {
    const db = getDatabase();
    db.runSync(
      `UPDATE rewards
       SET is_claimed = 1, claimed_at = datetime('now')
       WHERE id = ?;`,
      [rewardId]
    );
  },

  delete(rewardId: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM rewards WHERE id = ?;', [rewardId]);
  },

  /**
   * Alışkanlığın serisi hedefe ulaştığında ödül kilidini açar.
   * Kilidi yeni açılan ödülleri döndürür.
   */
  checkAndUnlockRewards(habitId: string, currentStreak: number): Reward[] {
    const db = getDatabase();
    const lockedRows = db.getAllSync<RewardRow>(
      'SELECT * FROM rewards WHERE habit_id = ? AND is_unlocked = 0 AND streak_target <= ?;',
      [habitId, currentStreak]
    );

    if (lockedRows.length === 0) return [];

    const unlocked: Reward[] = [];
    db.withTransactionSync(() => {
      for (const row of lockedRows) {
        db.runSync('UPDATE rewards SET is_unlocked = 1 WHERE id = ?;', [row.id]);
        unlocked.push({
          ...mapRowToReward(row),
          isUnlocked: true,
        });
      }
    });

    return unlocked;
  },
};
