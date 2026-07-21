# Backend do Sistema de Contatos

Fundação modular em Node.js e Express para o Sistema de Contatos. O projeto usa CommonJS e mantém cada domínio dentro de `src/modulos`, conforme o prompt mestre.

## Status atual

A Etapa 1 — Fundação está implementada e validada. Nesta etapa não existe conexão com PostgreSQL, autenticação, regra de negócio, frontend ou integração externa.

## Requisitos

- Node.js e npm instalados.
- Um arquivo `.env` local criado a partir de `.env.example`.

## Instalação e execução

No PowerShell, a partir da pasta `backend`:

```powershell
Copy-Item .env.example .env
npm install
npm test
npm start
```

O servidor usa a porta `3000` por padrão. A verificação de disponibilidade fica em:

```text
GET http://localhost:3000/saude
```

Resposta esperada:

```json
{
  "status": "ok"
}
```

A rota apenas confirma que o processo HTTP está disponível. Ela não consulta o banco nesta etapa.

## Variáveis de ambiente

| Variável | Padrão | Finalidade |
| --- | --- | --- |
| `PORTA` | `3000` | Porta usada pelo servidor HTTP. |
| `ORIGENS_CORS` | lista vazia | Origens oficiais permitidas, separadas por vírgula. |
| `LIMITE_JSON` | `100kb` | Tamanho máximo aceito para corpos JSON. |
| `LIMITE_REQUISICOES_JANELA_MS` | `900000` | Janela global do rate limit, em milissegundos. |
| `LIMITE_REQUISICOES_MAXIMO` | `100` | Máximo de requisições por cliente dentro da janela. |

Quando `ORIGENS_CORS` fica vazia, requisições feitas por navegadores com cabeçalho `Origin` são recusadas. Requisições sem `Origin`, como monitoramento do servidor e chamadas de terminal, continuam permitidas. Os domínios oficiais deverão ser informados explicitamente no `.env`; não há liberação genérica com `*`.

Exemplo com mais de uma origem:

```dotenv
ORIGENS_CORS=https://contatos.exemplo.gov.br,https://www.exemplo.gov.br
```

## Dependências instaladas na Etapa 1

### Produção

| Dependência | Finalidade nesta etapa |
| --- | --- |
| `express` | Cria o servidor HTTP, registra middlewares e expõe `GET /saude`. |
| `dotenv` | Carrega as configurações locais do arquivo `.env`. |
| `helmet` | Aplica cabeçalhos HTTP de segurança. |
| `cors` | Aceita somente as origens configuradas explicitamente. |
| `express-rate-limit` | Aplica um limite global básico contra excesso de requisições. |

### Desenvolvimento e testes

| Dependência | Finalidade nesta etapa |
| --- | --- |
| `jest` | Executa os testes automatizados unitários e de integração. |
| `supertest` | Exercita as rotas Express e verifica respostas HTTP sem abrir uma porta real. |

As dependências `pg`, `bcrypt`, `jsonwebtoken`, `zod`, `multer`, `csv-parse`, `xlsx`, `pino`, `pino-http` e `nodemon` não foram instaladas porque ainda não são necessárias para a fundação. Elas só devem ser avaliadas nas etapas em que seu uso for autorizado.

## Segurança e erros

A fundação inclui:

- remoção do cabeçalho `X-Powered-By`;
- cabeçalhos seguros com Helmet;
- CORS por lista explícita de origens;
- limite configurável do corpo JSON;
- rate limit global básico;
- `AppError` para erros operacionais;
- middleware `tratarErro` com mensagens públicas controladas;
- resposta JSON para rotas inexistentes;
- ocultação dos detalhes de erros internos.

Formato de erro público:

```json
{
  "erro": {
    "mensagem": "Mensagem segura para o cliente."
  }
}
```

## Estrutura

```text
backend/
  src/
    configuracoes/
    erros/
    middlewares/
    modulos/
      autenticacao/
      usuarios/
      bairros/
      problemas/
      origens/
      contatos/
      formularioPublico/
      importacoes/
      consentimentos/
      tentativas/
      relatorios/
      auditoria/
      saude/
    utilitarios/
    app.js
    server.js
  testes/
    unitarios/
    integracao/
  uploads/
  .env.example
  .gitignore
  package.json
  package-lock.json
  README.md
  STATUS_PROJETO.md
```

Os diretórios dos domínios futuros contêm somente arquivos `.gitkeep`. Nenhuma rota, validação, consulta ou regra de negócio desses domínios foi antecipada.

## Testes

```powershell
npm test
npm run test:coverage
```

Os testes da fundação cobrem:

- contrato de `GET /saude`;
- cabeçalhos do Helmet e remoção de `X-Powered-By`;
- origem CORS permitida e origem recusada;
- corpo JSON acima do limite e JSON malformado;
- rate limiting;
- rota inexistente;
- comportamento de `AppError`;
- respostas públicas do middleware `tratarErro`.

Resultado atual: 4 suítes e 11 testes aprovados. A cobertura total medida foi de 94,52% das instruções e 94,52% das linhas.

## Scripts npm

| Script | Ação |
| --- | --- |
| `npm start` | Inicia `src/server.js`. |
| `npm test` | Executa todos os testes uma vez. |
| `npm run test:watch` | Reexecuta testes durante alterações locais. |
| `npm run test:coverage` | Executa os testes e gera o relatório de cobertura em `coverage/`. |

## Limite da etapa

A Etapa 2 não foi iniciada. O backend ainda não importa `pg`, não abre conexão com `sistema_contatos` e não verifica as 14 tabelas. Qualquer avanço depende de aprovação explícita.
