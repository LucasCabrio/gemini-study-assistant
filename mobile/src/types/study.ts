export type Action = 'summarize' | 'explain' | 'questions' | 'quiz';
export type ReviewQuestion = { question: string; answer: string };
export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};
export type StudyData = {
  summarize: { title: string; summary: string; keyPoints: string[] };
  explain: { title: string; explanation: string; steps: string[] };
  questions: { title: string; questions: ReviewQuestion[] };
  quiz: { title: string; questions: QuizQuestion[] };
};
export type StudyResult = { [K in Action]: { action: K; data: StudyData[K] } }[Action];
export type StudyRequest = { action: Action; content: string; count: number };
export type QuizAnswers = Record<number, number>;
export type RevealedAnswers = Record<number, boolean>;
