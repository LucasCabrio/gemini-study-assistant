import { Text, View } from 'react-native';
import { studyActions } from '../../constants/studyActions';
import type { Action, QuizAnswers, RevealedAnswers, StudyResult } from '../../types/study';
import { Loading } from '../Loading/Loading';
import { Quiz } from '../Quiz/Quiz';
import { ReviewQuestions } from '../ReviewQuestions/ReviewQuestions';
import { styles } from './styles';
type Props = {
  action: Action;
  loading: boolean;
  result: StudyResult | null;
  answers: QuizAnswers;
  revealed: RevealedAnswers;
  onAnswer: (question: number, option: number) => void;
  onToggleAnswer: (index: number) => void;
  onRetryQuiz: () => void;
};
export function ResultPanel({
  action,
  loading,
  result,
  answers,
  revealed,
  onAnswer,
  onToggleAnswer,
  onRetryQuiz,
}: Props) {
  const label = studyActions.find((item) => item.id === (result?.action ?? action))?.title;
  const paragraphs =
    result?.action === 'summarize'
      ? result.data.keyPoints
      : result?.action === 'explain'
        ? result.data.steps
        : [];
  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.heading}>
          Resultado
        </Text>
        <Text style={styles.activity}>{label}</Text>
      </View>
      {loading ? (
        <Loading />
      ) : result ? (
        <View testID="study-result" style={styles.result}>
          <Text accessibilityRole="header" style={styles.title}>
            {result.data.title}
          </Text>
          {result.action === 'summarize' && (
            <Text selectable style={styles.body}>
              {result.data.summary}
            </Text>
          )}
          {result.action === 'explain' && (
            <Text selectable style={styles.body}>
              {result.data.explanation}
            </Text>
          )}
          {paragraphs.map((paragraph, index) => (
            <View key={index} style={styles.point}>
              <Text style={styles.number}>{index + 1}.</Text>
              <Text selectable style={styles.pointText}>
                {paragraph}
              </Text>
            </View>
          ))}
          {result.action === 'questions' && (
            <ReviewQuestions
              questions={result.data.questions}
              revealed={revealed}
              onToggle={onToggleAnswer}
            />
          )}
          {result.action === 'quiz' && (
            <Quiz
              questions={result.data.questions}
              answers={answers}
              onAnswer={onAnswer}
              onRetry={onRetryQuiz}
            />
          )}
          <Text style={styles.disclaimer}>
            Conteúdo gerado por IA. Confira com seu material e seu professor.
          </Text>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nenhuma atividade gerada</Text>
          <Text style={styles.emptyText}>
            Insira seu material, escolha o tipo de atividade e selecione “Gerar conteúdo”. O
            resultado aparecerá nesta área.
          </Text>
        </View>
      )}
    </View>
  );
}
