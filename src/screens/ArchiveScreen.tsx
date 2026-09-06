import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RotateCcw, Trash2, Archive as ArchiveIcon } from 'lucide-react-native';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { AppHeader } from '../components/common/AppHeader';
import { AppIcon } from '../components/common/AppIcon';
import { RADIUS, SPACING, TYPOGRAPHY, useThemeColors } from '../constants/theme';
import { STRINGS } from '../constants/strings';
import { useHabitStore } from '../store/useHabitStore';
import { Habit } from '../types';
import { haptic } from '../utils/haptics';

interface ArchiveScreenProps {
  onBack: () => void;
}

export const ArchiveScreen: React.FC<ArchiveScreenProps> = ({ onBack }) => {
  const colors = useThemeColors();
  const { archivedHabits, loadArchivedHabits, restoreHabit, deleteHabit } = useHabitStore();

  useEffect(() => {
    loadArchivedHabits();
  }, []);

  const handleRestore = (habit: Habit) => {
    haptic.success();
    restoreHabit(habit.id);
  };

  const handleDeletePermanent = (habit: Habit) => {
    Alert.alert(
      STRINGS.habitDetail.delete,
      STRINGS.habitDetail.deleteConfirm,
      [
        { text: STRINGS.common.cancel, style: 'cancel' },
        {
          text: STRINGS.common.delete,
          style: 'destructive',
          onPress: () => {
            haptic.warning();
            deleteHabit(habit.id);
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <AppHeader title={STRINGS.archive.title} showBack onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {archivedHabits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ArchiveIcon size={44} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{STRINGS.archive.emptyMessage}</Text>
          </View>
        ) : (
          archivedHabits.map((habit) => {
            const habitColor = habit.color || colors.blue;

            return (
              <View
                key={habit.id}
                style={[
                  styles.itemCard,
                  { backgroundColor: colors.surface1, borderColor: colors.borderSubtle },
                ]}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.iconBox, { backgroundColor: `${habitColor}20` }]}>
                    <AppIcon name={habit.icon} size={20} color={habitColor} />
                  </View>
                  <View>
                    <Text style={[styles.habitName, { color: colors.textPrimary }]}>{habit.name}</Text>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {habit.type === 'build' ? STRINGS.habitForm.typeBuild : STRINGS.habitForm.typeQuit}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => handleRestore(habit)}
                    style={[
                      styles.restoreBtn,
                      { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                    ]}
                  >
                    <RotateCcw size={15} color={colors.blue} />
                    <Text style={[styles.restoreBtnText, { color: colors.blue }]}>{STRINGS.archive.restore}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeletePermanent(habit)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={15} color={colors.rose} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    marginTop: SPACING.md,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: {
    ...TYPOGRAPHY.bodyLarge,
  },
  metaText: {
    ...TYPOGRAPHY.tiny,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  restoreBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: RADIUS.sm,
  },
});
