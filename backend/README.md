# Backend do Sistema de Contatos

Backend modular em Node.js, Express, CommonJS e PostgreSQL. Os domínios permanecem dentro de `src/modulos`, seguindo o fluxo `Routes → Controller → Service → Model → PostgreSQL`.

## Status atual

As Etapas 1, 2, 3 e 4 estão concluídas. Bairros, problemas e origens agora possuem módulos completos, rotas autenticadas, filtros seguros e ativação lógica.

A Etapa 5 não foi iniciada. Não existem formulário público, contatos, consentimentos, importações, frontend ou integrações com WhatsApp.

## Configuração

No PowerShell, a partir da pasta `backend`:

```powershell
npm install
Copy-Item .env.example .env
```

O `.env` é local e está ignorado pelo Git. Preencha os valores reais somente nesse arquivo.

### Variáveis da aplicação e segurança

| Variável | Exemplo | Finalidade |
| --- | --- | --- |
| `PORTA` | `3000` | Porta do servidor HTTP. |
| `ORIGENS_CORS` | lista separada por vírgula | Origens oficiais permitidas. |
| `LIMITE_JSON` | `100kb` | Limite dos corpos JSON. |
| `LIMITE_REQUISICOES_JANELA_MS` | `900000` | Janela do rate limit global. |
| `LIMITE_REQUISICOES_MAXIMO` | `100` | Máximo global de requisições por cliente. |
| `JWT_SECRET` | segredo longo e aleatório | Assina e valida os tokens. Não possui valor padrão no código. |
| `JWT_EXPIRES_IN` | `8h` | Prazo de validade do JWT. |
| `BCRYPT_CUSTO` | `12` | Fator de custo usado nos hashes de senha. Aceita valores de 10 a 14. |
| `LOGIN_LIMITE_JANELA_MS` | `900000` | Janela do rate limit exclusivo do login. |
| `LOGIN_LIMITE_MAXIMO` | `5` | Tentativas de login permitidas na janela. |

Para gerar um segredo JWT com 64 bytes aleatórios:

```powershell
node -e "console.log(require('node:crypto').randomBytes(64).toString('hex'))"
```

Copie o resultado para `JWT_SECRET` no `.env`. Não coloque o segredo no código, README, commit ou mensagem de suporte.

### Variáveis do PostgreSQL

| Variável | Exemplo | Finalidade |
| --- | --- | --- |
| `BANCO_HOST` | `localhost` | Host do PostgreSQL. |
| `BANCO_PORTA` | `5432` | Porta do PostgreSQL. |
| `BANCO_USUARIO` | `seu_usuario_postgresql` | Usuário do pool. |
| `BANCO_SENHA` | `sua_senha_postgresql` | Senha disponível somente no `.env`. |
| `BANCO_NOME` | `sistema_contatos` | Banco acessado pelo backend. |
| `BANCO_TEMPO_LIMITE_CONEXAO_MS` | `5000` | Tempo limite para abrir conexão. |

## Execução

```powershell
npm run banco:verificar
npm start
```

## Perfis

- `administrador`: pode acessar o CRUD administrativo de usuários.
- `operador`: pode autenticar, mas não pode acessar as rotas administrativas de usuários.

`verificarToken` valida o cabeçalho `Authorization: Bearer TOKEN` e cria `req.usuario`. `verificarPerfil` usa esse objeto para autorizar os perfis informados pela rota.

## Primeiro administrador

Não existe rota HTTP para criar o primeiro administrador. O processo é um comando local de uso único e exige que a tabela `usuarios` esteja vazia.

A senha deve ter entre 12 e 128 caracteres, com letra minúscula, letra maiúscula e número. Ela é transformada em hash bcrypt antes do `INSERT`.

No PowerShell:

```powershell
$senhaAdmin = Read-Host "Senha do primeiro administrador" -AsSecureString
$credencialAdmin = [System.Management.Automation.PSCredential]::new('temporario', $senhaAdmin)
$env:ADMIN_INICIAL_SENHA = $credencialAdmin.GetNetworkCredential().Password
npm run admin:criar -- --nome "Nome do administrador" --email "email@dominio.com"
Remove-Item Env:ADMIN_INICIAL_SENHA
Remove-Variable senhaAdmin,credencialAdmin
```

O procedimento:

- valida nome, e-mail e senha com Zod;
- usa uma variável de ambiente temporária para a senha;
- gera o hash com bcrypt;
- abre uma transação;
- usa bloqueio transacional para impedir duas criações concorrentes;
- confirma que ainda existem zero usuários;
- cria uma única conta ativa com perfil `administrador`;
- recusa novas execuções depois da primeira conta.

Não salve `ADMIN_INICIAL_SENHA` no `.env`.

## Autenticação

### `POST /autenticacao/login`

Rota pública com rate limit próprio.

Corpo:

```json
{
  "email": "email@dominio.com",
  "senha": "senha-do-usuario"
}
```

Resposta HTTP 200:

```json
{
  "mensagem": "Login realizado com sucesso.",
  "token": "jwt",
  "usuario": {
    "idUsuario": 1,
    "nomeCompleto": "Nome do usuário",
    "email": "email@dominio.com",
    "perfilAcesso": "administrador"
  }
}
```

E-mail inexistente, senha incorreta e usuário inativo recebem a mesma mensagem genérica. A resposta nunca inclui `senha_hash`.

## Rotas administrativas de usuários

Todas exigem token válido e perfil `administrador`.

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/usuarios` | Lista usuários sem `senha_hash`. |
| `GET` | `/usuarios/:id` | Busca usuário por identificador. |
| `POST` | `/usuarios` | Cria administrador ou operador com hash bcrypt. |
| `PUT` | `/usuarios/:id` | Edita nome, e-mail e perfil. |
| `PATCH` | `/usuarios/:id/ativar` | Ativa a conta. |
| `PATCH` | `/usuarios/:id/desativar` | Desativa a conta. |
| `PATCH` | `/usuarios/:id/senha` | Troca a senha usando novo hash. |

As rotas validam `body`, `params` e `query` com Zod e rejeitam propriedades não previstas.

Regras adicionais:

- e-mail duplicado retorna conflito;
- somente `administrador` e `operador` são aceitos;
- o último administrador ativo não pode ser desativado;
- o último administrador ativo não pode perder o perfil;
- a própria conta do último administrador ativo não pode ser desativada;
- consultas e respostas públicas não incluem o hash da senha;
- entradas SQL usam `$1`, `$2` e parâmetros seguintes.

## Bairros, problemas e origens

Os três catálogos exigem `Authorization: Bearer TOKEN`. Não existem rotas públicas para consultar ou alterar esses cadastros.

### Permissões

- `administrador`: consulta, cria, edita, ativa e desativa.
- `operador`: consulta a listagem padrão e busca por id.
- somente `administrador` acessa `/todos`, que pode incluir registros inativos.

### Rotas de bairros

| Método | Rota | Permissão | Finalidade |
| --- | --- | --- | --- |
| `GET` | `/bairros` | administrador ou operador | Lista somente bairros ativos. |
| `GET` | `/bairros/todos` | administrador | Lista ativos e inativos. |
| `GET` | `/bairros/:id` | administrador ou operador | Busca por id. |
| `POST` | `/bairros` | administrador | Cria bairro ativo. |
| `PUT` | `/bairros/:id` | administrador | Edita o nome. |
| `PATCH` | `/bairros/:id/ativar` | administrador | Ativa. |
| `PATCH` | `/bairros/:id/desativar` | administrador | Desativa. |

Corpo de criação e edição:

```json
{
  "nomeBairro": "Nome do bairro"
}
```

### Rotas de problemas

| Método | Rota | Permissão | Finalidade |
| --- | --- | --- | --- |
| `GET` | `/problemas` | administrador ou operador | Lista somente problemas ativos. |
| `GET` | `/problemas/todos` | administrador | Lista ativos e inativos. |
| `GET` | `/problemas/:id` | administrador ou operador | Busca por id. |
| `POST` | `/problemas` | administrador | Cria problema ativo. |
| `PUT` | `/problemas/:id` | administrador | Edita o nome. |
| `PATCH` | `/problemas/:id/ativar` | administrador | Ativa. |
| `PATCH` | `/problemas/:id/desativar` | administrador | Desativa. |

Corpo de criação e edição:

```json
{
  "nomeProblema": "Nome do problema"
}
```

### Rotas de origens

| Método | Rota | Permissão | Finalidade |
| --- | --- | --- | --- |
| `GET` | `/origens` | administrador ou operador | Lista somente origens ativas. |
| `GET` | `/origens/todos` | administrador | Lista ativas e inativas. |
| `GET` | `/origens/:id` | administrador ou operador | Busca por id. |
| `POST` | `/origens` | administrador | Cria origem ativa. |
| `PUT` | `/origens/:id` | administrador | Edita nome e descrição. |
| `PATCH` | `/origens/:id/ativar` | administrador | Ativa. |
| `PATCH` | `/origens/:id/desativar` | administrador | Desativa. |

Corpo de criação:

```json
{
  "nomeOrigem": "Nome da origem",
  "descricaoOrigem": "Descrição opcional"
}
```

Na edição, `descricaoOrigem` deve ser enviada como texto ou `null` para remover a descrição.

### Filtros e ordenação

Listagem padrão:

```text
GET /bairros?nome=centro
GET /problemas?nome=iluminacao
GET /origens?nome=formulario
```

Listagem administrativa:

```text
GET /bairros/todos?nome=centro&ativo=false
GET /problemas/todos?ativo=true
GET /origens/todos?ativo=false
```

- `nome`: busca parcial sem diferenciar maiúsculas e minúsculas.
- `ativo`: aceita somente `true` ou `false` e existe somente em `/todos`.
- parâmetros desconhecidos são recusados pelo Zod.
- a ordenação é fixa por nome e não pode ser controlada pelo cliente.

### Regras dos catálogos

- espaços externos são removidos e sequências internas são reduzidas a um espaço;
- nomes vazios são recusados;
- nomes são comparados sem diferenciar maiúsculas e minúsculas;
- duplicidade é recusada mesmo quando o registro existente está inativo;
- criação e edição usam transação e bloqueio concorrente;
- registros não são excluídos fisicamente;
- listagens padrão não mostram registros inativos;
- todas as entradas SQL são parametrizadas.

## Segurança das senhas

O bcrypt usa custo 12 por padrão. Esse custo representa trabalho exponencial: aumentar uma unidade aproximadamente dobra o esforço de hash. O backend aceita somente custos entre 10 e 14 para evitar configuração fraca ou consumo acidental excessivo.

Senhas e tokens não são escritos nos logs. Erros inesperados retornam uma mensagem genérica sem stack trace.

## Dependências diretas

### Produção

| Dependência | Finalidade |
| --- | --- |
| `express` | Servidor HTTP, rotas e middlewares. |
| `dotenv` | Carrega o `.env` local. |
| `helmet` | Cabeçalhos HTTP de segurança. |
| `cors` | Restringe origens autorizadas. |
| `express-rate-limit` | Rate limits global e específico do login. |
| `pg` | Pool e consultas parametrizadas no PostgreSQL. |
| `bcrypt` | Hash e comparação segura de senhas. |
| `jsonwebtoken` | Geração e validação de JWT. |
| `zod` | Validação de body, params, query e bootstrap inicial. |

### Desenvolvimento e testes

| Dependência | Finalidade |
| --- | --- |
| `jest` | Testes unitários e de integração. |
| `supertest` | Testes HTTP das rotas Express. |

## Testes

```powershell
npm test
npm run test:coverage
```

A suíte cobre a fundação, a conexão com o banco, autenticação, usuários e os três catálogos da Etapa 4. Para bairros, problemas e origens, são verificados listagens, filtros, ordenação, busca por id, criação, edição, duplicidade, valores vazios, ativação, desativação, permissões, falha simulada do banco e ocultação de detalhes internos.

Resultado atual: 13 suítes e 123 testes aprovados. Cobertura total: 74,88% das instruções e linhas.

## Scripts npm

| Script | Ação |
| --- | --- |
| `npm start` | Inicia o servidor. |
| `npm run banco:verificar` | Confirma conexão e 14 tabelas sem alterar o banco. |
| `npm run admin:criar -- --nome ... --email ...` | Cria o primeiro administrador uma única vez. |
| `npm test` | Executa toda a suíte. |
| `npm run test:watch` | Reexecuta testes durante alterações. |
| `npm run test:coverage` | Executa testes com cobertura. |

## Comandos executados na Etapa 3

```text
npm install bcrypt jsonwebtoken zod
node --check <arquivos JavaScript de src e testes>
npm test
npm run test:coverage
npm run banco:verificar
psql ... SELECT COUNT(*) FROM usuarios
```

Todas as consultas reais da etapa foram somente leitura. O script SQL oficial e as 14 tabelas não foram alterados.

## Arquivos da Etapa 4

Criados:

- `src/modulos/bairros/bairroRoutes.js`
- `src/modulos/bairros/bairroController.js`
- `src/modulos/bairros/bairroService.js`
- `src/modulos/bairros/bairroModel.js`
- `src/modulos/bairros/bairroValidacao.js`
- `src/modulos/problemas/problemaRoutes.js`
- `src/modulos/problemas/problemaController.js`
- `src/modulos/problemas/problemaService.js`
- `src/modulos/problemas/problemaModel.js`
- `src/modulos/problemas/problemaValidacao.js`
- `src/modulos/origens/origemRoutes.js`
- `src/modulos/origens/origemController.js`
- `src/modulos/origens/origemService.js`
- `src/modulos/origens/origemModel.js`
- `src/modulos/origens/origemValidacao.js`
- `testes/integracao/catalogosEtapa4Routes.test.js`
- `testes/unitarios/catalogosService.test.js`
- `testes/unitarios/catalogosModel.test.js`

Alterados:

- `src/app.js`
- `README.md`
- `STATUS_PROJETO.md`

## Comandos executados na Etapa 4

```text
node --check <arquivos JavaScript de src e testes>
npm test
npm run test:coverage
npm run banco:verificar
npm audit
git diff --check
psql ... SELECT COUNT(*) FROM bairros, problemas e origens_listas
```

Também foram executadas seis consultas HTTP autenticadas, somente de leitura, contra o PostgreSQL real. Não foi necessária nenhuma dependência nova nesta etapa.

## Limite da etapa

Não foram iniciados formulário público, contatos, consentimentos, importações, frontend, WhatsApp, campanhas ou chatbox. A Etapa 5 depende de aprovação explícita.
