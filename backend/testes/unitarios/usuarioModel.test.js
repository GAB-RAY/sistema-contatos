const usuarioModel = require('../../src/modulos/usuarios/usuarioModel');

describe('usuarioModel', function testarUsuarioModel() {
  test('lista sem consultar ou devolver senha_hash', async function executarTeste() {
    const clienteBanco = {
      query: jest.fn().mockResolvedValue({
        rows: [{
          id_usuario: 1,
          nome_completo: 'Usuario Teste',
          email: 'usuario@teste.local',
          perfil_acesso: 'operador',
          usuario_ativo: true,
          criado_em: new Date('2026-01-01T00:00:00.000Z'),
          atualizado_em: new Date('2026-01-01T00:00:00.000Z'),
          senha_hash: 'nao-deve-sair'
        }]
      })
    };

    const usuarios = await usuarioModel.listarUsuarios(clienteBanco);
    const sql = clienteBanco.query.mock.calls[0][0];

    expect(sql).not.toContain('senha_hash');
    expect(usuarios[0].senhaHash).toBeUndefined();
    expect(JSON.stringify(usuarios)).not.toContain('nao-deve-sair');
  });

  test('cria usuario com valores parametrizados', async function executarTeste() {
    const clienteBanco = {
      query: jest.fn().mockResolvedValue({
        rows: [{
          id_usuario: 2,
          nome_completo: 'Novo Usuario',
          email: 'novo@teste.local',
          perfil_acesso: 'operador',
          usuario_ativo: true,
          criado_em: new Date('2026-01-01T00:00:00.000Z'),
          atualizado_em: new Date('2026-01-01T00:00:00.000Z')
        }]
      })
    };

    await usuarioModel.criarUsuario({
      nomeCompleto: 'Novo Usuario',
      email: 'novo@teste.local',
      senhaHash: 'hash-seguro',
      perfilAcesso: 'operador'
    }, clienteBanco);
    const chamada = clienteBanco.query.mock.calls[0];

    expect(chamada[0]).toContain('VALUES ($1, $2, $3, $4, TRUE)');
    expect(chamada[1]).toEqual([
      'Novo Usuario',
      'novo@teste.local',
      'hash-seguro',
      'operador'
    ]);
  });
});
