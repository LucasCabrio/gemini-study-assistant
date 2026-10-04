import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  section: { gap: spacing.md },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: typography.heading,
  example: { paddingVertical: spacing.sm },
  link: { ...typography.label, color: colors.primary },
  disabled: { opacity: 0.55 },
  label: { ...typography.body, color: colors.textSecondary },
  input: {
    ...typography.body,
    minHeight: 224,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.lg,
  },
  counter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  caption: typography.caption,
});
