# Backend do Sistema de Contatos

Backend modular em Node.js, Express, CommonJS e PostgreSQL. Os domínios permanecem dentro de `src/modulos`, seguindo o fluxo `Routes → Controller → Service → Model → PostgreSQL`.

## Status atual

As Etapas 1, 2 e 3 estão concluídas. A autenticação, a autorização por perfil, o CRUD de usuários e o bootstrap seguro do primeiro administrador foram implementados e validados.

A Etapa 4 não foi iniciada. Não existem módulos de bairros, problemas, origens, formulário público, importações, frontend ou integrações com WhatsApp.

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

A suíte cobre criação segura e duplicada do primeiro administrador, login válido e inválido, usuário inativo, JWT ausente/inválido/válido, perfis, CRUD, e-mail duplicado, perfil inválido, hash de senha, ativação, desativação, último administrador, falha simulada do banco, rate limit e middleware global.

Resultado atual: 10 suítes e 48 testes aprovados. A última medição de cobertura foi de 78,43% das instruções e linhas.

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

## Limite da etapa

Não foram iniciados bairros, problemas, origens, formulário público, importações, frontend, WhatsApp, campanhas ou chatbox. A Etapa 4 depende de aprovação explícita.
