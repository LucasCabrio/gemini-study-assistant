import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  section: { gap: spacing.lg },
  title: typography.subheading,
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  action: {
    flexBasis: '46%',
    flexGrow: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 80,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.selected },
  selectedText: { color: colors.primary },
  disabled: { opacity: 0.55 },
  actionTitle: typography.label,
  description: typography.caption,
  label: typography.label,
  countRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  countOptions: { flexDirection: 'row', gap: spacing.sm },
  count: {
    minWidth: 44,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
