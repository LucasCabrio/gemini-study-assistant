import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  list: { gap: spacing.xl },
  question: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.lg,
  },
  questionTitle: typography.subheading,
  body: typography.body,
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  correct: { backgroundColor: colors.successBackground, borderColor: colors.success },
  incorrect: { backgroundColor: colors.dangerBackground, borderColor: colors.danger },
  feedback: { ...typography.body, color: colors.textSecondary },
  score: {
    gap: spacing.lg,
    backgroundColor: colors.selected,
    padding: spacing.lg,
    borderRadius: radius.sm,
  },
});
