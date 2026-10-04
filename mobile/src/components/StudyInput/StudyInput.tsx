import { Pressable, Text, TextInput, View } from 'react-native';
import { contentLimits } from '../../constants/studyActions';
import { colors } from '../../theme/colors';
import { styles } from './styles';
type Props = {
  content: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onExample: () => void;
};
export function StudyInput({ content, disabled, onChange, onExample }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          Conteúdo de estudo
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onExample}
          style={styles.example}
        >
          <Text style={[styles.link, disabled && styles.disabled]}>Usar exemplo</Text>
        </Pressable>
      </View>
      <Text style={styles.label}>Insira um texto ou tema para estudar.</Text>
      <TextInput
        accessibilityLabel="Conteúdo de estudo"
        editable={!disabled}
        multiline
        maxLength={contentLimits.max}
        value={content}
        onChangeText={onChange}
        placeholder="Cole suas anotações ou descreva o tema de estudo."
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        textAlignVertical="top"
      />
      <View style={styles.counter}>
        <Text style={styles.caption}>Mínimo de {contentLimits.min} caracteres</Text>
        <Text style={styles.caption}>
          {content.length.toLocaleString('pt-BR')} / {contentLimits.max.toLocaleString('pt-BR')}
        </Text>
      </View>
    </View>
  );
}
