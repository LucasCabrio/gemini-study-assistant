import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  header: {
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  title: typography.title,
  subtitle: { ...typography.body, color: colors.textSecondary },
});
