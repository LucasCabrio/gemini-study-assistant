import { SafeAreaView, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ActionSelector } from '../../components/ActionSelector/ActionSelector';
import { Button } from '../../components/Button/Button';
import { Header } from '../../components/Header/Header';
import { ResultPanel } from '../../components/ResultPanel/ResultPanel';
import { StudyInput } from '../../components/StudyInput/StudyInput';
import { useStudyAssistant } from '../../hooks/useStudyAssistant';
import { layout } from '../../theme/spacing';
import { styles } from './styles';

export function HomeScreen() {
  const study = useStudyAssistant();
  const { width } = useWindowDimensions();
  const compact = width < layout.compactBreakpoint;
  const stacked = width < layout.desktopBreakpoint;
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.page, compact && styles.compactPage]}>
        <Header />
        <View style={[styles.columns, stacked && styles.stacked]}>
          <View
            testID="input-panel"
            style={[styles.card, stacked && styles.stackedCard, compact && styles.compactCard]}
          >
            <StudyInput
              content={study.content}
              disabled={study.loading}
              onChange={study.setContent}
              onExample={study.loadExample}
            />
            <ActionSelector
              action={study.action}
              count={study.count}
              disabled={study.loading}
              onActionChange={study.setAction}
              onCountChange={study.setCount}
            />
            {study.error ? (
              <View accessibilityRole="alert" style={styles.error}>
                <Text style={styles.errorText}>{study.error}</Text>
              </View>
            ) : null}
            <View style={styles.buttons}>
              <View style={styles.generate}>
                <Button
                  label={study.loading ? 'Gerando conteúdo…' : 'Gerar conteúdo'}
                  onPress={study.generate}
                  disabled={study.loading}
                />
              </View>
              <Button label="Limpar" onPress={study.clear} secondary disabled={study.loading} />
            </View>
            <Text style={styles.caption}>
              Seu texto será enviado ao Google Gemini. Evite dados pessoais ou confidenciais.
            </Text>
          </View>
          <View
            testID="result-panel"
            style={[styles.card, stacked && styles.stackedCard, compact && styles.compactCard]}
          >
            <ResultPanel
              action={study.action}
              loading={study.loading}
              result={study.result}
              answers={study.answers}
              revealed={study.revealed}
              onAnswer={study.selectAnswer}
              onToggleAnswer={study.toggleAnswer}
              onRetryQuiz={study.retryQuiz}
            />
          </View>
        </View>
        <Text style={styles.footer}>Projeto acadêmico — Estudo e revisão de conteúdos</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
