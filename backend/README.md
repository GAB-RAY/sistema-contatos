# Backend do Sistema de Contatos

Backend modular em Node.js, Express e CommonJS. Cada domínio permanece dentro de `src/modulos`, conforme o prompt mestre.

## Status atual

A Etapa 2 — Conexão e verificação do PostgreSQL está implementada e validada. A conexão real confirmou exatamente 14 tabelas públicas: 10 da V1 e 4 reservadas para a versão futura.

A Etapa 3 não foi iniciada. Não existem autenticação, módulos de negócio, migrations, frontend ou alterações no schema.

## Instalação e configuração

No PowerShell, a partir da pasta `backend`:

```powershell
npm install
Copy-Item .env.example .env
```

Preencha o `.env` com os dados da instalação local. Nunca envie esse arquivo ao Git.

```dotenv
BANCO_HOST=localhost
BANCO_PORTA=5432
BANCO_USUARIO=seu_usuario_postgresql
BANCO_SENHA=sua_senha_postgresql
BANCO_NOME=sistema_contatos
BANCO_TEMPO_LIMITE_CONEXAO_MS=5000
```

Depois, valide a conexão e as tabelas:

```powershell
npm run banco:verificar
```

O comando executa somente `SELECT NOW()` e uma consulta em `information_schema.tables`. Ele não cria, remove nem altera estruturas.

## Variáveis de ambiente

| Variável | Exemplo | Finalidade |
| --- | --- | --- |
| `PORTA` | `3000` | Porta usada pelo servidor HTTP. |
| `ORIGENS_CORS` | lista separada por vírgula | Origens oficiais permitidas. Vazia bloqueia origens de navegador. |
| `LIMITE_JSON` | `100kb` | Tamanho máximo aceito para corpos JSON. |
| `LIMITE_REQUISICOES_JANELA_MS` | `900000` | Janela global do rate limit, em milissegundos. |
| `LIMITE_REQUISICOES_MAXIMO` | `100` | Máximo de requisições por cliente dentro da janela. |
| `BANCO_HOST` | `localhost` | Host do servidor PostgreSQL. |
| `BANCO_PORTA` | `5432` | Porta do PostgreSQL. |
| `BANCO_USUARIO` | `seu_usuario_postgresql` | Usuário usado pelo pool. |
| `BANCO_SENHA` | `sua_senha_postgresql` | Senha local. Deve existir somente no `.env`. |
| `BANCO_NOME` | `sistema_contatos` | Nome do banco acessado pelo backend. |
| `BANCO_TEMPO_LIMITE_CONEXAO_MS` | `5000` | Tempo máximo para estabelecer uma conexão. |

O `.env.example` contém apenas valores de exemplo. O `.env` está protegido pelas regras de `.gitignore`.

## Conexão PostgreSQL

O pacote `pg` fornece o cliente PostgreSQL para Node.js. Nesta etapa ele é usado para:

- manter um pool de conexões em `src/configuracoes/banco.js`;
- testar disponibilidade com `SELECT NOW()`;
- consultar `information_schema.tables` com parâmetro para o schema `public`;
- encerrar o pool de forma controlada no comando de diagnóstico.

Os logs do banco registram somente uma descrição genérica e o código técnico do erro. Senha, string completa de conexão e SQL não são registrados.

## Estrutura verificada

O script oficial define exatamente 14 tabelas públicas.

Tabelas da V1:

- `usuarios`
- `bairros`
- `problemas`
- `origens_listas`
- `contatos`
- `importacoes`
- `importacao_itens`
- `consentimentos`
- `tentativas_contato`
- `historico_alteracoes`

Tabelas reservadas para a versão futura, cuja existência é apenas verificada:

- `campanhas`
- `campanha_destinatarios`
- `sessoes_whatsapp`
- `mensagens_whatsapp`

Não foi criado código de negócio para nenhuma tabela futura.

## Rota de saúde

```text
GET http://localhost:3000/saude
```

Com o banco disponível, responde HTTP 200:

```json
{
  "status": "ok",
  "aplicacao": "disponivel",
  "bancoDados": "disponivel"
}
```

Com o banco indisponível, responde HTTP 503:

```json
{
  "status": "degradado",
  "aplicacao": "disponivel",
  "bancoDados": "indisponivel"
}
```

A resposta não expõe credenciais, consulta SQL, códigos do PostgreSQL ou detalhes internos.

## Dependências diretas

### Produção

| Dependência | Finalidade |
| --- | --- |
| `express` | Servidor HTTP, rotas e middlewares. |
| `dotenv` | Carregamento do `.env` local. |
| `helmet` | Cabeçalhos HTTP de segurança. |
| `cors` | Restrição das origens autorizadas. |
| `express-rate-limit` | Proteção básica contra excesso de requisições. |
| `pg` | Pool, conexão e consultas parametrizadas no PostgreSQL. |

### Desenvolvimento e testes

| Dependência | Finalidade |
| --- | --- |
| `jest` | Testes unitários e de integração. |
| `supertest` | Testes HTTP das rotas Express sem abrir porta real. |

## Testes

```powershell
npm test
npm run test:coverage
```

A suíte cobre:

- conexão válida;
- falha de conexão e proteção contra vazamento da senha;
- verificação exata das 10 tabelas V1 e das 4 futuras;
- detecção de estrutura incompleta;
- `/saude` com banco disponível;
- `/saude` com falha simulada;
- todos os testes de segurança e tratamento de erros da fundação.

Resultado após a correção da Etapa 2: 5 suítes e 16 testes aprovados. A cobertura medida foi de 81,06% das instruções e linhas.

## Scripts npm

| Script | Ação |
| --- | --- |
| `npm start` | Inicia `src/server.js`. |
| `npm run banco:verificar` | Testa a conexão e confirma as 14 tabelas públicas sem alterar o banco. |
| `npm test` | Executa todos os testes uma vez. |
| `npm run test:watch` | Reexecuta testes durante alterações locais. |
| `npm run test:coverage` | Executa os testes e gera o relatório em `coverage/`. |

## Comandos executados na Etapa 2

```text
npm install pg
node --check <arquivos JavaScript de src e testes>
npm test
npm install
npm run test:coverage
npm run banco:verificar
psql ... -c "SELECT 1 AS conexao_valida;"
```

A primeira tentativa confirmou que o PostgreSQL exige senha. Após a configuração local do `.env`, o comando confirmou conexão disponível, 14/14 tabelas públicas, 10/10 tabelas V1, 4/4 tabelas futuras e estrutura válida. Nenhuma credencial foi impressa, e nenhuma instrução de alteração do banco foi executada.

## Limite da etapa

Não foram criadas migrations nem executados `CREATE TABLE`, `ALTER TABLE` ou `DROP TABLE`. O script SQL oficial não foi alterado. A Etapa 3 permanece bloqueada até aprovação explícita.
