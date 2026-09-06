import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Bell,
  Layout,
  Download,
  Upload,
  Archive,
  Info,
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  Sun,
  Moon,
  Smartphone,
  Flame,
  Check,
} from 'lucide-react-native';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { AppHeader } from '../components/common/AppHeader';
import { AppCard } from '../components/common/AppCard';
import { AppInput } from '../components/common/AppInput';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, useThemeColors } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import { useSettingsStore } from '../store/useSettingsStore';
import { useHabitStore } from '../store/useHabitStore';
import { BackupService } from '../services/backupService';
import { WidgetService } from '../services/widgetService';
import { haptic } from '../utils/haptics';

interface SettingsScreenProps {
  onBack: () => void;
  onOpenArchive: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onOpenArchive,
}) => {
  const { settings, updateSettings } = useSettingsStore();
  const { todayHabits } = useHabitStore();
  const colors = useThemeColors();

  const [reviewTimeInput, setReviewTimeInput] = useState(settings.dailyReviewTime);
  const [isEditingTime, setIsEditingTime] = useState(false);

  // Tema Değiştirme
  const handleToggleTheme = (theme: 'dark' | 'light') => {
    haptic.selection();
    updateSettings({ theme });
  };

  // Titreşim Ayarları
  const handleToggleVibration = (value: boolean) => {
    haptic.selection();
    updateSettings({ vibrationEnabled: value });
  };

  const handleChangeVibrationIntensity = (intensity: 'light' | 'medium' | 'heavy') => {
    haptic.selection();
    updateSettings({ vibrationIntensity: intensity });
  };

  // Bildirim Ayarları
  const handleToggleNotifications = (value: boolean) => {
    haptic.selection();
    updateSettings({ notificationsEnabled: value });
  };

  const handleToggleDailyReview = (value: boolean) => {
    haptic.selection();
    updateSettings({ dailyReviewEnabled: value });
  };

  const handleToggleShowStreakInNotif = (value: boolean) => {
    haptic.selection();
    updateSettings({ showStreakInNotification: value });
  };

  const handleSaveReviewTime = () => {
    if (reviewTimeInput.trim()) {
      haptic.success();
      updateSettings({ dailyReviewTime: reviewTimeInput.trim() });
      setIsEditingTime(false);
    }
  };

  // Widget Seçimi
  const handleSelectWidgetHabit = (habitId: string | null) => {
    haptic.selection();
    updateSettings({ widgetHabitId: habitId });
    WidgetService.syncWidgets();
  };

  const handleToggleCompactMode = (value: boolean) => {
    haptic.selection();
    updateSettings({ compactMode: value });
  };

  const handleExportJSON = async () => {
    haptic.light();
    const success = await BackupService.exportJSON();
    if (success) {
      Alert.alert(STRINGS.app.name, STRINGS.settings.exportSuccess);
    }
  };

  const handleExportCSV = async () => {
    haptic.light();
    const success = await BackupService.exportCSV();
    if (success) {
      Alert.alert(STRINGS.app.name, STRINGS.settings.exportSuccess);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title={STRINGS.settings.title} showBack onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* --- 1. TEMA SEÇİMİ (BEYAZ TEMA & KOYU TEMA) --- */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>GÖRÜNÜM VE TEMA</Text>
        <AppCard style={styles.card}>
          <View style={styles.themeSelectorRow}>
            <TouchableOpacity
              onPress={() => handleToggleTheme('dark')}
              style={[
                styles.themeButton,
                { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                settings.theme === 'dark' && [styles.themeButtonActive, { borderColor: colors.blue, backgroundColor: `${colors.blue}20` }],
              ]}
            >
              <Moon size={18} color={settings.theme === 'dark' ? colors.blue : colors.textSecondary} />
              <Text style={[styles.themeButtonText, { color: settings.theme === 'dark' ? colors.blue : colors.textSecondary }]}>
                Koyu Tema
              </Text>
              {settings.theme === 'dark' && <Check size={14} color={colors.blue} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleToggleTheme('light')}
              style={[
                styles.themeButton,
                { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                settings.theme === 'light' && [styles.themeButtonActive, { borderColor: colors.blue, backgroundColor: `${colors.blue}20` }],
              ]}
            >
              <Sun size={18} color={settings.theme === 'light' ? colors.blue : colors.textSecondary} />
              <Text style={[styles.themeButtonText, { color: settings.theme === 'light' ? colors.blue : colors.textSecondary }]}>
                Beyaz Tema
              </Text>
              {settings.theme === 'light' && <Check size={14} color={colors.blue} />}
            </TouchableOpacity>
          </View>
        </AppCard>

        {/* --- 2. TİTREŞİM VE DOKUNMA GERİ BİLDİRİMİ --- */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>TİTREŞİM VE GERİ BİLDİRİM</Text>
        <AppCard style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconRow}>
                <Smartphone size={18} color={colors.violet} />
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Titreşim Geri Bildirimi</Text>
              </View>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                Tamamlama ve buton dokunuşlarında haptic titreşim üretir.
              </Text>
            </View>
            <Switch
              value={settings.vibrationEnabled !== false}
              onValueChange={handleToggleVibration}
              thumbColor={settings.vibrationEnabled !== false ? colors.violet : '#94A3B8'}
              trackColor={{ false: colors.surfaceElevated, true: 'rgba(139, 92, 246, 0.4)' }}
            />
          </View>

          {settings.vibrationEnabled !== false && (
            <View style={[styles.subSettingContainer, { borderTopColor: colors.borderSubtle }]}>
              <Text style={[styles.subSettingLabel, { color: colors.textSecondary }]}>Titreşim Şiddeti:</Text>
              <View style={styles.segmentedRow}>
                {[
                  { key: 'light', label: 'Hafif' },
                  { key: 'medium', label: 'Orta' },
                  { key: 'heavy', label: 'Güçlü' },
                ].map((item) => {
                  const isSelected = (settings.vibrationIntensity || 'medium') === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      onPress={() => handleChangeVibrationIntensity(item.key as any)}
                      style={[
                        styles.segmentButton,
                        { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                        isSelected && [styles.segmentButtonActive, { backgroundColor: colors.violet, borderColor: colors.violet }],
                      ]}
                    >
                      <Text style={[styles.segmentButtonText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </AppCard>

        {/* --- 3. BİLDİRİMLER VE SERİ GÖSTERİMİ --- */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{STRINGS.settings.notificationsSection}</Text>
        <AppCard style={styles.card}>
          {/* Genel Bildirim İzni */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconRow}>
                <Bell size={18} color={colors.blue} />
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Hatırlatıcı Bildirimler</Text>
              </View>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                Alışkanlıklar için zamanlanan bildirimleri etkinleştirir.
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled !== false}
              onValueChange={handleToggleNotifications}
              thumbColor={settings.notificationsEnabled !== false ? colors.blue : '#94A3B8'}
              trackColor={{ false: colors.surfaceElevated, true: 'rgba(59, 130, 246, 0.4)' }}
            />
          </View>

          {/* Bildirimlerde Seri / Kaçıncı Gün Olduğunu Göster */}
          <View style={[styles.subSettingRow, { borderTopColor: colors.borderSubtle }]}>
            <View style={styles.settingInfo}>
              <View style={styles.iconRow}>
                <Flame size={16} color={colors.amber} />
                <Text style={[styles.subSettingTitle, { color: colors.textPrimary }]}>Seri Sayısını Bildirime Ekle</Text>
              </View>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                Ör: "🔥 5. Gün! Zinciri kırma" şeklinde kaçıncı günde olduğunuzu gösterir.
              </Text>
            </View>
            <Switch
              value={settings.showStreakInNotification !== false}
              onValueChange={handleToggleShowStreakInNotif}
              thumbColor={settings.showStreakInNotification !== false ? colors.amber : '#94A3B8'}
              trackColor={{ false: colors.surfaceElevated, true: 'rgba(245, 158, 11, 0.4)' }}
            />
          </View>

          {/* Günlük Akşam Değerlendirmesi */}
          <View style={[styles.subSettingRow, { borderTopColor: colors.borderSubtle }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.subSettingTitle, { color: colors.textPrimary }]}>{STRINGS.settings.dailyReview}</Text>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>{STRINGS.settings.dailyReviewDesc}</Text>
            </View>
            <Switch
              value={settings.dailyReviewEnabled}
              onValueChange={handleToggleDailyReview}
              thumbColor={settings.dailyReviewEnabled ? colors.blue : '#94A3B8'}
              trackColor={{ false: colors.surfaceElevated, true: 'rgba(59, 130, 246, 0.4)' }}
            />
          </View>

          {settings.dailyReviewEnabled && (
            <View style={[styles.timeSettingRow, { borderTopColor: colors.borderSubtle }]}>
              <View style={styles.timeInfo}>
                <Clock size={16} color={colors.textSecondary} />
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>{STRINGS.settings.dailyReviewTime}:</Text>
                <Text style={[styles.timeValue, { color: colors.blue }]}>{settings.dailyReviewTime}</Text>
              </View>

              {isEditingTime ? (
                <View style={styles.editTimeBox}>
                  <AppInput
                    value={reviewTimeInput}
                    onChangeText={setReviewTimeInput}
                    placeholder="21:30"
                    containerStyle={{ marginBottom: 0, width: 80 }}
                    style={{ minHeight: 38, paddingVertical: 4 }}
                  />
                  <TouchableOpacity onPress={handleSaveReviewTime} style={[styles.timeSaveBtn, { backgroundColor: colors.blue }]}>
                    <Text style={styles.timeSaveBtnText}>{STRINGS.common.save}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditingTime(true)}
                  style={[styles.timeEditBtn, { backgroundColor: colors.surface2 }]}
                >
                  <Text style={[styles.timeEditBtnText, { color: colors.textSecondary }]}>{STRINGS.common.edit}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </AppCard>

        {/* --- 4. WIDGET ÖZELLEŞTİRME (ZİNCİRİ KIRMA) --- */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>WİDGET ÖZELLEŞTİRME</Text>
        <AppCard style={styles.card}>
          <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Zinciri Kırma Widget Alışkanlığı</Text>
          <Text style={[styles.settingDesc, { color: colors.textSecondary, marginBottom: SPACING.md }]}>
            Ana ekran widget'ında gösterilecek zincir alışkanlığını seçin:
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.widgetHabitsRow}>
            <TouchableOpacity
              onPress={() => handleSelectWidgetHabit(null)}
              style={[
                styles.widgetHabitChip,
                { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                !settings.widgetHabitId && [styles.widgetHabitChipActive, { borderColor: colors.amber, backgroundColor: `${colors.amber}20` }],
              ]}
            >
              <Text
                style={[
                  styles.widgetHabitChipText,
                  { color: colors.textSecondary },
                  !settings.widgetHabitId && { color: colors.amber, fontWeight: '700' },
                ]}
              >
                🔥 En Yüksek Seri (Otomatik)
              </Text>
            </TouchableOpacity>

            {todayHabits.map((h) => {
              const isSelected = settings.widgetHabitId === h.id;
              return (
                <TouchableOpacity
                  key={h.id}
                  onPress={() => handleSelectWidgetHabit(h.id)}
                  style={[
                    styles.widgetHabitChip,
                    { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                    isSelected && [styles.widgetHabitChipActive, { borderColor: h.color, backgroundColor: `${h.color}20` }],
                  ]}
                >
                  <Text
                    style={[
                      styles.widgetHabitChipText,
                      { color: colors.textSecondary },
                      isSelected && { color: h.color, fontWeight: '700' },
                    ]}
                  >
                    {h.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </AppCard>

        {/* --- 5. PANO VE GÖRÜNÜM DÜZENİ --- */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{STRINGS.settings.dashboardSection}</Text>
        <AppCard style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.iconRow}>
                <Layout size={18} color={colors.emerald} />
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{STRINGS.settings.compactMode}</Text>
              </View>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>{STRINGS.settings.compactModeDesc}</Text>
            </View>
            <Switch
              value={settings.compactMode}
              onValueChange={handleToggleCompactMode}
              thumbColor={settings.compactMode ? colors.emerald : '#94A3B8'}
              trackColor={{ false: colors.surfaceElevated, true: 'rgba(16, 185, 129, 0.4)' }}
            />
          </View>
        </AppCard>

        {/* --- 6. ARŞİV BÖLÜMÜ --- */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{STRINGS.settings.archiveSection}</Text>
        <AppCard
          onPress={() => {
            haptic.light();
            onOpenArchive();
          }}
          style={styles.card}
        >
          <View style={styles.clickableRow}>
            <View style={styles.iconRow}>
              <Archive size={18} color={colors.amber} />
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{STRINGS.settings.archivedHabits}</Text>
            </View>
            <Text style={[styles.chevronText, { color: colors.textMuted }]}>›</Text>
          </View>
        </AppCard>

        {/* --- 7. VERİ VE YEDEKLEME --- */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{STRINGS.settings.dataSection}</Text>
        <AppCard style={styles.card}>
          <TouchableOpacity onPress={handleExportJSON} style={styles.actionRow}>
            <Download size={18} color={colors.blue} />
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>{STRINGS.settings.exportJson}</Text>
              <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>{STRINGS.settings.exportJsonDesc}</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <TouchableOpacity onPress={handleExportCSV} style={styles.actionRow}>
            <FileSpreadsheet size={18} color={colors.emerald} />
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>{STRINGS.settings.exportCsv}</Text>
              <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>{STRINGS.settings.exportCsvDesc}</Text>
            </View>
          </TouchableOpacity>
        </AppCard>

        {/* --- 8. HAKKINDA VE ÇEVRİMDIŞI GÜVENCESİ --- */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{STRINGS.settings.aboutSection}</Text>
        <AppCard style={styles.card}>
          <View style={styles.aboutRow}>
            <ShieldCheck size={20} color={colors.emerald} />
            <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>{STRINGS.settings.offlineNotice}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.versionRow}>
            <Text style={[styles.versionLabel, { color: colors.textSecondary }]}>{STRINGS.settings.version}</Text>
            <Text style={[styles.versionValue, { color: colors.textMuted }]}>1.0.0 (Standalone APK)</Text>
          </View>
        </AppCard>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  sectionHeader: {
    ...TYPOGRAPHY.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  card: {
    marginBottom: SPACING.xs,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
  },
  themeButtonActive: {},
  themeButtonText: {
    fontWeight: '700',
    fontSize: 13,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  settingInfo: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
  },
  subSettingTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  settingDesc: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  subSettingContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  subSettingLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  segmentButtonActive: {},
  segmentButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeLabel: {
    ...TYPOGRAPHY.body,
  },
  timeValue: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
  },
  editTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeSaveBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  timeSaveBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeEditBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  timeEditBtnText: {
    fontSize: 12,
  },
  widgetHabitsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  widgetHabitChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  widgetHabitChipActive: {},
  widgetHabitChipText: {
    fontSize: 12,
  },
  clickableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevronText: {
    fontSize: 22,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: SPACING.xs,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    ...TYPOGRAPHY.body,
  },
  actionDesc: {
    ...TYPOGRAPHY.tiny,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aboutDesc: {
    ...TYPOGRAPHY.body,
    flex: 1,
    lineHeight: 20,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionLabel: {
    ...TYPOGRAPHY.body,
  },
  versionValue: {
    ...TYPOGRAPHY.body,
  },
});
