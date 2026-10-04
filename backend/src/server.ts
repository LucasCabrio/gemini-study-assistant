import 'dotenv/config';
import { createApp } from './app.js';
import { createGemini } from './gemini.js';
const port = Number(process.env.PORT ?? 3001);
const app = createApp(createGemini(process.env.GEMINI_API_KEY, process.env.GEMINI_MODEL), {
  origin: process.env.CORS_ORIGIN,
  configured: Boolean(process.env.GEMINI_API_KEY),
});
app.listen(port, () => console.log(`Study API disponível na porta ${port}`));
