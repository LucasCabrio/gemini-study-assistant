import { Text, View } from 'react-native';
import type { RevealedAnswers, ReviewQuestion } from '../../types/study';
import { Button } from '../Button/Button';
import { styles } from './styles';
type Props = {
  questions: ReviewQuestion[];
  revealed: RevealedAnswers;
  onToggle: (index: number) => void;
};
export function ReviewQuestions({ questions, revealed, onToggle }: Props) {
  return (
    <View style={styles.list}>
      {questions.map((question, index) => (
        <View key={index} style={styles.question}>
          <Text style={styles.title}>
            {index + 1}. {question.question}
          </Text>
          <Button
            secondary
            label={revealed[index] ? `Ocultar resposta ${index + 1}` : `Ver resposta ${index + 1}`}
            onPress={() => onToggle(index)}
          />
          {revealed[index] && (
            <Text selectable style={styles.answer}>
              {question.answer}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
