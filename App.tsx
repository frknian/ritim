import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, BackHandler, StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

LogBox.ignoreAllLogs(true);
import { TabBar, TabKey } from './src/components/navigation/TabBar';
import { TodayScreen } from './src/screens/TodayScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { StatisticsScreen } from './src/screens/StatisticsScreen';
import { AreasScreen } from './src/screens/AreasScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ArchiveScreen } from './src/screens/ArchiveScreen';
import { HabitFormModal } from './src/components/habit/HabitFormModal';
import { HabitDetailModal } from './src/components/habit/HabitDetailModal';
import { AreaFormModal } from './src/components/area/AreaFormModal';
import { getDatabase } from './src/db/client';
import { NotificationService } from './src/services/notificationService';
import { useHabitStore } from './src/store/useHabitStore';
import { useAreaStore } from './src/store/useAreaStore';
import { useSettingsStore } from './src/store/useSettingsStore';
import { COLORS, useThemeColors } from './src/constants/theme';
import { HabitWithTodayEntry, AreaWithStats, Habit, Area } from './src/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [activeSubScreen, setActiveSubScreen] = useState<'settings' | 'archive' | null>(null);

  const [tabHistory, setTabHistory] = useState<TabKey[]>(['today']);

  // Modallar
  const [habitFormVisible, setHabitFormVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [habitDetailVisible, setHabitDetailVisible] = useState(false);
  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<HabitWithTodayEntry | null>(null);

  const [areaFormVisible, setAreaFormVisible] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  const {
    loadTodayHabits,
    createHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,
  } = useHabitStore();

  const {
    loadAreas,
    createArea,
    updateArea,
  } = useAreaStore();

  const { settings, loadSettings } = useSettingsStore();
  const colors = useThemeColors();

  // 1. Veritabanı ve bildirim kanallarını başlat
  useEffect(() => {
    try {
      getDatabase();
      NotificationService.setupChannels();
      loadTodayHabits();
      loadAreas();
      loadSettings();
    } catch (error) {
      console.error('Uygulama başlatma hatası:', error);
    }
  }, []);

  // Sekme Değişikliği ve Geçmiş Yönetimi
  const handleTabChange = (tab: TabKey) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setTabHistory((prev) => {
      const filtered = prev.filter((t) => t !== tab);
      return [...filtered, tab];
    });
  };

  // 2. Merkezi Geri Tuşu İşleyicisi (Donanım + Arayüz Başlık Geri Butonu)
  const handleBack = useCallback((): boolean => {
    // 1. Modallar açık ise kapat
    if (habitFormVisible) {
      setHabitFormVisible(false);
      setEditingHabit(null);
      return true;
    }
    if (habitDetailVisible) {
      setHabitDetailVisible(false);
      setSelectedHabitForDetail(null);
      return true;
    }
    if (areaFormVisible) {
      setAreaFormVisible(false);
      setEditingArea(null);
      return true;
    }

    // 2. Alt ekranlar açık ise geri dön
    if (activeSubScreen === 'archive') {
      setActiveSubScreen('settings');
      return true;
    }
    if (activeSubScreen === 'settings') {
      setActiveSubScreen(null);
      return true;
    }

    // 3. Sekmeler arası geçmiş (History Stack)
    if (tabHistory.length > 1) {
      const newHistory = [...tabHistory];
      newHistory.pop(); // Mevcut sekmeyi pop et
      const prevTab = newHistory[newHistory.length - 1] || 'today';
      setTabHistory(newHistory);
      setActiveTab(prevTab);
      return true;
    }

    // 4. Ana sekme haricindeyse Bugün sekmesine dön
    if (activeTab !== 'today') {
      setActiveTab('today');
      setTabHistory(['today']);
      return true;
    }

    // 5. Ana sekmede (Today) ve hiçbir şey açık değil:
    // Doğal Android geri davranışına izin ver (uygulamayı arka plana al/küçült)
    return false;
  }, [
    habitFormVisible,
    habitDetailVisible,
    areaFormVisible,
    activeSubScreen,
    tabHistory,
    activeTab,
  ]);

  // Android Donanım / Hareket Geri Tuşu Dinleyicisi
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => sub.remove();
  }, [handleBack]);

  // Alışkanlık Kaydetme İşleyicisi
  const handleSaveHabit = async (habitData: any, reminders?: { timeOfDay: string; daysOfWeek: number[] }[]) => {
    if (editingHabit) {
      await updateHabit(habitData, reminders);
    } else {
      await createHabit(habitData, reminders);
    }
    loadTodayHabits();
    loadAreas();
  };

  // Alan Kaydetme İşleyicisi
  const handleSaveArea = (areaData: Omit<Area, 'createdAt' | 'updatedAt'>) => {
    if (editingArea) {
      updateArea(areaData);
    } else {
      createArea(areaData);
    }
    loadAreas();
    loadTodayHabits();
  };

  // Ekran Render Seçimi
  const renderCurrentScreen = () => {
    if (activeSubScreen === 'settings') {
      return (
        <SettingsScreen
          onBack={handleBack}
          onOpenArchive={() => setActiveSubScreen('archive')}
        />
      );
    }

    if (activeSubScreen === 'archive') {
      return (
        <ArchiveScreen
          onBack={handleBack}
        />
      );
    }

    switch (activeTab) {
      case 'today':
        return (
          <TodayScreen
            onOpenSettings={() => setActiveSubScreen('settings')}
            onOpenCreateHabit={() => {
              setEditingHabit(null);
              setHabitFormVisible(true);
            }}
            onOpenHabitDetail={(habit) => {
              setSelectedHabitForDetail(habit);
              setHabitDetailVisible(true);
            }}
            onEditHabit={(habit) => {
              setEditingHabit(habit);
              setHabitFormVisible(true);
            }}
          />
        );

      case 'calendar':
        return (
          <CalendarScreen
            onBack={handleBack}
            onOpenCreateHabit={() => {
              setEditingHabit(null);
              setHabitFormVisible(true);
            }}
            onEditHabit={(habit) => {
              setEditingHabit(habit);
              setHabitFormVisible(true);
            }}
          />
        );

      case 'stats':
        return <StatisticsScreen onBack={handleBack} />;

      case 'areas':
        return (
          <AreasScreen
            onOpenCreateArea={() => {
              setEditingArea(null);
              setAreaFormVisible(true);
            }}
            onEditArea={(area) => {
              setEditingArea(area);
              setAreaFormVisible(true);
            }}
            onBack={handleBack}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={settings.theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.bgPrimary}
        translucent={false}
      />
      <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        {renderCurrentScreen()}

        {/* Ana Sekme Çubuğu (Yalnızca alt ekran açık değilken gösterilir) */}
        {!activeSubScreen && (
          <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
        )}

        {/* Alışkanlık Ekle/Düzenle Modalı */}
        <HabitFormModal
          visible={habitFormVisible}
          onClose={() => {
            setHabitFormVisible(false);
            setEditingHabit(null);
          }}
          onSave={handleSaveHabit}
          initialHabit={editingHabit}
        />

        {/* Alışkanlık Detay Modalı */}
        <HabitDetailModal
          visible={habitDetailVisible}
          habit={selectedHabitForDetail}
          onClose={() => {
            setHabitDetailVisible(false);
            setSelectedHabitForDetail(null);
          }}
          onEdit={(habit) => {
            setEditingHabit(habit);
            setHabitFormVisible(true);
          }}
          onArchive={async (id) => {
            await archiveHabit(id);
            loadTodayHabits();
          }}
          onDelete={async (id) => {
            await deleteHabit(id);
            loadTodayHabits();
          }}
        />

        {/* Yaşam Alanı Ekle/Düzenle Modalı */}
        <AreaFormModal
          visible={areaFormVisible}
          onClose={() => {
            setAreaFormVisible(false);
            setEditingArea(null);
          }}
          onSave={handleSaveArea}
          initialArea={editingArea}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
});
