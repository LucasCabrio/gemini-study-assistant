import { Pressable, Text, View } from 'react-native';
import type { QuizQuestion as Question } from '../../types/study';
import { styles } from './styles';
type Props = {
  question: Question;
  index: number;
  selected?: number;
  onSelect: (option: number) => void;
};
export function QuizQuestion({ question, index, selected, onSelect }: Props) {
  const answered = selected !== undefined;
  return (
    <View style={styles.question}>
      <Text style={styles.questionTitle}>
        {index + 1}. {question.question}
      </Text>
      {question.options.map((option, optionIndex) => (
        <Pressable
          key={optionIndex}
          accessibilityRole="button"
          accessibilityLabel={`Questão ${index + 1}, alternativa ${String.fromCharCode(65 + optionIndex)}: ${option}`}
          accessibilityState={{ selected: selected === optionIndex, disabled: answered }}
          disabled={answered}
          onPress={() => onSelect(optionIndex)}
          style={[
            styles.option,
            answered && optionIndex === question.correctIndex && styles.correct,
            selected === optionIndex && optionIndex !== question.correctIndex && styles.incorrect,
          ]}
        >
          <Text style={styles.body}>
            {String.fromCharCode(65 + optionIndex)}. {option}
          </Text>
        </Pressable>
      ))}
      {answered && (
        <Text accessibilityLiveRegion="polite" style={styles.feedback}>
          {selected === question.correctIndex
            ? 'Acertou!'
            : `Resposta correta: ${String.fromCharCode(65 + question.correctIndex)}`}
          {'\n'}
          {question.explanation}
        </Text>
      )}
    </View>
  );
}
