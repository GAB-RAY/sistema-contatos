const {
  criarUsuarioService
} = require('../../src/modulos/usuarios/usuarioService');

// Cria um model completo e isolado para cada regra do servico.
function criarModelo() {
  return {
    listarUsuarios: jest.fn(),
    buscarUsuarioPorId: jest.fn(),
    buscarUsuarioPorEmail: jest.fn(),
    criarUsuario: jest.fn(),
    editarUsuario: jest.fn(),
    alterarStatusUsuario: jest.fn(),
    trocarSenhaUsuario: jest.fn(),
    contarUsuarios: jest.fn(),
    contarAdministradoresAtivos: jest.fn(),
    executarTransacaoAdministrativa: jest.fn().mockImplementation(
      async function executarOperacao(operacao) {
        return operacao({ transacao: true });
      }
    )
  };
}

// Monta o servico com hash previsivel para observar o fluxo sem usar senha real.
function criarContexto() {
  const modelo = criarModelo();
  const bibliotecaBcrypt = {
    hash: jest.fn().mockResolvedValue('hash-gerado-no-teste')
  };
  const service = criarUsuarioService({
    modelo,
    bcrypt: bibliotecaBcrypt,
    custoBcrypt: 12
  });

  return { modelo, bibliotecaBcrypt, service };
}

// Gera uma conta segura sem campo de hash na resposta.
function criarUsuario(sobrescritas) {
  return {
    idUsuario: 1,
    nomeCompleto: 'Usuario Teste',
    email: 'usuario@teste.local',
    perfilAcesso: 'operador',
    usuarioAtivo: true,
    ...(sobrescritas || {})
  };
}

describe('usuarioService', function testarUsuarioService() {
  test('cria com seguranca o primeiro administrador', async function executarTeste() {
    const contexto = criarContexto();
    contexto.modelo.contarUsuarios.mockResolvedValue(0);
    contexto.modelo.criarUsuario.mockResolvedValue(
      criarUsuario({ perfilAcesso: 'administrador' })
    );

    const resultado = await contexto.service.criarPrimeiroAdministrador({
      nomeCompleto: 'Administrador Inicial',
      email: 'admin@teste.local',
      senha: 'SenhaForte123'
    });
    const dadosGravados = contexto.modelo.criarUsuario.mock.calls[0][0];

    expect(resultado.perfilAcesso).toBe('administrador');
    expect(contexto.bibliotecaBcrypt.hash).toHaveBeenCalledWith(
      'SenhaForte123',
      12
    );
    expect(dadosGravados.senhaHash).toBe('hash-gerado-no-teste');
    expect(JSON.stringify(dadosGravados)).not.toContain('SenhaForte123');
  });

  test('impede a segunda criacao do administrador inicial', async function executarTeste() {
    const contexto = criarContexto();
    contexto.modelo.contarUsuarios.mockResolvedValue(1);

    await expect(contexto.service.criarPrimeiroAdministrador({
      nomeCompleto: 'Outro Administrador',
      email: 'outro@teste.local',
      senha: 'SenhaForte123'
    })).rejects.toMatchObject({ statusHttp: 409 });
    expect(contexto.modelo.criarUsuario).not.toHaveBeenCalled();
  });

  test('cria usuario com hash e sem senha na resposta', async function executarTeste() {
    const contexto = criarContexto();
    contexto.modelo.buscarUsuarioPorEmail.mockResolvedValue(null);
    contexto.modelo.criarUsuario.mockResolvedValue(criarUsuario());

    const resultado = await contexto.service.criarUsuario({
      nomeCompleto: 'Usuario Teste',
      email: 'usuario@teste.local',
      senha: 'SenhaForte123',
      perfilAcesso: 'operador'
    });

    expect(resultado.senhaHash).toBeUndefined();
    expect(contexto.modelo.criarUsuario.mock.calls[0][0].senhaHash).toBe(
      'hash-gerado-no-teste'
    );
  });

  test('recusa e-mail duplicado', async function executarTeste() {
    const contexto = criarContexto();
    contexto.modelo.buscarUsuarioPorEmail.mockResolvedValue({ idUsuario: 9 });

    await expect(contexto.service.criarUsuario({
      nomeCompleto: 'Usuario Duplicado',
      email: 'usuario@teste.local',
      senha: 'SenhaForte123',
      perfilAcesso: 'operador'
    })).rejects.toMatchObject({ statusHttp: 409 });
    expect(contexto.bibliotecaBcrypt.hash).not.toHaveBeenCalled();
  });

  test('lista usuarios sem senha_hash', async function executarTeste() {
    const contexto = criarContexto();
    contexto.modelo.listarUsuarios.mockResolvedValue([criarUsuario()]);

    const usuarios = await contexto.service.listarUsuarios();

    expect(usuarios).toHaveLength(1);
    expect(usuarios[0].senhaHash).toBeUndefined();
  });

  test('edita nome, e-mail e perfil', async function executarTeste() {
    const contexto = criarContexto();
    const dadosEdicao = {
      nomeCompleto: 'Usuario Editado',
      email: 'editado@teste.local',
      perfilAcesso: 'operador'
    };
    contexto.modelo.buscarUsuarioPorId.mockResolvedValue(criarUsuario());
    contexto.modelo.buscarUsuarioPorEmail.mockResolvedValue(null);
    contexto.modelo.editarUsuario.mockResolvedValue(
      criarUsuario(dadosEdicao)
    );

    const resultado = await contexto.service.editarUsuario(1, dadosEdicao);

    expect(resultado.nomeCompleto).toBe('Usuario Editado');
    expect(contexto.modelo.editarUsuario).toHaveBeenCalledWith(
      1,
      dadosEdicao,
      { transacao: true }
    );
  });

  test('troca a senha usando bcrypt', async function executarTeste() {
    const contexto = criarContexto();
    contexto.modelo.buscarUsuarioPorId.mockResolvedValue(criarUsuario());
    contexto.modelo.trocarSenhaUsuario.mockResolvedValue(true);

    await contexto.service.trocarSenhaUsuario(1, 'NovaSenhaForte123');

    expect(contexto.bibliotecaBcrypt.hash).toHaveBeenCalledWith(
      'NovaSenhaForte123',
      12
    );
    expect(contexto.modelo.trocarSenhaUsuario).toHaveBeenCalledWith(
      1,
      'hash-gerado-no-teste'
    );
  });

  test('ativa e desativa usuario operador', async function executarTeste() {
    const contexto = criarContexto();
    const usuarioInativo = criarUsuario({ usuarioAtivo: false });
    contexto.modelo.buscarUsuarioPorId
      .mockResolvedValueOnce(usuarioInativo)
      .mockResolvedValueOnce(criarUsuario());
    contexto.modelo.alterarStatusUsuario
      .mockResolvedValueOnce(criarUsuario())
      .mockResolvedValueOnce(usuarioInativo);

    const usuarioAtivado = await contexto.service.ativarUsuario(1);
    const usuarioDesativado = await contexto.service.desativarUsuario(1, 9);

    expect(usuarioAtivado.usuarioAtivo).toBe(true);
    expect(usuarioDesativado.usuarioAtivo).toBe(false);
    expect(contexto.modelo.alterarStatusUsuario).toHaveBeenNthCalledWith(
      1,
      1,
      true
    );
    expect(contexto.modelo.alterarStatusUsuario).toHaveBeenNthCalledWith(
      2,
      1,
      false,
      { transacao: true }
    );
  });

  test('protege a propria conta do ultimo administrador ativo', async function executarTeste() {
    const contexto = criarContexto();
    contexto.modelo.buscarUsuarioPorId.mockResolvedValue(
      criarUsuario({ perfilAcesso: 'administrador' })
    );
    contexto.modelo.contarAdministradoresAtivos.mockResolvedValue(1);

    await expect(
      contexto.service.desativarUsuario(1, 1)
    ).rejects.toMatchObject({
      statusHttp: 409
    });
    expect(contexto.modelo.alterarStatusUsuario).not.toHaveBeenCalled();
  });

  test('impede o ultimo administrador ativo de perder o perfil', async function executarTeste() {
    const contexto = criarContexto();
    contexto.modelo.buscarUsuarioPorId.mockResolvedValue(
      criarUsuario({ perfilAcesso: 'administrador' })
    );
    contexto.modelo.buscarUsuarioPorEmail.mockResolvedValue(null);
    contexto.modelo.contarAdministradoresAtivos.mockResolvedValue(1);

    await expect(contexto.service.editarUsuario(1, {
      nomeCompleto: 'Administrador Teste',
      email: 'admin@teste.local',
      perfilAcesso: 'operador'
    })).rejects.toMatchObject({ statusHttp: 409 });
    expect(contexto.modelo.editarUsuario).not.toHaveBeenCalled();
  });

  test('propaga falha simulada do banco para o middleware global', async function executarTeste() {
    const contexto = criarContexto();
    const erroBanco = new Error('detalhe interno do banco');
    contexto.modelo.listarUsuarios.mockRejectedValue(erroBanco);

    await expect(contexto.service.listarUsuarios()).rejects.toBe(erroBanco);
  });
});
