import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { AppError, inputSchema, parseResult, promptFor, actions } from '../src/study.js';
import { createGemini, mapGeminiError } from '../src/gemini.js';
const content = 'A fotossíntese transforma energia luminosa em energia química.';
const summary = {
  title: 'Fotossíntese',
  summary: 'Conversão de energia.',
  keyPoints: ['Luz', 'Energia química'],
};
describe('Validações e regras', () => {
  it.each(['', 'curto', ' '.repeat(30), 'x'.repeat(12001)])('rejeita conteúdo inválido', (value) =>
    expect(inputSchema.safeParse({ content: value }).success).toBe(false),
  );
  it('normaliza espaços externos, controles e quebras', () =>
    expect(inputSchema.parse({ content: `  ${content}\r\n\u0000  ` }).content).toBe(content));
  it.each([0, 1, 6, 2.5, '3', null])('limita quantidade', (count) =>
    expect(inputSchema.safeParse({ content, count }).success).toBe(false),
  );
  it('aceita limites de tamanho e quantidade', () => {
    expect(inputSchema.safeParse({ content: 'x'.repeat(12000), count: 5 }).success).toBe(true);
    expect(inputSchema.safeParse({ content: 'x'.repeat(20), count: 2 }).success).toBe(true);
  });
  it.each(actions)('cria prompt específico: %s', (action) => {
    expect(promptFor(action, { content, count: 2 })).toContain(JSON.stringify(content));
  });
  it('valida resumo', () =>
    expect(parseResult('summarize', JSON.stringify(summary))).toEqual(summary));
  it.each(['bad', '{}', '{"title":"x","summary":"x","keyPoints":[]}'])(
    'rejeita saída inválida',
    (text) => expect(() => parseResult('summarize', text)).toThrow(AppError),
  );
  it('rejeita quantidade incorreta de questões', () =>
    expect(() =>
      parseResult(
        'questions',
        JSON.stringify({
          title: 'Teste',
          questions: [
            { question: 'O quê?', answer: 'Isso' },
            { question: 'Como?', answer: 'Assim' },
          ],
        }),
        3,
      ),
    ).toThrow(AppError));
  it('rejeita alternativas repetidas e índices inválidos', () => {
    for (const q of [
      { options: ['A', 'a', 'C', 'D'], correctIndex: 0 },
      { options: ['A', 'B', 'C', 'D'], correctIndex: 4 },
    ])
      expect(() =>
        parseResult(
          'quiz',
          JSON.stringify({
            title: 'Quiz',
            questions: Array.from({ length: 2 }, () => ({
              question: 'Questão?',
              explanation: 'Explicação',
              ...q,
            })),
          }),
          2,
        ),
      ).toThrow(AppError);
  });
});
describe('API REST', () => {
  it('health não expõe configuração sensível', async () => {
    const r = await request(createApp(vi.fn())).get('/health');
    expect(r.status).toBe(200);
    expect(r.body.data).toEqual({ status: 'ok', geminiConfigured: false });
  });
  it.each(actions)('executa endpoint %s', async (action) => {
    const generate = vi.fn().mockResolvedValue(summary);
    const r = await request(createApp(generate)).post(`/api/study/${action}`).send({ content });
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ success: true, data: summary });
    expect(generate).toHaveBeenCalledWith(action, { content });
  });
  it('não chama Gemini com entrada inválida', async () => {
    const generate = vi.fn();
    const r = await request(createApp(generate)).post('/api/study/quiz').send({ content: 'oi' });
    expect(r.status).toBe(400);
    expect(generate).not.toHaveBeenCalled();
  });
  it('rejeita campos desconhecidos', async () =>
    expect(
      (await request(createApp(vi.fn())).post('/api/study/quiz').send({ content, apiKey: 'dummy' }))
        .status,
    ).toBe(400));
  it('quantidade somente em perguntas e quiz', async () =>
    expect(
      (await request(createApp(vi.fn())).post('/api/study/summarize').send({ content, count: 2 }))
        .status,
    ).toBe(400));
  it('JSON inválido retorna envelope consistente', async () => {
    const r = await request(createApp(vi.fn()))
      .post('/api/study/quiz')
      .set('Content-Type', 'application/json')
      .send('{');
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe('INVALID_JSON');
  });
  it('limita tamanho HTTP', async () =>
    expect(
      (
        await request(createApp(vi.fn()))
          .post('/api/study/quiz')
          .send({ content: 'x'.repeat(70000) })
      ).status,
    ).toBe(413));
  it('trata endpoint inexistente', async () =>
    expect((await request(createApp(vi.fn())).get('/unknown')).status).toBe(404));
  it('trata ação inválida', async () =>
    expect(
      (await request(createApp(vi.fn())).post('/api/study/other').send({ content })).status,
    ).toBe(404));
  it('oculta mensagens internas e stack', async () => {
    const r = await request(createApp(vi.fn().mockRejectedValue(new Error('secret-internal'))))
      .post('/api/study/summarize')
      .send({ content });
    expect(r.status).toBe(500);
    expect(JSON.stringify(r.body)).not.toContain('secret-internal');
    expect(r.body.error.stack).toBeUndefined();
  });
  it('limita solicitações', async () => {
    const app = createApp(vi.fn().mockResolvedValue(summary), { rateMax: 1 });
    await request(app).post('/api/study/summarize').send({ content });
    const r = await request(app).post('/api/study/summarize').send({ content });
    expect(r.status).toBe(429);
    expect(r.headers['retry-after']).toBe('60');
  });
  it.each([429, 502, 503, 504])('propaga erro seguro %s', async (status) => {
    const r = await request(
      createApp(vi.fn().mockRejectedValue(new AppError(status, 'SAFE', 'Erro público'))),
    )
      .post('/api/study/explain')
      .send({ content });
    expect(r.status).toBe(status);
    expect(r.body.error.message).toBe('Erro público');
  });
});
describe('Integração Gemini', () => {
  it('falha claramente sem chave', async () =>
    expect(createGemini()('summarize', { content })).rejects.toMatchObject({
      status: 503,
      code: 'MISSING_API_KEY',
    }));
  it.each([
    [429, 429],
    [400, 503],
    [401, 503],
    [403, 503],
    [404, 503],
    [500, 502],
  ])('mapeia status %s', (status, expected) =>
    expect(mapGeminiError({ status }).status).toBe(expected),
  );
  it('mapeia timeout', () =>
    expect(mapGeminiError(new DOMException('timeout', 'TimeoutError')).status).toBe(504));
});
