import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { actions, AppError, inputSchema, type Action } from './study.js';
import type { Generate } from './gemini.js';

export function createApp(
  generate: Generate,
  options: { origin?: string; rateMax?: number; configured?: boolean } = {},
) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: options.origin ?? 'http://localhost:8081' }));
  app.use(express.json({ limit: '64kb' }));
  app.get('/health', (_req, res) =>
    res.json({
      success: true,
      data: { status: 'ok', geminiConfigured: options.configured ?? false },
    }),
  );
  app.use(
    '/api',
    rateLimit({
      windowMs: 60000,
      limit: options.rateMax ?? 10,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      handler: (_req, _res, next) =>
        next(
          new AppError(
            429,
            'RATE_LIMIT',
            'Limite de 10 solicitações por minuto. Aguarde antes de tentar novamente.',
          ),
        ),
    }),
  );
  app.post('/api/study/:action', async (req, res) => {
    if (!actions.includes(req.params.action as Action))
      throw new AppError(404, 'UNKNOWN_ACTION', 'Funcionalidade não encontrada.');
    const action = req.params.action as Action;
    const parsed = inputSchema.safeParse(req.body);
    if (!parsed.success)
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        parsed.error.issues.map((v) => `${v.path.join('.') || 'Entrada'}: ${v.message}`).join(' '),
      );
    if (parsed.data.count !== undefined && (action === 'summarize' || action === 'explain'))
      throw new AppError(400, 'INVALID_COUNT', 'Quantidade só se aplica a perguntas e quiz.');
    const data = await generate(action, parsed.data);
    res.json({ success: true, data });
  });
  app.use((_req, _res, next) => next(new AppError(404, 'NOT_FOUND', 'Endpoint não encontrado.')));
  const errors: ErrorRequestHandler = (error, _req, res, _next) => {
    const e =
      error instanceof AppError
        ? error
        : error?.type === 'entity.too.large'
          ? new AppError(413, 'PAYLOAD_TOO_LARGE', 'Corpo da requisição muito grande.')
          : error instanceof SyntaxError
            ? new AppError(400, 'INVALID_JSON', 'JSON inválido.')
            : new AppError(500, 'INTERNAL_ERROR', 'Não foi possível processar a solicitação.');
    if (e.status === 429) res.setHeader('Retry-After', '60');
    res.status(e.status).json({ success: false, error: { code: e.code, message: e.message } });
  };
  app.use(errors);
  return app;
}
