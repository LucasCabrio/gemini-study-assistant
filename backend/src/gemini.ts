import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import {
  AppError,
  parseResult,
  promptFor,
  schemas,
  systemInstruction,
  type Action,
  type Input,
} from './study.js';

export type Generate = (action: Action, input: Input) => Promise<ReturnType<typeof parseResult>>;
export function mapGeminiError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  const status =
    typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : 0;
  if (status === 429)
    return new AppError(
      429,
      'GEMINI_RATE_LIMIT',
      'O limite do Gemini foi atingido. Aguarde e tente novamente.',
    );
  if (status === 400 || status === 401 || status === 403)
    return new AppError(
      503,
      'GEMINI_CONFIGURATION',
      'Não foi possível autenticar ou configurar o Gemini. Verifique a configuração do servidor.',
    );
  if (status === 404)
    return new AppError(
      503,
      'MODEL_UNAVAILABLE',
      'O modelo configurado está indisponível. Verifique GEMINI_MODEL no servidor.',
    );
  if (error instanceof Error && /abort|timeout/i.test(error.name + error.message))
    return new AppError(504, 'GEMINI_TIMEOUT', 'A geração demorou demais. Tente novamente.');
  return new AppError(
    502,
    'GEMINI_UNAVAILABLE',
    'O Gemini está indisponível no momento. Tente novamente.',
  );
}
export function createGemini(apiKey?: string, model = 'gemini-3.1-flash-lite'): Generate {
  const client = apiKey ? new GoogleGenAI({ apiKey }) : null;
  return async (action, input) => {
    if (!client)
      throw new AppError(
        503,
        'MISSING_API_KEY',
        'Configure GEMINI_API_KEY no backend para gerar conteúdo.',
      );
    try {
      const response = await client.models.generateContent({
        model,
        contents: promptFor(action, input),
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseJsonSchema: z.toJSONSchema(schemas[action]),
          temperature: 0.3,
          maxOutputTokens: 4096,
          httpOptions: { timeout: 30000 },
          abortSignal: AbortSignal.timeout(32000),
        },
      });
      return parseResult(action, response.text ?? '', input.count ?? 3);
    } catch (error) {
      throw mapGeminiError(error);
    }
  };
}
