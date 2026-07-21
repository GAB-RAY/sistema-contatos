# Status do Projeto

## Etapa atual

**Etapa 4 — Bairros, Problemas e Origens: concluída, testada e aguardando aprovação.**

A Etapa 5 não foi iniciada.

## Entregas concluídas

### Módulos de catálogo

- [x] Módulo `bairros` com Routes, Controller, Service, Model e Validação.
- [x] Módulo `problemas` com Routes, Controller, Service, Model e Validação.
- [x] Módulo `origens` com Routes, Controller, Service, Model e Validação.
- [x] Fluxo preservado em todos os módulos: Routes → Controller → Service → Model → PostgreSQL.
- [x] CommonJS, funções tradicionais nomeadas e variáveis explícitas em português.
- [x] Rotas registradas no `app.js`.

### Funcionalidades

- [x] Listagem padrão somente de registros ativos.
- [x] Listagem administrativa de registros ativos e inativos.
- [x] Busca por id.
- [x] Criação.
- [x] Edição de nome e, em origens, descrição.
- [x] Ativação e desativação sem exclusão física.
- [x] Busca parcial por nome.
- [x] Filtro administrativo por estado ativo.
- [x] Ordenação fixa e segura por nome.
- [x] Resposta 404 para registro inexistente.

### Regras de negócio e segurança

- [x] Nomes e descrições normalizados antes da gravação.
- [x] Valores vazios recusados.
- [x] Duplicidade de nome verificada sem diferença entre maiúsculas e minúsculas.
- [x] Duplicidade recusada mesmo quando o registro existente está inativo.
- [x] SQL parametrizado, sem interpolação de filtros ou ordenação.
- [x] Operadores autenticados autorizados somente para consulta.
- [x] Administradores autorizados para consulta e escrita.
- [x] Rotas sem token recusadas.
- [x] `verificarToken`, `verificarPerfil`, `AppError` e `next(erro)` reutilizados.
- [x] Body, params e query validados com esquemas estritos do Zod.
- [x] Erros do PostgreSQL tratados sem credenciais, SQL, stack trace ou detalhes internos nas respostas.

## Rotas entregues

### Bairros

- `GET /bairros`
- `GET /bairros/todos`
- `GET /bairros/:id`
- `POST /bairros`
- `PUT /bairros/:id`
- `PATCH /bairros/:id/ativar`
- `PATCH /bairros/:id/desativar`

### Problemas

- `GET /problemas`
- `GET /problemas/todos`
- `GET /problemas/:id`
- `POST /problemas`
- `PUT /problemas/:id`
- `PATCH /problemas/:id/ativar`
- `PATCH /problemas/:id/desativar`

### Origens

- `GET /origens`
- `GET /origens/todos`
- `GET /origens/:id`
- `POST /origens`
- `PUT /origens/:id`
- `PATCH /origens/:id/ativar`
- `PATCH /origens/:id/desativar`

## Testes executados

### Regressão antes dos novos testes

- 10 suítes aprovadas.
- 48 testes anteriores aprovados.
- 0 falhas.

### Primeira execução completa da Etapa 4

- 13 suítes aprovadas.
- 123 testes aprovados.
- 0 falhas.
- Cobertos, para os três módulos: listagens padrão e administrativa, busca por id, criação, duplicidade, nome vazio, edição, inexistência, ativação, desativação, permissões, filtros, ordenação, erro simulado do banco e ocultação de detalhes internos.

### Segunda execução com cobertura

- 13 suítes aprovadas.
- 123 testes aprovados.
- 0 falhas.
- Cobertura total: 74,88% das instruções, 51,58% dos ramos, 75,42% das funções e 74,88% das linhas.

### Regressão final após a documentação

- 53 arquivos JavaScript aprovados pelo `node --check`.
- Nenhuma arrow function encontrada em `src` ou nos testes.
- 13 suítes e 123 testes aprovados novamente, com 0 falhas.
- PostgreSQL disponível e estrutura válida com 14/14 tabelas.
- `git diff --check` aprovado.
- `.env` confirmado fora do Git.
- Script SQL oficial confirmado como inalterado.
- `npm audit`: 0 vulnerabilidades.

### Validação com o PostgreSQL real

- Conexão disponível.
- Estrutura preservada com 14/14 tabelas.
- Seis consultas HTTP autenticadas executadas: listagem padrão e listagem administrativa com filtro para cada catálogo.
- Todas as seis consultas responderam com sucesso.
- As tabelas `bairros`, `problemas` e `origens_listas` permaneceram com 0 registros.
- Nenhum dado de teste foi persistido.

## Arquivos criados

```text
src/modulos/bairros/bairroRoutes.js
src/modulos/bairros/bairroController.js
src/modulos/bairros/bairroService.js
src/modulos/bairros/bairroModel.js
src/modulos/bairros/bairroValidacao.js
src/modulos/problemas/problemaRoutes.js
src/modulos/problemas/problemaController.js
src/modulos/problemas/problemaService.js
src/modulos/problemas/problemaModel.js
src/modulos/problemas/problemaValidacao.js
src/modulos/origens/origemRoutes.js
src/modulos/origens/origemController.js
src/modulos/origens/origemService.js
src/modulos/origens/origemModel.js
src/modulos/origens/origemValidacao.js
testes/integracao/catalogosEtapa4Routes.test.js
testes/unitarios/catalogosModel.test.js
testes/unitarios/catalogosService.test.js
```

## Arquivos alterados

```text
src/app.js
README.md
STATUS_PROJETO.md
```

## Dependências

Nenhuma dependência nova foi instalada. A Etapa 4 reutiliza Express, `pg`, Zod, JWT, Supertest e Jest já presentes no projeto.

## Comandos registrados

```text
node --check <arquivos JavaScript de src e testes>
npm test
npm run test:coverage
npm run banco:verificar
npm audit
git diff --check
```

Também foram executadas consultas somente de leitura para confirmar as 14 tabelas e testar as seis listagens dos novos catálogos no PostgreSQL real.

## Proibições respeitadas

- nenhuma tabela criada, excluída ou alterada;
- nenhum `CREATE TABLE`, `DROP TABLE`, `ALTER TABLE`, `TRUNCATE` ou `DELETE` implementado;
- script SQL oficial não alterado;
- nenhum registro de catálogo excluído fisicamente;
- formulário público não implementado;
- contatos, consentimentos e importações não implementados;
- frontend não implementado;
- WhatsApp, campanhas e chatbox não implementados;
- Etapa 5 não iniciada.

## Próximo marco bloqueado por aprovação

A Etapa 4 está pronta para revisão. Nenhum trabalho da Etapa 5 deve começar antes da aprovação explícita do responsável pelo projeto.
