import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, useThemeColors } from '../../constants/theme';
import { haptic } from '../../utils/haptics';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  size = 'md',
}) => {
  const colors = useThemeColors();

  const handlePress = () => {
    if (disabled || loading) return;
    if (variant === 'destructive') {
      haptic.warning();
    } else {
      haptic.light();
    }
    onPress();
  };

  const dynamicVariantStyle =
    variant === 'primary'
      ? { backgroundColor: colors.blue }
      : variant === 'secondary'
      ? { backgroundColor: colors.surface2, borderColor: colors.borderSubtle }
      : variant === 'destructive'
      ? { backgroundColor: 'rgba(244, 63, 94, 0.12)', borderColor: 'rgba(244, 63, 94, 0.25)' }
      : { backgroundColor: 'transparent' };

  const dynamicTextStyle =
    variant === 'primary'
      ? { color: '#FFFFFF' }
      : variant === 'secondary'
      ? { color: colors.textPrimary }
      : variant === 'destructive'
      ? { color: colors.rose }
      : { color: colors.textSecondary };

  const buttonStyles = [
    styles.base,
    styles[variant],
    dynamicVariantStyle,
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.textBase,
    styles[`text_${variant}`],
    dynamicTextStyle,
    styles[`textSize_${size}`],
    disabled && [styles.textDisabled, { color: colors.textMuted }],
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={buttonStyles}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : COLORS.textPrimary}
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  // Boyutlar
  size_sm: {
    height: 36,
    paddingHorizontal: SPACING.md,
  },
  size_md: {
    height: 48,
    paddingHorizontal: SPACING.lg,
  },
  size_lg: {
    height: 56,
    paddingHorizontal: SPACING.xl,
  },
  // Varyantlar
  primary: {
    backgroundColor: COLORS.blue,
  },
  secondary: {
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  destructive: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
  },
  // Metin Stilleri
  textBase: {
    fontWeight: '600',
  },
  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: 15,
  },
  textSize_lg: {
    fontSize: 17,
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: COLORS.textPrimary,
  },
  text_destructive: {
    color: COLORS.rose,
  },
  text_ghost: {
    color: COLORS.textSecondary,
  },
  textDisabled: {
    color: COLORS.textMuted,
  },
});
