import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  panel: { flex: 1, gap: spacing.xl },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingBottom: spacing.lg,
  },
  heading: typography.heading,
  activity: { ...typography.label, color: colors.textSecondary },
  result: { gap: spacing.lg },
  title: typography.heading,
  body: typography.body,
  point: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm },
  number: { ...typography.label, color: colors.primary, paddingTop: spacing.xs },
  pointText: { ...typography.body, flex: 1 },
  disclaimer: {
    ...typography.caption,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.lg,
  },
  empty: {
    flex: 1,
    minHeight: 320,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.section,
  },
  emptyTitle: { ...typography.subheading, textAlign: 'center' },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 360,
  },
});
