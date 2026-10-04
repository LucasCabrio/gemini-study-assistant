import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const actions = [
  { id: 'summarize', icon: '≡', title: 'Resumir', hint: 'O essencial, em poucas palavras' },
  { id: 'explain', icon: '✧', title: 'Explicar', hint: 'Entenda passo a passo' },
  { id: 'questions', icon: '?', title: 'Revisar', hint: 'Perguntas para fixar' },
  { id: 'quiz', icon: '✓', title: 'Quiz', hint: 'Coloque-se à prova' },
] as const;
type Action = (typeof actions)[number]['id'];
type Question = {
  question: string;
  answer?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
};
type Result = {
  title: string;
  summary?: string;
  explanation?: string;
  keyPoints?: string[];
  steps?: string[];
  questions?: Question[];
};
const sample =
  'A fotossíntese é o processo pelo qual plantas, algas e algumas bactérias convertem energia luminosa em energia química. Nas plantas, ocorre nos cloroplastos, que contêm clorofila. Água e dióxido de carbono são utilizados para produzir glicose, liberando oxigênio. A fase luminosa depende da luz e produz ATP e NADPH. O ciclo de Calvin utiliza essas moléculas para fixar carbono e formar açúcares.';
const api = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        (disabled || pressed) && { opacity: 0.55 },
      ]}
    >
      <Text style={[s.buttonText, secondary && { color: '#4d467d' }]}>{label}</Text>
    </Pressable>
  );
}
export default function App() {
  const wide = useWindowDimensions().width >= 940;
  const [content, setContent] = useState('');
  const [action, setAction] = useState<Action>('summarize');
  const [resultAction, setResultAction] = useState<Action>('summarize');
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const busy = useRef(false);
  const selection = actions.find((a) => a.id === action)!;
  async function generate() {
    if (busy.current) return;
    if (content.trim().length < 20) {
      setError('Escreva pelo menos 20 caracteres para começar.');
      return;
    }
    busy.current = true;
    setLoading(true);
    setError('');
    setResult(null);
    setAnswers({});
    setRevealed({});
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 38000);
    try {
      const response = await fetch(`${api}/api/study/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          ...(['questions', 'quiz'].includes(action) ? { count } : {}),
        }),
        signal: controller.signal,
      });
      const body = await response.json();
      if (!response.ok || !body.success)
        throw new Error(body.error?.message ?? 'Não foi possível gerar o conteúdo.');
      setResult(body.data);
      setResultAction(action);
    } catch (e) {
      setError(
        e instanceof Error && e.name === 'AbortError'
          ? 'A geração demorou demais. Tente novamente.'
          : e instanceof TypeError
            ? 'Não foi possível conectar à API. Verifique se o backend está em execução.'
            : e instanceof Error
              ? e.message
              : 'Ocorreu um erro. Tente novamente.',
      );
    } finally {
      clearTimeout(timer);
      busy.current = false;
      setLoading(false);
    }
  }
  function clear() {
    setContent('');
    setResult(null);
    setError('');
    setAnswers({});
    setRevealed({});
  }
  return (
    <SafeAreaView style={s.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={s.page}>
        <View style={s.nav}>
          <View style={s.brand}>
            <View style={s.logo}>
              <Text style={s.logoText}>✦</Text>
            </View>
            <View>
              <Text style={s.brandName}>
                Gemini Study<Text style={{ color: '#776b9b' }}> Assistant</Text>
              </Text>
              <Text style={s.navCaption}>SEU ESPAÇO PARA APRENDER</Text>
            </View>
          </View>
          <View style={s.badge}>
            <Text style={s.badgeText}>✧ Com Google Gemini</Text>
          </View>
        </View>
        <View style={s.hero}>
          <Text style={s.eyebrow}>MENOS DÚVIDAS. MAIS DESCOBERTAS.</Text>
          <Text accessibilityRole="header" style={[s.heroTitle, !wide && { fontSize: 34 }]}>
            Seu conteúdo,{'\n'}um novo jeito de <Text style={{ color: '#7160cf' }}>entender.</Text>
          </Text>
          <Text style={s.subtitle}>
            Transforme suas anotações em resumos, explicações e desafios.{'\n'}Escolha como quer
            estudar hoje.
          </Text>
        </View>
        <View style={[s.columns, !wide && { flexDirection: 'column' }]}>
          <View style={[s.card, { flex: 1 }]}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>01 Seu material</Text>
              <Pressable
                accessibilityRole="button"
                disabled={loading}
                onPress={() => {
                  setContent(sample);
                  setError('');
                }}
              >
                <Text style={s.link}>Usar exemplo</Text>
              </Pressable>
            </View>
            <Text style={s.label}>Cole suas anotações ou escreva um tema</Text>
            <TextInput
              accessibilityLabel="Conteúdo de estudo"
              editable={!loading}
              multiline
              maxLength={12000}
              value={content}
              onChangeText={setContent}
              placeholder={
                'O que vamos aprender hoje?\n\nCole aqui um trecho do seu material de estudo...'
              }
              placeholderTextColor="#9995a9"
              style={s.input}
              textAlignVertical="top"
            />
            <View style={s.between}>
              <Text style={s.small}>Mínimo de 20 caracteres</Text>
              <Text style={s.small}>{content.length.toLocaleString('pt-BR')} / 12.000</Text>
            </View>
            <Text style={[s.sectionTitle, { marginTop: 26, marginBottom: 14 }]}>
              02 Seu jeito de estudar
            </Text>
            <View style={s.actionGrid}>
              {actions.map((a) => (
                <Pressable
                  key={a.id}
                  accessibilityRole="button"
                  accessibilityLabel={a.title}
                  accessibilityState={{ selected: action === a.id }}
                  disabled={loading}
                  onPress={() => setAction(a.id)}
                  style={[s.action, action === a.id && s.actionSelected]}
                >
                  <Text style={[s.actionIcon, action === a.id && { color: '#6953c4' }]}>
                    {a.icon}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.actionTitle}>{a.title}</Text>
                    <Text style={s.actionHint}>{a.hint}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
            {['quiz', 'questions'].includes(action) && (
              <View style={[s.between, { marginTop: 16 }]}>
                <Text style={s.label}>Quantidade de perguntas</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[2, 3, 4, 5].map((n) => (
                    <Pressable
                      key={n}
                      accessibilityRole="button"
                      accessibilityLabel={`${n} perguntas`}
                      disabled={loading}
                      onPress={() => setCount(n)}
                      style={[s.count, count === n && { backgroundColor: '#e8e1ff' }]}
                    >
                      <Text>{n}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
            {error ? (
              <View accessibilityRole="alert" style={s.error}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              <View style={{ flex: 1 }}>
                <Button
                  label={loading ? 'Gerando conteúdo…' : 'Gerar conteúdo  ✧'}
                  onPress={generate}
                  disabled={loading}
                />
              </View>
              <Button label="Limpar" onPress={clear} secondary disabled={loading} />
            </View>
            <Text style={[s.small, { marginTop: 14, lineHeight: 18 }]}>
              Seu texto será enviado ao Google Gemini. Evite dados pessoais ou confidenciais.
            </Text>
          </View>
          <View style={[s.card, s.resultCard, { flex: 1.04 }]}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>Seu espaço de aprendizado</Text>
              <View style={s.miniBadge}>
                <Text style={s.small}>
                  {result ? actions.find((a) => a.id === resultAction)?.title : selection.title}
                </Text>
              </View>
            </View>
            {loading ? (
              <View style={s.empty}>
                <ActivityIndicator size="large" color="#7160cf" />
                <Text style={s.emptyTitle}>Organizando suas ideias…</Text>
                <Text style={s.emptyText}>
                  O Gemini está preparando seu material.{'\n'}Isso pode levar alguns segundos.
                </Text>
              </View>
            ) : result ? (
              <View testID="study-result" style={{ gap: 18 }}>
                <Text style={s.resultTitle}>{result.title}</Text>
                {(result.summary || result.explanation) && (
                  <Text selectable style={s.body}>
                    {result.summary ?? result.explanation}
                  </Text>
                )}
                {(result.keyPoints ?? result.steps)?.map((p, i) => (
                  <View key={i} style={s.point}>
                    <Text style={s.pointNumber}>{String(i + 1).padStart(2, '0')}</Text>
                    <Text selectable style={[s.body, { flex: 1 }]}>
                      {p}
                    </Text>
                  </View>
                ))}
                {result.questions?.map((q, i) => (
                  <View key={i} style={s.question}>
                    <Text style={s.questionTitle}>
                      {i + 1}. {q.question}
                    </Text>
                    {q.options ? (
                      q.options.map((option, j) => (
                        <Pressable
                          key={j}
                          accessibilityRole="button"
                          accessibilityLabel={`Questão ${i + 1}, alternativa ${String.fromCharCode(65 + j)}: ${option}`}
                          disabled={answers[i] !== undefined}
                          onPress={() => setAnswers((a) => ({ ...a, [i]: j }))}
                          style={[
                            s.option,
                            answers[i] !== undefined && j === q.correctIndex && s.correct,
                            answers[i] === j && j !== q.correctIndex && s.incorrect,
                          ]}
                        >
                          <Text style={s.body}>
                            {String.fromCharCode(65 + j)}. {option}
                          </Text>
                        </Pressable>
                      ))
                    ) : (
                      <Button
                        secondary
                        label={revealed[i] ? 'Ocultar resposta' : `Ver resposta ${i + 1}`}
                        onPress={() => setRevealed((r) => ({ ...r, [i]: !r[i] }))}
                      />
                    )}
                    {q.options && answers[i] !== undefined && (
                      <Text accessibilityLiveRegion="polite" style={s.feedback}>
                        {answers[i] === q.correctIndex
                          ? 'Acertou!'
                          : `Resposta correta: ${String.fromCharCode(65 + q.correctIndex!)}`}
                        {'\n'}
                        {q.explanation}
                      </Text>
                    )}
                    {revealed[i] && <Text style={s.body}>{q.answer}</Text>}
                  </View>
                ))}
                {resultAction === 'quiz' &&
                  result.questions &&
                  Object.keys(answers).length === result.questions.length && (
                    <View style={s.score}>
                      <Text style={s.sectionTitle}>
                        Você acertou{' '}
                        {result.questions.filter((q, i) => q.correctIndex === answers[i]).length} de{' '}
                        {result.questions.length}!
                      </Text>
                      <Button secondary label="Tentar novamente" onPress={() => setAnswers({})} />
                    </View>
                  )}
                <Text style={s.small}>
                  Conteúdo gerado por IA. Confira com seu material e seu professor.
                </Text>
              </View>
            ) : (
              <View style={s.empty}>
                <View style={s.emptyIcon}>
                  <Text style={{ fontSize: 44, color: '#8c7dd5' }}>✧</Text>
                </View>
                <Text style={s.emptyTitle}>O próximo “entendi!” começa aqui.</Text>
                <Text style={s.emptyText}>
                  Adicione seu conteúdo ao lado e escolha{'\n'}uma das quatro formas de aprender.
                </Text>
                <View style={s.emptyPills}>
                  <Text style={s.pill}>Leia</Text>
                  <Text style={s.pill}>Entenda</Text>
                  <Text style={s.pill}>Pratique</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        <View style={s.footer}>
          <Text style={s.small}>Feito para aprender, uma ideia de cada vez.</Text>
          <Text style={s.small}>PROJETO ACADÊMICO / 2026</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f6fb' },
  page: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 30,
    paddingBottom: 28,
  },
  nav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 26,
    borderBottomWidth: 1,
    borderColor: '#e7e3ef',
  },
  brand: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  logo: {
    width: 44,
    height: 44,
    backgroundColor: '#7160cf',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: 'white', fontSize: 28 },
  brandName: { fontSize: 19, fontWeight: '700', color: '#2e284b' },
  navCaption: { fontSize: 9, letterSpacing: 2, marginTop: 5, color: '#8c859f' },
  badge: {
    backgroundColor: '#eeebf7',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  badgeText: { color: '#65578f', fontSize: 12 },
  hero: { paddingVertical: 36 },
  eyebrow: {
    color: '#887caa',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 43,
    lineHeight: 49,
    fontWeight: '700',
    letterSpacing: -1.4,
    color: '#302a49',
  },
  subtitle: { color: '#858094', fontSize: 15, lineHeight: 24, marginTop: 15 },
  columns: { flexDirection: 'row', gap: 24, alignItems: 'stretch' },
  card: {
    backgroundColor: 'white',
    borderRadius: 22,
    padding: 26,
    borderWidth: 1,
    borderColor: '#eae6f2',
  },
  resultCard: { backgroundColor: '#fefeff' },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 22,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#39304f' },
  link: { color: '#7765c1', fontSize: 12, fontWeight: '600' },
  label: { fontSize: 12, color: '#6f687f', marginBottom: 8 },
  input: {
    minHeight: 182,
    backgroundColor: '#faf9fd',
    borderWidth: 1,
    borderColor: '#e6e1ef',
    borderRadius: 12,
    padding: 16,
    color: '#453d59',
    fontSize: 14,
    lineHeight: 23,
  },
  between: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  small: { fontSize: 11, color: '#9690a5' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#ebe7f2',
    padding: 12,
    borderRadius: 12,
    minHeight: 73,
  },
  actionSelected: { backgroundColor: '#f2edff', borderColor: '#ab98e7' },
  actionIcon: { fontSize: 23, color: '#9c93b4', width: 23 },
  actionTitle: { fontSize: 13, fontWeight: '700', color: '#4c425f' },
  actionHint: { fontSize: 10, color: '#91899e', marginTop: 5 },
  button: {
    backgroundColor: '#7560cb',
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 13 },
  secondary: { backgroundColor: '#f1edf8' },
  count: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#f7f5fb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: { marginTop: 16, padding: 13, backgroundColor: '#fff0f0', borderRadius: 10 },
  errorText: { color: '#a63c4e', lineHeight: 21, fontSize: 13 },
  miniBadge: {
    backgroundColor: '#f1eef8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  empty: {
    flex: 1,
    minHeight: 440,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    backgroundColor: '#f4f0fc',
    width: 86,
    height: 86,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 23,
  },
  emptyTitle: {
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '600',
    color: '#6b617d',
    marginTop: 10,
  },
  emptyText: { textAlign: 'center', fontSize: 13, lineHeight: 23, color: '#a09aac', marginTop: 12 },
  emptyPills: { flexDirection: 'row', gap: 10, marginTop: 28 },
  pill: {
    fontSize: 11,
    color: '#a49bb6',
    backgroundColor: '#f7f5fb',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 14,
  },
  resultTitle: { fontSize: 23, fontWeight: '700', color: '#514371', lineHeight: 30 },
  body: { fontSize: 14, lineHeight: 23, color: '#6b627a' },
  point: {
    flexDirection: 'row',
    gap: 13,
    backgroundColor: '#f8f6fd',
    padding: 14,
    borderRadius: 12,
  },
  pointNumber: { color: '#9c87d6', fontSize: 14, fontWeight: '700', paddingTop: 3 },
  question: { gap: 10, borderTopWidth: 1, borderColor: '#ece7f5', paddingTop: 18 },
  questionTitle: { fontWeight: '600', fontSize: 15, lineHeight: 23, color: '#51466c' },
  option: { borderWidth: 1, borderColor: '#e7e0f2', borderRadius: 10, padding: 11 },
  correct: { backgroundColor: '#e7f5ed', borderColor: '#75b48f' },
  incorrect: { backgroundColor: '#fcebed', borderColor: '#dca0ab' },
  feedback: { color: '#5d5473', fontSize: 13, lineHeight: 22 },
  score: { gap: 14, backgroundColor: '#efeafb', padding: 18, borderRadius: 12 },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
    marginTop: 28,
  },
});
