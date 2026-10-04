import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
// Teste ponta a ponta: todas as gerações abaixo usam o backend e o Gemini reais.
await fs.mkdir('docs/screenshots', { recursive: true });
const browser = await chromium.launch({
  channel: process.env.QA_BROWSER ?? 'chrome',
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1180 },
  deviceScaleFactor: 1,
});
const failures = [];
page.on('pageerror', (error) => failures.push(error.message));
try {
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Resultado', exact: true })).toBeVisible();
  const desktopInput = await page.getByTestId('input-panel').boundingBox();
  const desktopResult = await page.getByTestId('result-panel').boundingBox();
  if (!desktopInput || !desktopResult || desktopResult.x <= desktopInput.x)
    throw new Error('As áreas devem ficar lado a lado no desktop');
  await page.screenshot({ path: 'docs/screenshots/01-inicio.png', fullPage: true });
  await page.getByRole('button', { name: 'Gerar conteúdo', exact: false }).click();
  await expect(page.getByRole('alert')).toContainText('20 caracteres');
  await page.getByRole('button', { name: 'Usar exemplo' }).click();
  for (const [action, file] of [
    ['Resumo', '02-resumo'],
    ['Explicação', '03-explicacao'],
    ['Questões', '04-perguntas'],
    ['Quiz', '05-quiz'],
  ]) {
    await page.getByRole('button', { name: action, exact: true }).click();
    if (action === 'Questões' || action === 'Quiz')
      await page.getByRole('button', { name: '2 perguntas', exact: true }).click();
    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/api/study/') && r.request().method() === 'POST',
      { timeout: 45000 },
    );
    await page.getByRole('button', { name: 'Gerar conteúdo', exact: false }).click();
    await expect(page.getByRole('button', { name: 'Gerando conteúdo…' })).toBeDisabled();
    const response = await responsePromise;
    const body = await response.json();
    if (!response.ok()) throw new Error(`${action}: HTTP ${response.status()} ${body.error?.code}`);
    await expect(page.getByTestId('study-result')).toBeVisible();
    if (action === 'Questões') {
      await page.getByRole('button', { name: 'Ver resposta 1', exact: true }).click();
      await expect(page.getByText(body.data.questions[0].answer, { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Ocultar resposta 1', exact: true }).click();
      await expect(page.getByText(body.data.questions[0].answer, { exact: true })).toHaveCount(0);
      await page.getByRole('button', { name: 'Ver resposta 1', exact: true }).click();
    }
    if (action === 'Quiz') {
      for (let i = 0; i < body.data.questions.length; i++) {
        const correct = body.data.questions[i].correctIndex;
        const choice = i === 0 ? correct : (correct + 1) % 4;
        await page
          .getByRole('button', {
            name: new RegExp(`^Questão ${i + 1}, alternativa ${String.fromCharCode(65 + choice)}:`),
          })
          .click();
      }
      await expect(page.getByText('Você acertou 1 de 2!')).toBeVisible();
      await expect(page.getByText('Acertou!', { exact: false })).toBeVisible();
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `docs/screenshots/${file}.png`, fullPage: true });
    if (action === 'Quiz')
      await page
        .getByTestId('study-result')
        .screenshot({ path: 'docs/screenshots/06-quiz-detalhe.png' });
    if (action === 'Resumo')
      await page
        .getByTestId('study-result')
        .screenshot({ path: 'docs/screenshots/07-resumo-detalhe.png' });
    console.log(`${action}: geração real, renderização e interação OK`);
  }
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.getByText('Você acertou 1 de 2!')).toHaveCount(0);
  await page.getByRole('button', { name: 'Limpar', exact: true }).click();
  await expect(page.getByLabel('Conteúdo de estudo')).toHaveValue('');
  // Falhas de rede e limite são simuladas explicitamente, sem salvar como geração real.
  await page.getByRole('button', { name: 'Usar exemplo' }).click();
  await page.route('**/api/study/**', (route) =>
    route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: { message: 'O limite do Gemini foi atingido. Aguarde e tente novamente.' },
      }),
    }),
  );
  await page.getByRole('button', { name: 'Gerar conteúdo', exact: false }).click();
  await expect(page.getByRole('alert')).toContainText('limite do Gemini');
  await page.unroute('**/api/study/**');
  await page.route('**/api/study/**', (route) => route.abort());
  await page.getByRole('button', { name: 'Gerar conteúdo', exact: false }).click();
  await expect(page.getByRole('alert')).toContainText('conectar à API');
  await page.unroute('**/api/study/**');
  await page.getByRole('button', { name: 'Limpar', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Resumo', exact: true })).toBeVisible();
  const mobileInput = await page.getByTestId('input-panel').boundingBox();
  const mobileResult = await page.getByTestId('result-panel').boundingBox();
  if (!mobileInput || !mobileResult || mobileResult.y < mobileInput.y + mobileInput.height)
    throw new Error('As áreas devem ficar empilhadas no mobile');
  const generateButton = await page
    .getByRole('button', { name: 'Gerar conteúdo', exact: true })
    .boundingBox();
  if (
    !generateButton ||
    generateButton.y + generateButton.height > mobileInput.y + mobileInput.height
  )
    throw new Error('O formulário não pode transbordar do cartão no mobile');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  if (overflow) throw new Error('Overflow horizontal na viewport móvel');
  await page.screenshot({ path: 'docs/screenshots/08-responsivo.png', fullPage: true });
  await page.getByRole('button', { name: 'Gerar conteúdo', exact: true }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Gerar conteúdo', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('20 caracteres');
  await page.screenshot({ path: 'docs/screenshots/10-responsivo-formulario.png' });
  await page.getByRole('button', { name: 'Limpar', exact: true }).click();
  await page.getByTestId('result-panel').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'docs/screenshots/09-responsivo-resultado.png' });
  if (failures.length) throw new Error(failures.join('\n'));
  console.log(
    'QA web OK: 4 gerações reais, quiz, revisão, loading, validação, limpeza, erros simulados e responsividade.',
  );
} finally {
  await browser.close();
}
