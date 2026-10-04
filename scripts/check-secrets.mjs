import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import dotenv from 'dotenv';

// Verifica o conteúdo staged sem imprimir valores sensíveis.
const paths = execFileSync('git', ['diff', '--cached', '--name-only', '-z'])
  .toString()
  .split('\0')
  .filter(Boolean);
const env = fs.existsSync('backend/.env') ? dotenv.parse(fs.readFileSync('backend/.env')) : {};
const secrets = [env.GEMINI_API_KEY, process.env.GEMINI_API_KEY].filter(Boolean);
const blocked = [];
for (const path of paths) {
  if (/(^|\/)\.env($|\.)/.test(path) && !path.endsWith('.env.example')) {
    blocked.push(path);
    continue;
  }
  let content;
  try {
    content = execFileSync('git', ['show', `:${path}`], { maxBuffer: 30 * 1024 * 1024 });
  } catch {
    // Arquivo removido do index.
    continue;
  }
  const text = content.toString('utf8');
  if (secrets.some((value) => text.includes(value)) || /AIza[0-9A-Za-z_-]{35}/.test(text))
    blocked.push(path);
}
if (blocked.length) {
  console.error('Commit bloqueado: conteúdo sensível em', blocked.join(', '));
  process.exitCode = 1;
} else {
  console.log(`Verificação concluída: ${paths.length} arquivos staged, nenhuma chave detectada.`);
}
