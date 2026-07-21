# Status do Projeto

## Etapa atual

**Etapa 3 — Autenticação e Usuários: concluída e aguardando aprovação.**

A Etapa 4 não foi iniciada.

## Entregas concluídas

### Autenticação

- [x] Módulo `autenticacao` com Routes, Controller, Service, Model e Validação.
- [x] Login por e-mail e senha.
- [x] Verificação de conta ativa.
- [x] Comparação de senha com bcrypt.
- [x] Geração de JWT configurada exclusivamente por `JWT_SECRET`.
- [x] Resposta de login sem `senha_hash`.
- [x] Mensagem genérica para credenciais inválidas e conta inativa.
- [x] Rate limit específico para login.

### Autorização

- [x] `verificarToken` implementado sem importar `tratarErro`.
- [x] Leitura e separação de `Bearer TOKEN`.
- [x] `jwt.verify` e criação de `req.usuario`.
- [x] Erros encaminhados com `AppError` e `next(erro)`.
- [x] `verificarPerfil` compatível com administrador e operador.
- [x] Rotas administrativas bloqueadas para operador.

### Usuários

- [x] Módulo `usuarios` com Routes, Controller, Service, Model e Validação.
- [x] Listagem e busca por id.
- [x] Criação com hash bcrypt.
- [x] Edição de nome, e-mail e perfil.
- [x] Ativação e desativação.
- [x] Troca de senha com novo hash.
- [x] Proteção contra e-mail duplicado.
- [x] Perfis restritos a `administrador` e `operador`.
- [x] Consultas e respostas sem exposição de `senha_hash`.
- [x] Proteção transacional do último administrador ativo.
- [x] Proteção da própria conta quando ela é o último administrador ativo.

### Primeiro administrador

- [x] Comando local `npm run admin:criar`.
- [x] Nenhuma rota pública permanente criada.
- [x] Senha recebida por variável temporária de processo.
- [x] Zod e bcrypt aplicados antes da gravação.
- [x] Transação e bloqueio concorrente.
- [x] Segunda criação recusada quando já existe qualquer usuário.
- [x] Procedimento documentado sem credenciais reais.

### Validação e segurança

- [x] Zod aplicado a body, params e query.
- [x] SQL parametrizado.
- [x] Nenhuma arrow function em `src` ou nos testes da etapa.
- [x] Sem senha ou token em logs.
- [x] Sem stack trace nas respostas.
- [x] Custo bcrypt padrão 12 e intervalo seguro de 10 a 14.
- [x] `.env.example` atualizado.
- [x] `.env` confirmado fora do Git.
- [x] `JWT_SECRET` forte preenchido no `.env` local e validado em execução real.

## Testes executados

### Primeira execução ampliada

- 35 arquivos JavaScript aprovados pelo `node --check`.
- 10 suítes aprovadas.
- 44 testes aprovados.
- 0 falhas.

### Segunda execução com cobertura

- 10 suítes aprovadas.
- 44 testes aprovados.
- 0 falhas.
- A revisão identificou que rotas sem conteúdo poderiam declarar explicitamente os objetos vazios de body e params.

### Ajuste de validação

- Body, params e query passaram a ser declarados com Zod em todas as rotas da Etapa 3.
- Campos inesperados são recusados.
- Foram adicionados testes HTTP de criação, busca, edição, ativação, desativação e senha.

### Execução após o ajuste

- 10 suítes aprovadas.
- 48 testes aprovados.
- 0 falhas.
- Cobertura: 78,43% das instruções, 61,70% dos ramos, 76,54% das funções e 78,43% das linhas.
- Confirmado por teste HTTP que não existe rota pública para criar o administrador inicial.
- Confirmado que o comando de bootstrap encerra com erro claro quando os dados obrigatórios não são fornecidos.

### Validação real do JWT e da autorização

- `JWT_SECRET` local confirmado sem exibir seu conteúdo.
- Segredo com tamanho mínimo de segurança confirmado.
- JWT temporário assinado e validado em memória.
- `GET /usuarios` executado com perfil administrador contra o PostgreSQL real.
- Resultado: HTTP 200 e lista vazia, coerente com a tabela `usuarios` sem registros.
- Token ausente da resposta.
- Nenhum usuário criado ou alterado.

### Regressão final

- 35 arquivos JavaScript aprovados pelo `node --check`.
- Nenhuma arrow function encontrada em `src` ou nos testes.
- 10 suítes e 48 testes aprovados, com 0 falhas.
- PostgreSQL disponível e estrutura válida com 14/14 tabelas.
- Nenhum SQL de criação, remoção ou alteração de estrutura encontrado em `src`.
- Script SQL oficial confirmado como inalterado.
- `.env` confirmado como ignorado pelo Git.
- `git diff --check` aprovado.
- `npm audit`: 0 vulnerabilidades.

### PostgreSQL real

- Conexão disponível.
- Estrutura preservada com 14/14 tabelas.
- Tabela `usuarios`: 0 registros.
- Administradores ativos: 0.
- Nenhum usuário de teste persistido.
- Nenhuma estrutura criada, removida ou modificada.

### Dependências

- `bcrypt@6.0.0`
- `jsonwebtoken@9.0.3`
- `zod@4.4.3`
- Auditoria executada durante a instalação: 0 vulnerabilidades.

## Comandos registrados

```text
npm install bcrypt jsonwebtoken zod
node --check <arquivos JavaScript de src e testes>
npm test
npm run test:coverage
npm run banco:verificar
psql ... SELECT COUNT(*) FROM usuarios
```

## Proibições respeitadas

- nenhuma tabela criada ou alterada;
- script SQL oficial não alterado;
- bairros, problemas e origens não iniciados;
- formulário público não iniciado;
- importações não iniciadas;
- frontend não criado;
- WhatsApp, campanhas e chatbox não implementados;
- Etapa 4 não iniciada.

## Próximo marco bloqueado por aprovação

A Etapa 4 prevê bairros, problemas e origens. Nenhum trabalho desse marco deve começar antes da autorização explícita do responsável pelo projeto.

O primeiro administrador não foi criado durante a implementação porque nome, e-mail e senha reais pertencem ao responsável pelo sistema. O comando seguro está pronto e documentado para execução consciente.
