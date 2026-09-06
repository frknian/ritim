import { STRINGS } from '../constants/strings';

/**
 * Verilen Date nesnesini 'YYYY-MM-DD' formatına çevirir (Yerel saat dilimini korur).
 */
export function formatISODate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 'YYYY-MM-DD' dizgisinden yerel Date nesnesi üretir.
 */
export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Türkçe uzun gün adı ve tarih gösterimi: "5 Eylül Cumartesi"
 */
export function formatTurkishDisplayDate(date: Date = new Date()): string {
  const day = date.getDate();
  const monthName = STRINGS.common.monthsFull[date.getMonth()];
  // JS'de Pazar 0, Pazartesi 1... STRINGS.common.daysFull'da Pzt=0 ... Paz=6
  const dayIndex = (date.getDay() + 6) % 7;
  const dayName = STRINGS.common.daysFull[dayIndex];
  return `${day} ${monthName} ${dayName}`;
}

/**
 * Türkçe Ay ve Yıl başlığı: "Eylül 2026"
 */
export function formatTurkishMonthYear(date: Date = new Date()): string {
  const monthName = STRINGS.common.monthsFull[date.getMonth()];
  return `${monthName} ${date.getFullYear()}`;
}

/**
 * Verilen tarihin haftasının (Pazartesi - Pazar) tüm günlerinin 'YYYY-MM-DD' dizilerini döner.
 */
export function getWeekDays(referenceDate: Date = new Date()): string[] {
  const date = new Date(referenceDate);
  const dayOfWeek = (date.getDay() + 6) % 7; // Pazartesi = 0
  const monday = new Date(date);
  monday.setDate(date.getDate() - dayOfWeek);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(formatISODate(d));
  }
  return days;
}

/**
 * Verilen ayın tüm takvim hücrelerini (boş başlangıç günleri dahil) üretir.
 */
export function getMonthMatrix(year: number, monthIndex: number): { dayNumber: number | null; dateStr: string | null }[] {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const totalDays = lastDay.getDate();

  // Pazartesi = 0 olacak şekilde ilk günün haftadaki yeri
  const startingEmptyCells = (firstDay.getDay() + 6) % 7;

  const matrix: { dayNumber: number | null; dateStr: string | null }[] = [];

  // Ay başındaki boş hücreler
  for (let i = 0; i < startingEmptyCells; i++) {
    matrix.push({ dayNumber: null, dateStr: null });
  }

  // Ayın günleri
  for (let d = 1; d <= totalDays; d++) {
    const month = String(monthIndex + 1).padStart(2, '0');
    const day = String(d).padStart(2, '0');
    matrix.push({
      dayNumber: d,
      dateStr: `${year}-${month}-${day}`,
    });
  }

  // 7'nin katına tamamlama
  while (matrix.length % 7 !== 0) {
    matrix.push({ dayNumber: null, dateStr: null });
  }

  return matrix;
}

/**
 * İki ISO tarih arasındaki gün farkını hesaplar.
 */
export function getDayDifference(dateA: string, dateB: string): number {
  const a = parseISODate(dateA).getTime();
  const b = parseISODate(dateB).getTime();
  return Math.round(Math.abs(b - a) / (1000 * 60 * 60 * 24));
}

/**
 * Bir tarihe gün ekler veya çıkarır.
 */
export function addDays(dateStr: string, daysToAdd: number): string {
  const d = parseISODate(dateStr);
  d.setDate(d.getDate() + daysToAdd);
  return formatISODate(d);
}
