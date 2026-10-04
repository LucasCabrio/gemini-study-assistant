import { supportsQuestionCount } from '../constants/studyActions';
import type { StudyRequest, StudyResult } from '../types/study';
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
const requestTimeout = 38000;

export async function generateStudyContent(request: StudyRequest): Promise<StudyResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeout);
  try {
    const response = await fetch(`${apiUrl}/api/study/${request.action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: request.content,
        ...(supportsQuestionCount(request.action) ? { count: request.count } : {}),
      }),
      signal: controller.signal,
    });
    const body = await response.json();
    if (!response.ok || !body.success)
      throw new Error(body.error?.message ?? 'Não foi possível gerar o conteúdo.');
    // A API própria valida o contrato de saída com Zod antes de responder.
    return { action: request.action, data: body.data } as StudyResult;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError')
      throw new Error('A geração demorou demais. Tente novamente.');
    if (error instanceof TypeError)
      throw new Error('Não foi possível conectar à API. Verifique se o backend está em execução.');
    if (error instanceof SyntaxError)
      throw new Error('A API retornou uma resposta inválida. Tente novamente.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
