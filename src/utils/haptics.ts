import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../store/useSettingsStore';

function canVibrate(): boolean {
  try {
    const settings = useSettingsStore.getState().settings;
    return settings.vibrationEnabled !== false;
  } catch {
    return true;
  }
}

function getIntensity(): 'light' | 'medium' | 'heavy' {
  try {
    return useSettingsStore.getState().settings.vibrationIntensity || 'medium';
  } catch {
    return 'medium';
  }
}

export const haptic = {
  success: async () => {
    if (!canVibrate()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  },
  warning: async () => {
    if (!canVibrate()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
  },
  error: async () => {
    if (!canVibrate()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}
  },
  light: async () => {
    if (!canVibrate()) return;
    try {
      const intensity = getIntensity();
      const style =
        intensity === 'heavy'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : intensity === 'medium'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light;
      await Haptics.impactAsync(style);
    } catch {}
  },
  medium: async () => {
    if (!canVibrate()) return;
    try {
      const intensity = getIntensity();
      const style =
        intensity === 'light'
          ? Haptics.ImpactFeedbackStyle.Light
          : intensity === 'heavy'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : Haptics.ImpactFeedbackStyle.Medium;
      await Haptics.impactAsync(style);
    } catch {}
  },
  selection: async () => {
    if (!canVibrate()) return;
    try {
      await Haptics.selectionAsync();
    } catch {}
  },
};

