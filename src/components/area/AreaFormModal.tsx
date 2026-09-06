import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AppModal } from '../common/AppModal';
import { AppInput } from '../common/AppInput';
import { AppButton } from '../common/AppButton';
import { AppIcon } from '../common/AppIcon';
import { PALETTE_OPTIONS, ICON_OPTIONS, RADIUS, SPACING, TYPOGRAPHY, useThemeColors } from '../../constants/theme';
import { STRINGS } from '../../constants/strings';
import { Area } from '../../types';
import { haptic } from '../../utils/haptics';

interface AreaFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (area: Omit<Area, 'createdAt' | 'updatedAt'>) => void;
  initialArea?: Area | null;
}

export const AreaFormModal: React.FC<AreaFormModalProps> = ({
  visible,
  onClose,
  onSave,
  initialArea,
}) => {
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(colors.emerald);
  const [icon, setIcon] = useState<string>('book-open');
  const [errorName, setErrorName] = useState('');

  useEffect(() => {
    if (initialArea) {
      setName(initialArea.name);
      setColor(initialArea.color);
      setIcon(initialArea.icon);
    } else {
      setName('');
      setColor(colors.emerald);
      setIcon('book-open');
    }
    setErrorName('');
  }, [initialArea, visible, colors]);

  const handleSave = () => {
    if (!name.trim()) {
      setErrorName('Lütfen alan adını giriniz.');
      haptic.warning();
      return;
    }

    const payload = {
      id: initialArea ? initialArea.id : `area_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      icon,
      color,
      sortOrder: initialArea ? initialArea.sortOrder : 0,
    };

    haptic.success();
    onSave(payload);
    onClose();
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={initialArea ? STRINGS.areas.editArea : STRINGS.areas.newArea}
    >
      <View style={styles.form}>
        <AppInput
          label={STRINGS.areas.areaName}
          placeholder="Örn: Sağlık, Felsefe, Yazılım"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errorName) setErrorName('');
          }}
          error={errorName}
        />

        {/* Renk Seçimi */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{STRINGS.areas.areaColor}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollList}
        >
          {PALETTE_OPTIONS.map((item) => (
            <TouchableOpacity
              key={item.name}
              onPress={() => {
                haptic.selection();
                setColor(item.value);
              }}
              style={[
                styles.colorCircle,
                { backgroundColor: item.value },
                color === item.value && styles.colorSelected,
              ]}
            />
          ))}
        </ScrollView>

        {/* İkon Seçimi */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{STRINGS.areas.areaIcon}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollList}
        >
          {ICON_OPTIONS.map((iconName) => (
            <TouchableOpacity
              key={iconName}
              onPress={() => {
                haptic.selection();
                setIcon(iconName);
              }}
              style={[
                styles.iconBox,
                { backgroundColor: colors.surface2, borderColor: colors.borderSubtle },
                icon === iconName && {
                  borderColor: color,
                  backgroundColor: `${color}20`,
                },
              ]}
            >
              <AppIcon
                name={iconName}
                size={22}
                color={icon === iconName ? color : colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <AppButton
          title={STRINGS.common.save}
          onPress={handleSave}
          size="lg"
          style={{ marginTop: SPACING.lg }}
        />
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  form: {
    paddingBottom: SPACING.xl,
  },
  label: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.xs,
  },
  scroll: {
    marginBottom: SPACING.lg,
  },
  scrollList: {
    gap: 10,
    paddingVertical: 4,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
