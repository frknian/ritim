import { Habit, FrequencyType, FrequencyConfig } from '../types';
import { parseISODate, getDayDifference } from '../utils/date';

export const RecurrenceEngine = {
  /**
   * Belirli bir ISO tarih ('YYYY-MM-DD') için alışkanlığın yapılması gerekip gerekmediğini doğrular.
   */
  isHabitActiveOnDate(habit: Habit, dateStr: string): boolean {
    const date = parseISODate(dateStr);
    // JS getDay(): Pazar = 0, Pazartesi = 1, ..., Cumartesi = 6
    // Bizim standart: Pazartesi = 1, ..., Pazar = 7
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();

    switch (habit.frequencyType) {
      case 'daily':
        return true;

      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5;

      case 'weekends':
        return dayOfWeek === 6 || dayOfWeek === 7;

      case 'specific_days': {
        const days = habit.frequencyConfig?.days || [];
        return days.includes(dayOfWeek);
      }

      case 'interval': {
        const interval = habit.frequencyConfig?.interval_days || 2;
        if (interval <= 1) return true;

        // Alışkanlığın oluşturulma tarihinden bu yana geçen gün farkı
        const createdDateStr = habit.createdAt.split('T')[0];
        const diffDays = getDayDifference(createdDateStr, dateStr);
        return diffDays % interval === 0;
      }

      case 'x_per_week':
      case 'x_per_month':
        // Kota bazlı hedeflerde kullanıcı o gün tamamlamak isteyebilir, aktif sayılır
        return true;

      default:
        return true;
    }
  },
};
