import { Text, View } from 'react-native';
import type { QuizAnswers, QuizQuestion as Question } from '../../types/study';
import { Button } from '../Button/Button';
import { QuizQuestion } from './QuizQuestion';
import { styles } from './styles';
type Props = {
  questions: Question[];
  answers: QuizAnswers;
  onAnswer: (question: number, option: number) => void;
  onRetry: () => void;
};
export function Quiz({ questions, answers, onAnswer, onRetry }: Props) {
  const complete = questions.every((_, index) => answers[index] !== undefined);
  const score = questions.filter(
    (question, index) => question.correctIndex === answers[index],
  ).length;
  return (
    <View style={styles.list}>
      {questions.map((question, index) => (
        <QuizQuestion
          key={index}
          question={question}
          index={index}
          selected={answers[index]}
          onSelect={(option) => onAnswer(index, option)}
        />
      ))}
      {complete && (
        <View style={styles.score}>
          <Text accessibilityLiveRegion="polite" style={styles.questionTitle}>
            Você acertou {score} de {questions.length}!
          </Text>
          <Button secondary label="Tentar novamente" onPress={onRetry} />
        </View>
      )}
    </View>
  );
}
