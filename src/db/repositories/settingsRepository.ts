import { getDatabase } from '../client';
import { UserSettings } from '../../types';

export const SettingsRepository = {
  getSettings(): UserSettings {
    const db = getDatabase();
    const rows = db.getAllSync<{ key: string; value: string }>(
      'SELECT key, value FROM user_settings;'
    );

    const map = new Map<string, string>();
    rows.forEach((r) => map.set(r.key, r.value));

    let dashboardSections = ['progress_hero', 'area_filter', 'habit_list'];
    try {
      if (map.has('dashboard_sections')) {
        dashboardSections = JSON.parse(map.get('dashboard_sections')!);
      }
    } catch {}

    return {
      dailyReviewEnabled: map.get('daily_review_enabled') === 'true',
      dailyReviewTime: map.get('daily_review_time') || '21:30',
      compactMode: map.get('compact_mode') === 'true',
      dashboardSections,
      theme: (map.get('theme') as 'dark' | 'light') || 'light',
      vibrationEnabled: map.get('vibration_enabled') !== 'false',
      vibrationIntensity: (map.get('vibration_intensity') as 'light' | 'medium' | 'heavy') || 'medium',
      notificationsEnabled: map.get('notifications_enabled') !== 'false',
      showStreakInNotification: map.get('show_streak_in_notification') !== 'false',
      widgetHabitId: map.get('widget_habit_id') || null,
    };
  },

  updateSetting(key: string, value: string): void {
    const db = getDatabase();
    db.runSync(
      'INSERT OR REPLACE INTO user_settings (key, value, updated_at) VALUES (?, ?, datetime("now"));',
      [key, value]
    );
  },

  updateSettings(settings: Partial<UserSettings>): void {
    const db = getDatabase();
    db.withTransactionSync(() => {
      if (settings.dailyReviewEnabled !== undefined) {
        this.updateSetting('daily_review_enabled', String(settings.dailyReviewEnabled));
      }
      if (settings.dailyReviewTime !== undefined) {
        this.updateSetting('daily_review_time', settings.dailyReviewTime);
      }
      if (settings.compactMode !== undefined) {
        this.updateSetting('compact_mode', String(settings.compactMode));
      }
      if (settings.dashboardSections !== undefined) {
        this.updateSetting('dashboard_sections', JSON.stringify(settings.dashboardSections));
      }
      if (settings.theme !== undefined) {
        this.updateSetting('theme', settings.theme);
      }
      if (settings.vibrationEnabled !== undefined) {
        this.updateSetting('vibration_enabled', String(settings.vibrationEnabled));
      }
      if (settings.vibrationIntensity !== undefined) {
        this.updateSetting('vibration_intensity', settings.vibrationIntensity);
      }
      if (settings.notificationsEnabled !== undefined) {
        this.updateSetting('notifications_enabled', String(settings.notificationsEnabled));
      }
      if (settings.showStreakInNotification !== undefined) {
        this.updateSetting('show_streak_in_notification', String(settings.showStreakInNotification));
      }
      if (settings.widgetHabitId !== undefined) {
        this.updateSetting('widget_habit_id', settings.widgetHabitId || '');
      }
    });
  },
};
