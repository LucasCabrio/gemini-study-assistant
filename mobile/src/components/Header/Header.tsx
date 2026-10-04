import { Text, View } from 'react-native';
import { styles } from './styles';
export function Header() {
  return (
    <View style={styles.header}>
      <Text accessibilityRole="header" style={styles.title}>
        Gemini Study Assistant
      </Text>
      <Text style={styles.subtitle}>Assistente acadêmico para estudo e revisão de conteúdos</Text>
    </View>
  );
}
