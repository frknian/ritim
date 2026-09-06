import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { useSettingsStore } from '../store/useSettingsStore';

// Uygulama açıkken bildirim gösterimi davranışı
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  /**
   * Android bildirim kanallarını oluşturur.
   */
  async setupChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    // 1. Alışkanlık Hatırlatıcıları Kanalı
    await Notifications.setNotificationChannelAsync('habit_reminders', {
      name: 'Alışkanlık Hatırlatıcıları',
      description: 'Günün planlanan alışkanlıkları için zamanlanmış hatırlatıcılar',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });

    // 2. Günlük Değerlendirme Kanalı
    await Notifications.setNotificationChannelAsync('daily_review', {
      name: 'Günlük Özet ve Değerlendirme',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#10B981',
    });
  },

  /**
   * Bildirim iznini kontrol eder ve gerekirse talep eder.
   */
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  },

  /**
   * Günlük Değerlendirme akşam bildirimini zamanlar.
   */
  async scheduleDailyReview(timeOfDay: string = '21:30', isEnabled: boolean = true): Promise<void> {
    await this.cancelDailyReview();

    const settings = useSettingsStore.getState().settings;
    if (!isEnabled || settings.notificationsEnabled === false) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const [hour, minute] = timeOfDay.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Ritim — Günlük Değerlendirme',
        body: 'Bugün hedeflerine ne kadar yaklaştın? Alışkanlıklarını gözden geçirmek için dokun.',
        data: { type: 'daily_review' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: 'daily_review',
        hour,
        minute,
      },
    });
  },

  async cancelDailyReview(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.type === 'daily_review') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  },

  /**
   * Belirli bir alışkanlık için hatırlatıcı bildirimi oluşturur.
   * Kaçıncı günde olduğu (seri sayısı) bildirim başlığına eklenir.
   */
  async scheduleHabitReminder(
    habitId: string,
    habitName: string,
    timeOfDay: string,
    daysOfWeek: number[] = [1, 2, 3, 4, 5, 6, 7],
    streakCount: number = 0
  ): Promise<string[]> {
    const settings = useSettingsStore.getState().settings;
    if (settings.notificationsEnabled === false) return [];

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return [];

    const [hour, minute] = timeOfDay.split(':').map(Number);
    const notificationIds: string[] = [];

    const showStreak = settings.showStreakInNotification !== false;
    let title = habitName;
    let body = 'Günün bu alışkanlığını tamamlama zamanı geldi.';

    if (showStreak) {
      if (streakCount > 0) {
        title = `🔥 ${streakCount + 1}. Gün: ${habitName}`;
        body = `Zinciri kırma! ${streakCount} gündür harika gidiyorsun. Bugünün hedefini tamamla.`;
      } else {
        title = `🌱 1. Gün: ${habitName}`;
        body = `Yeni bir başlangıç! "${habitName}" için bugün ilk adımı at.`;
      }
    }

    for (const day of daysOfWeek) {
      const expoWeekday = day === 7 ? 1 : day + 1;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { habitId, streakCount },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          channelId: 'habit_reminders',
          weekday: expoWeekday,
          hour,
          minute,
        },
      });
      notificationIds.push(id);
    }

    return notificationIds;
  },

  /**
   * Hedef seriye ulaşıldığında ödül kutlama bildirimi gönderir.
   */
  async sendMilestoneUnlockedNotification(
    habitName: string,
    rewardTitle: string,
    streak: number
  ): Promise<void> {
    const settings = useSettingsStore.getState().settings;
    if (settings.notificationsEnabled === false) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🎉 Ödül Kilidi Açıldı! (${streak}. Gün)`,
        body: `"${habitName}" serisi ${streak} güne ulaştı! Hak ettiğin ödül: ${rewardTitle}`,
        data: { type: 'milestone_reward' },
      },
      trigger: null, // Anlık gönderim
    });
  },

  /**
   * Bir alışkanlığa ait tüm hatırlatıcıları iptal eder.
   */
  async cancelHabitReminders(habitId: string): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.habitId === habitId) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  },
};

