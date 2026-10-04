import type { Action } from '../types/study';
export const studyActions: { id: Action; title: string; description: string }[] = [
  { id: 'summarize', title: 'Resumo', description: 'Síntese e pontos principais' },
  { id: 'explain', title: 'Explicação', description: 'Conteúdo explicado por etapas' },
  { id: 'questions', title: 'Questões', description: 'Perguntas abertas para revisão' },
  { id: 'quiz', title: 'Quiz', description: 'Questões de múltipla escolha' },
];
export const contentLimits = { min: 20, max: 12000 };
export const questionCounts = [2, 3, 4, 5];
export const defaultQuestionCount = 3;
export const supportsQuestionCount = (action: Action) =>
  action === 'questions' || action === 'quiz';
