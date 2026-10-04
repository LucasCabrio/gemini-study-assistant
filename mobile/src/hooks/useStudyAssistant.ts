import { useRef, useState } from 'react';
import { sampleContent } from '../constants/sampleContent';
import { contentLimits, defaultQuestionCount } from '../constants/studyActions';
import { generateStudyContent } from '../services/api';
import type { Action, QuizAnswers, RevealedAnswers, StudyResult } from '../types/study';

export function useStudyAssistant() {
  const [content, setContent] = useState('');
  const [action, setAction] = useState<Action>('summarize');
  const [count, setCount] = useState(defaultQuestionCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<StudyResult | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [revealed, setRevealed] = useState<RevealedAnswers>({});
  const busy = useRef(false);
  function resetResults() {
    setResult(null);
    setError('');
    setAnswers({});
    setRevealed({});
  }
  async function generate() {
    if (busy.current) return;
    if (content.trim().length < contentLimits.min) {
      setError(`Escreva pelo menos ${contentLimits.min} caracteres para começar.`);
      return;
    }
    busy.current = true;
    setLoading(true);
    resetResults();
    try {
      setResult(await generateStudyContent({ action, content, count }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocorreu um erro. Tente novamente.');
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }
  function clear() {
    if (busy.current) return;
    setContent('');
    resetResults();
  }
  function loadExample() {
    if (busy.current) return;
    setContent(sampleContent);
    setError('');
  }
  function selectAnswer(question: number, option: number) {
    setAnswers((previous) =>
      previous[question] === undefined ? { ...previous, [question]: option } : previous,
    );
  }
  return {
    content,
    setContent,
    action,
    setAction,
    count,
    setCount,
    loading,
    error,
    result,
    answers,
    revealed,
    generate,
    clear,
    loadExample,
    selectAnswer,
    toggleAnswer: (index: number) =>
      setRevealed((previous) => ({ ...previous, [index]: !previous[index] })),
    retryQuiz: () => setAnswers({}),
  };
}
