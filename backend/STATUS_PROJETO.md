# Status do Projeto

## Etapa atual

**Etapa 2 — Conexão e verificação das 14 tabelas: concluída e aguardando aprovação.**

A Etapa 3 não foi iniciada.

## Entregas da Etapa 2

- [x] `.env` local criado e mantido fora do Git.
- [x] `.env.example` atualizado sem senha real.
- [x] Variáveis explícitas para host, porta, usuário, senha e nome do banco.
- [x] Pacote `pg` instalado.
- [x] Pool configurado em `src/configuracoes/banco.js`.
- [x] Tratamento de erros sem credenciais ou string de conexão nos logs.
- [x] Função nomeada `testarConexaoBanco` implementada com `SELECT NOW()`.
- [x] Função `verificarTabelasBanco` implementada com consulta a `information_schema.tables`.
- [x] Validação exata das 10 tabelas V1 e das 4 tabelas futuras.
- [x] Comando `npm run banco:verificar` criado.
- [x] Rota `GET /saude` atualizada com estado da aplicação e do banco.
- [x] Resposta HTTP 503 segura quando o banco está indisponível.
- [x] Testes obrigatórios implementados.
- [x] README e status atualizados.
- [x] Conexão real e confirmação das 14 tabelas no PostgreSQL local.

## Tabelas esperadas

### V1 — 10 tabelas

`usuarios`, `bairros`, `problemas`, `origens_listas`, `contatos`, `importacoes`, `importacao_itens`, `consentimentos`, `tentativas_contato` e `historico_alteracoes`.

### Futuras — 4 tabelas

`campanhas`, `campanha_destinatarios`, `sessoes_whatsapp` e `mensagens_whatsapp`.

A implementação somente verifica a existência dessas quatro tabelas. Nenhuma regra de negócio foi criada para elas.

## Validações executadas

### Inspeção do script oficial

- Confirmadas 14 instruções `CREATE TABLE` no arquivo oficial, sem executá-lo.
- Confirmadas 10 tabelas V1 e 4 tabelas reservadas para a versão futura.
- O script permaneceu inalterado.

### Primeira execução da suíte

- 16 arquivos JavaScript aprovados pelo `node --check`.
- `npm test`: 5 suítes, 16 testes aprovados e 0 falhas.
- Foi identificado um registro duplicado de `pg` no `package.json`.

### Correção

- Removida a chave antiga duplicada.
- Mantida somente a versão de `pg` efetivamente instalada.
- Manifesto e lockfile sincronizados com `npm install`.

### Segunda execução da suíte

- `npm run test:coverage`: 5 suítes, 16 testes aprovados e 0 falhas.
- Cobertura: 81,06% das instruções, 73,33% dos ramos, 73,33% das funções e 81,06% das linhas.

### Teste da falha real de configuração

- `npm run banco:verificar` executado com `BANCO_SENHA` vazia.
- O comando informou conexão indisponível e retornou código de saída 1.
- O processo não foi encerrado silenciosamente.
- Nenhuma senha, string de conexão ou SQL foi exposto.

### Validação real do PostgreSQL

- `npm run banco:verificar` executado após a configuração local da senha.
- Conexão com PostgreSQL: disponível.
- Tabelas públicas: 14/14.
- Tabelas V1: 10/10.
- Tabelas futuras: 4/4, com somente a existência verificada.
- Estrutura do banco: válida.
- Nenhuma tabela extra ou ausente.

### Validação HTTP com o banco real

- Aplicação iniciada temporariamente na porta 3188.
- Requisição real enviada para `GET /saude`.
- Resultado: HTTP 200 com aplicação e banco disponíveis.
- Nenhuma credencial, SQL ou detalhe interno apareceu na resposta.

### Regressão final

- 16 arquivos JavaScript aprovados pelo `node --check`.
- `npm test`: 5 suítes, 16 testes aprovados e 0 falhas.
- `npm audit`: 0 vulnerabilidades encontradas.
- `git diff --check`: nenhuma inconsistência encontrada.
- `.env` confirmado como ignorado pelo Git.
- Script SQL oficial confirmado como inalterado.

### Dependências

- `pg@8.22.0` instalado como dependência de produção.
- Auditoria npm: 0 vulnerabilidades encontradas.

## Comandos registrados

```text
npm install pg
node --check <arquivos JavaScript de src e testes>
npm test
npm install
npm run test:coverage
npm run banco:verificar
psql ... -c "SELECT 1 AS conexao_valida;"
```

## Proibições respeitadas

- nenhuma migration criada;
- nenhum `CREATE TABLE`, `DROP TABLE` ou `ALTER TABLE` executado;
- script SQL oficial não alterado;
- banco existente não recriado;
- autenticação não iniciada;
- módulos de negócio não implementados;
- frontend não criado;
- tabelas futuras não receberam código de negócio;
- Etapa 3 não iniciada.

## Próximo marco bloqueado por aprovação

A Etapa 3 prevê autenticação e usuários. Nenhum trabalho desse marco deve começar antes da autorização explícita do responsável pelo projeto.
