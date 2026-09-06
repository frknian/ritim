/**
 * Habbit Design System - Renkler, Tipografi ve Tasarım Sabitleri
 * UI_RULES.md belgesine birebir sadık kalınarak oluşturulmuştur.
 */

import { useSettingsStore } from '../store/useSettingsStore';

export const DARK_COLORS = {
  // Zemin ve Yüzeyler (Dark Foundation)
  bgPrimary: '#080B10',       // Ultra derin obsidian
  surface1: '#111622',        // Kartlar, alt çubuk, modal pencereler
  surface2: '#1A2234',        // Kart içi öğeler, butonlar, pasif çipler
  surfaceElevated: '#232D42', // Aktif çipler, açılır menüler, giriş alanları
  borderSubtle: '#1E283D',    // Kart ve ayırıcı sınır çizgileri
  borderFocus: '#4CD482',     // Odak çizgisi (Logodaki canlı yeşil)

  // Tipografi
  textPrimary: '#F8FAFC',     // Ana başlıklar, kritik metinler
  textSecondary: '#94A3B8',   // Açıklamalar, sayaç durumları
  textMuted: '#64748B',       // Pasif tarihler, küçük etiketler

  // Vurgu ve Alışkanlık Renkleri (Logodaki Ritim Yeşili Paleti)
  emerald: '#4CD482',         // Logodaki canlı yeşil onay işareti rengi (başarı, tamamlama)
  blue: '#10B981',            // Logodaki zümrüt yeşili (ikinci arayüz ve etkileşim rengi)
  amber: '#F59E0B',           // Sayısal sayaçlar, seri alevi
  rose: '#F43F5E',            // Bırakılan alışkanlıklar (Quit), uyarı
  violet: '#8B5CF6',          // Zihin, felsefe, yaratıcı alanlar
  cyan: '#06B6D4',            // Sağlık, spor, su
  indigo: '#6366F1',          // Bilim, yazılım, odak

  // Saydamlık katmanları
  emeraldAlpha: 'rgba(76, 212, 130, 0.15)',
  blueAlpha: 'rgba(16, 185, 129, 0.15)',
  amberAlpha: 'rgba(245, 158, 11, 0.15)',
  roseAlpha: 'rgba(244, 63, 94, 0.15)',
  violetAlpha: 'rgba(139, 92, 246, 0.15)',
  cyanAlpha: 'rgba(6, 182, 212, 0.15)',
} as const;

export const LIGHT_COLORS = {
  // Zemin ve Yüzeyler (Light Foundation - Beyaz Tema)
  bgPrimary: '#F4F5F8',       // Routine Day temiz soft zemin
  surface1: '#FFFFFF',        // Saf beyaz kartlar ve modallar
  surface2: '#F1F5F9',        // Slate 100 kart içi öğeler
  surfaceElevated: '#E2E8F0', // Slate 200 aktif çipler ve menüler
  borderSubtle: '#E2E8F0',    // Slate 200 sınır çizgileri
  borderFocus: '#059669',     // Yeşil odak

  // Tipografi
  textPrimary: '#0F172A',     // Slate 900 derin ve okunaklı koyu metin
  textSecondary: '#475569',   // Slate 600 açıklama metinleri
  textMuted: '#94A3B8',       // Slate 400 pasif tarihler

  // Vurgu ve Alışkanlık Renkleri
  emerald: '#059669',         // Zümrüt yeşili
  blue: '#10B981',            // Logodaki taze yeşil tonu (ikinci renk)
  amber: '#D97706',           // Kehribar
  rose: '#E11D48',            // Gül pembesi
  violet: '#7C3AED',          // Menekşe moru
  cyan: '#0891B2',            // Turkuaz
  indigo: '#4F46E5',          // İndigo

  // Saydamlık katmanları
  emeraldAlpha: 'rgba(5, 150, 105, 0.12)',
  blueAlpha: 'rgba(16, 185, 129, 0.12)',
  amberAlpha: 'rgba(217, 119, 6, 0.12)',
  roseAlpha: 'rgba(225, 29, 72, 0.12)',
  violetAlpha: 'rgba(124, 58, 237, 0.12)',
  cyanAlpha: 'rgba(8, 145, 178, 0.12)',
} as const;

export type ThemeColors = typeof DARK_COLORS;

export const COLORS = DARK_COLORS;

export const useThemeColors = (): ThemeColors => {
  const theme = useSettingsStore((s) => s.settings.theme);
  return theme === 'light' ? (LIGHT_COLORS as any) : DARK_COLORS;
};

export const PALETTE_OPTIONS = [
  { name: 'Ritim Canlı Yeşil', value: COLORS.emerald },
  { name: 'Ritim Zümrüt Yeşil', value: COLORS.blue },
  { name: 'Kehribar Sarısı', value: COLORS.amber },
  { name: 'Gül Pembesi', value: COLORS.rose },
  { name: 'Ametist Moru', value: COLORS.violet },
  { name: 'Turkuaz', value: COLORS.cyan },
  { name: 'İndigo', value: COLORS.indigo },
];

export const ICON_OPTIONS = [
  // Sağlık & Spor
  'dumbbell',
  'footprints',
  'heart',
  'activity',
  'droplet',
  'apple',
  'pill',
  'bike',
  // Zihin & Odak
  'brain',
  'book-open',
  'coffee',
  'pen-tool',
  'timer',
  'code',
  'headphones',
  // Yaşam & Düzen
  'sun',
  'moon',
  'bed',
  'sparkles',
  'flame',
  'target',
  'shield-alert',
  'check-circle-2',
  'smile',
  'zap',
  // Başarı & Ödül
  'trophy',
  'award',
  'star',
  'medal',
  // Finans & Kariyer
  'dollar-sign',
  'wallet',
  'briefcase',
  'laptop',
  'trending-up',
  // Rutin & Keşif
  'calendar',
  'clock',
  'leaf',
  'compass',
  'eye',
  'camera',
  'flag',
  'feather',
];

export const TYPOGRAPHY = {
  display: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
  },
  h1: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  h2: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  tiny: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500' as const,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};
