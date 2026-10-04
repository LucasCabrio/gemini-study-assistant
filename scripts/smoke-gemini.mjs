// Chama a API própria. Nenhuma chave ou conteúdo privado é impresso.
const content =
  'A fotossíntese converte energia luminosa em energia química. Nas plantas, ocorre nos cloroplastos. A clorofila absorve luz. Água e dióxido de carbono são usados para produzir glicose, com liberação de oxigênio.';
let failed = false;
for (const action of ['summarize', 'explain', 'questions', 'quiz']) {
  const response = await fetch(`http://localhost:3001/api/study/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      ...(['questions', 'quiz'].includes(action) ? { count: 2 } : {}),
    }),
  });
  const body = await response.json();
  console.log(`${action}: HTTP ${response.status} ${body.success ? 'OK' : body.error?.code}`);
  if (!response.ok) failed = true;
}
process.exitCode = failed ? 1 : 0;
