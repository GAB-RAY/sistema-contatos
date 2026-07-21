# Status do Projeto

## Etapa atual

**Etapa 1 — Fundação: concluída tecnicamente e aguardando aprovação.**

A Etapa 2 não foi iniciada.

## Entregas concluídas

- [x] Pasta `backend` criada.
- [x] Projeto Node.js inicializado com CommonJS.
- [x] Estrutura modular criada dentro de `src`.
- [x] Domínios futuros reservados em `src/modulos`, sem implementação antecipada.
- [x] Express configurado.
- [x] Classe `AppError` criada.
- [x] Middleware central `tratarErro` criado.
- [x] Helmet configurado.
- [x] CORS configurado por lista explícita de origens.
- [x] Limite configurável para corpo JSON aplicado.
- [x] Rate limiting global básico aplicado.
- [x] Rota `GET /saude` criada.
- [x] Resposta JSON para rotas inexistentes configurada.
- [x] Testes unitários e de integração preparados.
- [x] Dependências mínimas instaladas e documentadas.
- [x] `README.md` e `STATUS_PROJETO.md` atualizados.

## Validações executadas

### Validação de sintaxe

- 13 arquivos JavaScript verificados com `node --check`.
- Resultado: nenhum erro de sintaxe.

### Primeira execução automatizada

- Comando: `npm test`.
- Resultado: 4 suítes aprovadas, 11 testes aprovados e 0 falhas.
- Não houve erro funcional a corrigir.

### Segunda execução automatizada

- Comando: `npm run test:coverage`.
- Resultado: 4 suítes aprovadas, 11 testes aprovados e 0 falhas.
- Cobertura total: 94,52% das instruções, 92,1% dos ramos, 85,71% das funções e 94,52% das linhas.

### Validação final do fluxo real

- `src/server.js` iniciado temporariamente pela função `iniciarServidor`.
- Requisição HTTP real enviada para `GET /saude`.
- Resultado: HTTP 200 com `{"status":"ok"}`.
- Regressão final com `npm test`: 4 suítes aprovadas, 11 testes aprovados e 0 falhas.

### Dependências

- `npm audit` executado automaticamente durante a instalação.
- Resultado: 0 vulnerabilidades encontradas.

## Dependências diretas desta etapa

Produção:

- `express`
- `dotenv`
- `helmet`
- `cors`
- `express-rate-limit`

Desenvolvimento e testes:

- `jest`
- `supertest`

## Itens deliberadamente não iniciados

- conexão com PostgreSQL;
- verificação das 14 tabelas;
- autenticação e usuários;
- módulos de negócio;
- endpoint e lógica do formulário público;
- importação CSV/XLSX;
- frontend;
- API do WhatsApp;
- campanhas;
- chatbox;
- código para as quatro tabelas futuras.

## Próximo marco bloqueado por aprovação

A Etapa 2 prevê conexão com o PostgreSQL e verificação das 14 tabelas. Nenhum trabalho desse marco deve começar antes da autorização explícita do responsável pelo projeto.
