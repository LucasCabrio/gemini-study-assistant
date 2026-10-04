import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius, layout } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  page: {
    maxWidth: layout.maxWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  compactPage: { paddingHorizontal: spacing.lg },
  columns: { flexDirection: 'row', gap: spacing.xl, alignItems: 'stretch' },
  stacked: { flexDirection: 'column' },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.xl,
  },
  compactCard: { padding: spacing.lg },
  stackedCard: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto' },
  buttons: { flexDirection: 'row', gap: spacing.md },
  generate: { flex: 1 },
  caption: typography.caption,
  error: { backgroundColor: colors.dangerBackground, padding: spacing.md, borderRadius: radius.sm },
  errorText: { ...typography.body, color: colors.danger },
  footer: { ...typography.caption, marginTop: spacing.xl },
});
