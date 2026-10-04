import type { TextStyle } from 'react-native';
import { colors } from './colors';
export const typography = {
  title: { fontSize: 28, lineHeight: 36, fontWeight: '700', color: colors.text },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: '600', color: colors.text },
  subheading: { fontSize: 16, lineHeight: 24, fontWeight: '600', color: colors.text },
  body: { fontSize: 15, lineHeight: 24, color: colors.text },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.text },
  caption: { fontSize: 12, lineHeight: 18, color: colors.textSecondary },
} satisfies Record<string, TextStyle>;
