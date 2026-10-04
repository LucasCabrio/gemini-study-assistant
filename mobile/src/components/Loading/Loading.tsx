import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { styles } from './styles';
export function Loading() {
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityState={{ busy: true }}
      style={styles.container}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.title}>Preparando o material de estudo</Text>
      <Text style={styles.description}>A geração pode levar alguns segundos.</Text>
    </View>
  );
}
