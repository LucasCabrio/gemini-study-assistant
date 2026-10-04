# Relatório de QA

Data: 04/10/2026. Ambiente: Windows, Node.js 24.14, Chrome headless, Expo Web SDK 57, Gemini 3.1 Flash-Lite.

## Resultados

| Verificação | Resultado |
| --- | --- |
| Instalação limpa `npm ci` e `expo install --check` | Aprovados, dependências compatíveis com SDK 57 |
| `npm test` | 48 testes aprovados |
| `npm run typecheck` | Backend e frontend aprovados |
| `npm run build` | API compilada e Expo Web exportado |
| `/health` | HTTP 200, envelope consistente |
| `node scripts/smoke-gemini.mjs` | 4 endpoints reais, HTTP 200 |
| `npm run qa:web` | Fluxo completo aprovado no Chrome |
| Validação e limites HTTP | Texto vazio/curto/longo, quantidade, JSON malformado, payload excessivo e campos desconhecidos |
| Erros | Sem stack ou detalhes internos, 429/502/503/504 testados |
| Quiz | Seleção correta/incorreta, gabarito, explicação, pontuação 1/2 e reinício |
| Revisão | Revelação, ocultação e nova revelação de resposta |
| UX | Loading, botão desabilitado, validação, limpar e mensagens de erro |
| Responsividade | Desktop 1440 px em duas colunas, viewport móvel 390 px empilhada, sem overflow horizontal ou formulário fora do cartão |
| Segurança | `.env` ignorado, exemplos vazios, nenhuma credencial nas capturas |
| PowerPoint e PDF | Seis slides/páginas 16:9, nomes e RAs corretos, screenshots reais e revisão visual |

As quatro gerações e screenshots usam o Gemini real. Apenas os cenários de falha de rede e rate limit no teste web são simulados. Testes unitários/HTTP usam mocks, sem consumir a API.

## Capturas
- `screenshots/01-inicio.png`: tela inicial
- `screenshots/02-resumo.png`: resumo real
- `screenshots/03-explicacao.png`: explicação real
- `screenshots/04-perguntas.png`: revisão com resposta revelada
- `screenshots/05-quiz.png`: quiz respondido
- `screenshots/06-quiz-detalhe.png`: gabarito e pontuação
- `screenshots/07-resumo-detalhe.png`: resultado completo
- `screenshots/08-responsivo.png`: viewport móvel
- `screenshots/09-responsivo-resultado.png`: área de resultado no mobile
- `screenshots/10-responsivo-formulario.png`: controles e validação no mobile

## Refatoração da interface acadêmica
QA repetido após extração do frontend em `mobile/src/`. As quatro atividades continuam usando chamadas reais ao Gemini. A inspeção visual confirmou o tema azul/branco/cinza e a remoção dos elementos promocionais. O teste móvel inclui a geometria dos cartões, a contenção do botão de geração e sua operação após rolagem. `App.tsx` tem cinco linhas; componentes, estilos, hook, serviço, tipos, constantes e tema estão separados. `npm run format:check` inclui todos os arquivos novos em `mobile/src`.

## Auditoria de dependências
`npm audit --omit=dev -w backend`: **0 vulnerabilidades** nas dependências de produção do backend.

A auditoria geral registra **23 ocorrências transitivas (16 altas e 7 moderadas)** na cadeia Expo/Metro, originadas por `braces`, `node-forge` e `uuid`. `npm audit fix` não oferece uma correção compatível para todas elas. A sugestão `--force` regrediria o Expo para SDK 44; não foi aplicada. Essas dependências pertencem às ferramentas de desenvolvimento/build e configuração nativa, e não são usadas nos endpoints do backend. O Expo/Metro deve permanecer restrito ao ambiente de desenvolvimento. Reavaliar o audit quando houver correção upstream. Nenhum override incompatível foi introduzido para mascarar o relatório.

## Limites desta validação
- Sem teste em Android/iOS físico ou em simulador nativo.
- Sem implantação pública, autenticação ou teste de carga distribuída.
- Limites da conta Gemini podem variar; requisições reais usam a cota configurada no Google.
- Health check não comprova validade da chave; o smoke real comprova o funcionamento no momento do teste.
- O PPTX passou por validação estrutural, reimportação e renderização de todos os slides. Não houve abertura no aplicativo Microsoft PowerPoint neste ambiente.
- O PDF preserva o layout como páginas renderizadas em alta resolução. Para editar textos ou o diagrama, utilizar o PPTX.
