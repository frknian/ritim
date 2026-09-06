import { create } from 'zustand';
import { UserSettings } from '../types';
import { SettingsRepository } from '../db/repositories/settingsRepository';
import { NotificationService } from '../services/notificationService';
import { haptic } from '../utils/haptics';

interface SettingsState {
  settings: UserSettings;
  loading: boolean;

  loadSettings: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    dailyReviewEnabled: true,
    dailyReviewTime: '21:30',
    compactMode: false,
    dashboardSections: ['progress_hero', 'area_filter', 'habit_list'],
    theme: 'light',
    vibrationEnabled: true,
    vibrationIntensity: 'medium',
    notificationsEnabled: true,
    showStreakInNotification: true,
    widgetHabitId: null,
  },
  loading: false,

  loadSettings: () => {
    try {
      const data = SettingsRepository.getSettings();
      set({ settings: data });
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    }
  },

  updateSettings: async (newSettings) => {
    try {
      haptic.light();
      SettingsRepository.updateSettings(newSettings);
      const updated = SettingsRepository.getSettings();
      set({ settings: updated });

      // Günlük değerlendirme bildirimi ayarlandıysa senkronize et
      if (
        newSettings.dailyReviewEnabled !== undefined ||
        newSettings.dailyReviewTime !== undefined
      ) {
        await NotificationService.scheduleDailyReview(
          updated.dailyReviewTime,
          updated.dailyReviewEnabled
        );
      }
    } catch (error) {
      console.error('Ayarlar güncellenemedi:', error);
    }
  },
}));
