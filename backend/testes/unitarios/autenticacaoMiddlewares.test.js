const jwt = require('jsonwebtoken');

const {
  criarVerificarToken
} = require('../../src/modulos/autenticacao/verificarToken');
const verificarPerfil = require('../../src/modulos/autenticacao/verificarPerfil');

const SEGREDO_TESTE = 'segredo-longo-e-exclusivo-para-testes-jwt';

// Executa o middleware de token com uma requisicao minima.
function criarRequisicao(authorization) {
  return {
    headers: authorization ? { authorization } : {}
  };
}

describe('middlewares de autenticacao', function testarMiddlewares() {
  test('rejeita token ausente', function executarTeste() {
    const middleware = criarVerificarToken({ jwt, jwtSecret: SEGREDO_TESTE });
    const proximo = jest.fn();

    middleware(criarRequisicao(), {}, proximo);

    expect(proximo).toHaveBeenCalledTimes(1);
    expect(proximo.mock.calls[0][0]).toMatchObject({ statusHttp: 401 });
  });

  test('rejeita token invalido', function executarTeste() {
    const middleware = criarVerificarToken({ jwt, jwtSecret: SEGREDO_TESTE });
    const proximo = jest.fn();

    middleware(criarRequisicao('Bearer token-invalido'), {}, proximo);

    expect(proximo.mock.calls[0][0]).toMatchObject({
      message: 'Token de autenticacao invalido.',
      statusHttp: 401
    });
  });

  test('aceita token valido e cria req.usuario', function executarTeste() {
    const middleware = criarVerificarToken({ jwt, jwtSecret: SEGREDO_TESTE });
    const token = jwt.sign(
      { idUsuario: 7, perfilAcesso: 'administrador' },
      SEGREDO_TESTE,
      { expiresIn: '1h' }
    );
    const requisicao = criarRequisicao(`Bearer ${token}`);
    const proximo = jest.fn();

    middleware(requisicao, {}, proximo);

    expect(requisicao.usuario).toEqual({
      idUsuario: 7,
      perfilAcesso: 'administrador'
    });
    expect(proximo).toHaveBeenCalledWith();
  });

  test('bloqueia operador em verificacao exclusiva de administrador', function executarTeste() {
    const middleware = verificarPerfil('administrador');
    const proximo = jest.fn();

    middleware(
      { usuario: { idUsuario: 2, perfilAcesso: 'operador' } },
      {},
      proximo
    );

    expect(proximo.mock.calls[0][0]).toMatchObject({ statusHttp: 403 });
  });

  test('autoriza administrador e aceita lista de perfis', function executarTeste() {
    const middleware = verificarPerfil('administrador', 'operador');
    const proximo = jest.fn();

    middleware(
      { usuario: { idUsuario: 1, perfilAcesso: 'administrador' } },
      {},
      proximo
    );

    expect(proximo).toHaveBeenCalledWith();
  });
});
