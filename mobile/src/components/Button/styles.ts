import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  label: { ...typography.label, color: colors.surface },
  secondary: { backgroundColor: colors.surface, borderColor: colors.border },
  secondaryLabel: { color: colors.primary },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.55 },
});
