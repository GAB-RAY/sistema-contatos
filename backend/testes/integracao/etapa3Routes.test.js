process.env.JWT_SECRET = 'segredo-longo-e-exclusivo-da-integracao-etapa-3';

const jwt = require('jsonwebtoken');
const request = require('supertest');

const { criarApp } = require('../../src/app');
const AppError = require('../../src/erros/AppError');
const autenticacaoService = require(
  '../../src/modulos/autenticacao/autenticacaoService'
);
const usuarioService = require('../../src/modulos/usuarios/usuarioService');

const SEGREDO_TESTE = process.env.JWT_SECRET;

// Evita que os testes das rotas administrativas dependam do banco real.
async function simularBancoDisponivel() {
  return { disponivel: true };
}

// Cria um token real com o perfil solicitado.
function criarToken(perfilAcesso, idUsuario) {
  return jwt.sign(
    { idUsuario: idUsuario || 1, perfilAcesso },
    SEGREDO_TESTE,
    { expiresIn: '1h' }
  );
}

// Monta uma instancia isolada para cada teste, inclusive o rate limit do login.
function criarAplicacao(opcoes) {
  return criarApp({
    testarConexaoBanco: simularBancoDisponivel,
    loginJanelaMs: 60 * 1000,
    loginMaximo: 5,
    ...(opcoes || {})
  });
}

afterEach(function restaurarMocks() {
  jest.restoreAllMocks();
});

describe('rotas da Etapa 3', function testarRotasEtapa3() {
  test('nao expoe rota publica para criar administrador inicial', async function executarTeste() {
    const resposta = await request(criarAplicacao())
      .post('/autenticacao/primeiro-administrador')
      .send({
        nomeCompleto: 'Administrador Indevido',
        email: 'indevido@teste.local',
        senha: 'SenhaForte123'
      });

    expect(resposta.status).toBe(404);
  });

  test('bloqueia operador na rota administrativa de usuarios', async function executarTeste() {
    const listarUsuarios = jest
      .spyOn(usuarioService, 'listarUsuarios')
      .mockResolvedValue([]);
    const resposta = await request(criarAplicacao())
      .get('/usuarios')
      .set('Authorization', `Bearer ${criarToken('operador', 2)}`);

    expect(resposta.status).toBe(403);
    expect(listarUsuarios).not.toHaveBeenCalled();
  });

  test('autoriza administrador e lista sem senha_hash', async function executarTeste() {
    jest.spyOn(usuarioService, 'listarUsuarios').mockResolvedValue([{
      idUsuario: 1,
      nomeCompleto: 'Administrador Teste',
      email: 'admin@teste.local',
      perfilAcesso: 'administrador',
      usuarioAtivo: true
    }]);
    const resposta = await request(criarAplicacao())
      .get('/usuarios')
      .set('Authorization', `Bearer ${criarToken('administrador', 1)}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.usuarios).toHaveLength(1);
    expect(JSON.stringify(resposta.body)).not.toContain('senha_hash');
    expect(JSON.stringify(resposta.body)).not.toContain('senhaHash');
  });

  test('recusa perfil invalido pelo Zod antes do servico', async function executarTeste() {
    const criarUsuario = jest
      .spyOn(usuarioService, 'criarUsuario')
      .mockResolvedValue({});
    const resposta = await request(criarAplicacao())
      .post('/usuarios')
      .set('Authorization', `Bearer ${criarToken('administrador', 1)}`)
      .send({
        nomeCompleto: 'Usuario Teste',
        email: 'usuario@teste.local',
        senha: 'SenhaForte123',
        perfilAcesso: 'superusuario'
      });

    expect(resposta.status).toBe(400);
    expect(criarUsuario).not.toHaveBeenCalled();
  });

  test('cria e busca usuario pelas rotas administrativas', async function executarTeste() {
    const usuarioCriado = {
      idUsuario: 3,
      nomeCompleto: 'Novo Usuario',
      email: 'novo@teste.local',
      perfilAcesso: 'operador',
      usuarioAtivo: true
    };
    jest
      .spyOn(usuarioService, 'criarUsuario')
      .mockResolvedValue(usuarioCriado);
    jest
      .spyOn(usuarioService, 'buscarUsuarioPorId')
      .mockResolvedValue(usuarioCriado);
    const app = criarAplicacao();
    const token = criarToken('administrador', 1);

    const respostaCriacao = await request(app)
      .post('/usuarios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nomeCompleto: 'Novo Usuario',
        email: 'NOVO@TESTE.LOCAL',
        senha: 'SenhaForte123',
        perfilAcesso: 'operador'
      });
    const respostaBusca = await request(app)
      .get('/usuarios/3')
      .set('Authorization', `Bearer ${token}`);

    expect(respostaCriacao.status).toBe(201);
    expect(respostaCriacao.body.usuario).toEqual(usuarioCriado);
    expect(usuarioService.criarUsuario).toHaveBeenCalledWith({
      nomeCompleto: 'Novo Usuario',
      email: 'novo@teste.local',
      senha: 'SenhaForte123',
      perfilAcesso: 'operador'
    });
    expect(respostaBusca.status).toBe(200);
    expect(usuarioService.buscarUsuarioPorId).toHaveBeenCalledWith(3);
  });

  test('edita usuario pela rota administrativa', async function executarTeste() {
    const usuarioEditado = {
      idUsuario: 3,
      nomeCompleto: 'Usuario Editado',
      email: 'editado@teste.local',
      perfilAcesso: 'administrador',
      usuarioAtivo: true
    };
    jest
      .spyOn(usuarioService, 'editarUsuario')
      .mockResolvedValue(usuarioEditado);
    const resposta = await request(criarAplicacao())
      .put('/usuarios/3')
      .set('Authorization', `Bearer ${criarToken('administrador', 1)}`)
      .send({
        nomeCompleto: 'Usuario Editado',
        email: 'EDITADO@TESTE.LOCAL',
        perfilAcesso: 'administrador'
      });

    expect(resposta.status).toBe(200);
    expect(resposta.body.usuario).toEqual(usuarioEditado);
    expect(usuarioService.editarUsuario).toHaveBeenCalledWith(3, {
      nomeCompleto: 'Usuario Editado',
      email: 'editado@teste.local',
      perfilAcesso: 'administrador'
    });
  });

  test('ativa, desativa e troca senha pelas rotas administrativas', async function executarTeste() {
    const usuarioAtivo = {
      idUsuario: 3,
      nomeCompleto: 'Usuario Teste',
      email: 'usuario@teste.local',
      perfilAcesso: 'operador',
      usuarioAtivo: true
    };
    const usuarioInativo = {
      ...usuarioAtivo,
      usuarioAtivo: false
    };
    jest
      .spyOn(usuarioService, 'ativarUsuario')
      .mockResolvedValue(usuarioAtivo);
    jest
      .spyOn(usuarioService, 'desativarUsuario')
      .mockResolvedValue(usuarioInativo);
    jest
      .spyOn(usuarioService, 'trocarSenhaUsuario')
      .mockResolvedValue(undefined);
    const app = criarAplicacao();
    const token = criarToken('administrador', 1);

    const respostaAtivacao = await request(app)
      .patch('/usuarios/3/ativar')
      .set('Authorization', `Bearer ${token}`);
    const respostaDesativacao = await request(app)
      .patch('/usuarios/3/desativar')
      .set('Authorization', `Bearer ${token}`);
    const respostaSenha = await request(app)
      .patch('/usuarios/3/senha')
      .set('Authorization', `Bearer ${token}`)
      .send({ senhaNova: 'NovaSenhaForte123' });

    expect(respostaAtivacao.status).toBe(200);
    expect(respostaDesativacao.status).toBe(200);
    expect(respostaSenha.status).toBe(200);
    expect(usuarioService.ativarUsuario).toHaveBeenCalledWith(3);
    expect(usuarioService.desativarUsuario).toHaveBeenCalledWith(3, 1);
    expect(usuarioService.trocarSenhaUsuario).toHaveBeenCalledWith(
      3,
      'NovaSenhaForte123'
    );
  });

  test('middleware global oculta falha simulada do banco', async function executarTeste() {
    jest
      .spyOn(usuarioService, 'listarUsuarios')
      .mockRejectedValue(new Error('detalhe interno do PostgreSQL'));
    const resposta = await request(criarAplicacao())
      .get('/usuarios')
      .set('Authorization', `Bearer ${criarToken('administrador', 1)}`);

    expect(resposta.status).toBe(500);
    expect(resposta.body).toEqual({
      erro: {
        mensagem: 'Erro interno do servidor.'
      }
    });
    expect(JSON.stringify(resposta.body)).not.toContain('PostgreSQL');
    expect(JSON.stringify(resposta.body)).not.toContain('stack');
  });

  test('rota de login devolve contrato sem senha_hash', async function executarTeste() {
    jest.spyOn(autenticacaoService, 'login').mockResolvedValue({
      mensagem: 'Login realizado com sucesso.',
      token: 'token-controlado',
      usuario: {
        idUsuario: 1,
        nomeCompleto: 'Administrador Teste',
        email: 'admin@teste.local',
        perfilAcesso: 'administrador'
      }
    });
    const resposta = await request(criarAplicacao())
      .post('/autenticacao/login')
      .send({
        email: 'ADMIN@TESTE.LOCAL',
        senha: 'SenhaForte123'
      });

    expect(resposta.status).toBe(200);
    expect(resposta.body.token).toBe('token-controlado');
    expect(JSON.stringify(resposta.body)).not.toContain('senha');
    expect(autenticacaoService.login).toHaveBeenCalledWith({
      email: 'admin@teste.local',
      senha: 'SenhaForte123'
    });
  });

  test('aplica rate limit especifico ao login', async function executarTeste() {
    jest
      .spyOn(autenticacaoService, 'login')
      .mockRejectedValue(new AppError('E-mail ou senha invalidos.', 401));
    const app = criarAplicacao({ loginMaximo: 2 });
    const credenciais = {
      email: 'admin@teste.local',
      senha: 'SenhaErrada123'
    };

    await request(app)
      .post('/autenticacao/login')
      .send(credenciais)
      .expect(401);
    await request(app)
      .post('/autenticacao/login')
      .send(credenciais)
      .expect(401);
    const resposta = await request(app)
      .post('/autenticacao/login')
      .send(credenciais);

    expect(resposta.status).toBe(429);
    expect(resposta.body.erro.mensagem).toContain('Muitas tentativas');
  });
});
