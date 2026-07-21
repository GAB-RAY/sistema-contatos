const AppError = require('../../src/erros/AppError');
const {
  criarAutenticacaoService
} = require('../../src/modulos/autenticacao/autenticacaoService');

// Monta o servico com todas as dependencias controladas pelo teste.
function criarContexto() {
  const modelo = {
    buscarUsuarioPorEmail: jest.fn()
  };
  const bibliotecaBcrypt = {
    compare: jest.fn()
  };
  const bibliotecaJwt = {
    sign: jest.fn().mockReturnValue('token-assinado')
  };
  const service = criarAutenticacaoService({
    modelo,
    bcrypt: bibliotecaBcrypt,
    jwt: bibliotecaJwt,
    jwtSecret: 'segredo-exclusivo-dos-testes',
    jwtExpiresIn: '1h'
  });

  return { modelo, bibliotecaBcrypt, bibliotecaJwt, service };
}

// Cria um usuario encontrado pelo model de autenticacao.
function criarUsuario(sobrescritas) {
  return {
    idUsuario: 1,
    nomeCompleto: 'Administrador Teste',
    email: 'admin@teste.local',
    senhaHash: 'hash-seguro',
    perfilAcesso: 'administrador',
    usuarioAtivo: true,
    ...(sobrescritas || {})
  };
}

describe('autenticacaoService', function testarAutenticacaoService() {
  test('realiza login correto e nao devolve senha_hash', async function executarTeste() {
    const contexto = criarContexto();
    contexto.modelo.buscarUsuarioPorEmail.mockResolvedValue(criarUsuario());
    contexto.bibliotecaBcrypt.compare.mockResolvedValue(true);

    const resultado = await contexto.service.login({
      email: 'admin@teste.local',
      senha: 'SenhaForte123'
    });

    expect(resultado.mensagem).toBe('Login realizado com sucesso.');
    expect(resultado.token).toBe('token-assinado');
    expect(resultado.usuario).toEqual({
      idUsuario: 1,
      nomeCompleto: 'Administrador Teste',
      email: 'admin@teste.local',
      perfilAcesso: 'administrador'
    });
    expect(resultado.usuario.senhaHash).toBeUndefined();
    expect(contexto.bibliotecaJwt.sign).toHaveBeenCalledWith(
      { idUsuario: 1, perfilAcesso: 'administrador' },
      'segredo-exclusivo-dos-testes',
      { expiresIn: '1h' }
    );
  });

  test('usa mensagem generica para senha incorreta', async function executarTeste() {
    const contexto = criarContexto();
    contexto.modelo.buscarUsuarioPorEmail.mockResolvedValue(criarUsuario());
    contexto.bibliotecaBcrypt.compare.mockResolvedValue(false);

    await expect(contexto.service.login({
      email: 'admin@teste.local',
      senha: 'SenhaErrada123'
    })).rejects.toMatchObject({
      message: 'E-mail ou senha invalidos.',
      statusHttp: 401
    });
  });

  test('usa a mesma mensagem generica para e-mail inexistente', async function executarTeste() {
    const contexto = criarContexto();
    contexto.modelo.buscarUsuarioPorEmail.mockResolvedValue(null);

    await expect(contexto.service.login({
      email: 'inexistente@teste.local',
      senha: 'SenhaErrada123'
    })).rejects.toMatchObject({
      message: 'E-mail ou senha invalidos.',
      statusHttp: 401
    });
    expect(contexto.bibliotecaBcrypt.compare).not.toHaveBeenCalled();
  });

  test('usa a mesma mensagem generica para usuario inativo', async function executarTeste() {
    const contexto = criarContexto();
    contexto.modelo.buscarUsuarioPorEmail.mockResolvedValue(
      criarUsuario({ usuarioAtivo: false })
    );

    await expect(contexto.service.login({
      email: 'admin@teste.local',
      senha: 'SenhaForte123'
    })).rejects.toBeInstanceOf(AppError);

    try {
      await contexto.service.login({
        email: 'admin@teste.local',
        senha: 'SenhaForte123'
      });
    } catch (erro) {
      expect(erro.message).toBe('E-mail ou senha invalidos.');
      expect(erro.statusHttp).toBe(401);
    }
  });
});
