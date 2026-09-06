import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, useThemeColors } from '../../constants/theme';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const colors = useThemeColors();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface2,
            borderColor: colors.borderSubtle,
            color: colors.textPrimary,
          },
          isFocused && [styles.inputFocused, { borderColor: colors.borderFocus }],
          Boolean(error) && [styles.inputError, { borderColor: colors.rose }],
          style,
        ]}
        {...props}
      />
      {Boolean(error) && <Text style={[styles.errorText, { color: colors.rose }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface1,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 15,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: COLORS.borderFocus,
  },
  inputError: {
    borderColor: COLORS.rose,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.rose,
    marginTop: SPACING.xs,
  },
});
