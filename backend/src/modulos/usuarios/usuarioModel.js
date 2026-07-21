const { obterPoolBanco } = require('../../configuracoes/banco');

const CHAVE_BLOQUEIO_ADMINISTRADORES = 31032026;
const CAMPOS_PUBLICOS_USUARIO = `
  id_usuario, nome_completo, email, perfil_acesso,
  usuario_ativo, criado_em, atualizado_em
`;

// Converte a linha do PostgreSQL sem incluir o hash da senha.
function mapearUsuario(linha) {
  if (!linha) {
    return null;
  }

  return {
    idUsuario: linha.id_usuario,
    nomeCompleto: linha.nome_completo,
    email: linha.email,
    perfilAcesso: linha.perfil_acesso,
    usuarioAtivo: linha.usuario_ativo,
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em
  };
}

// Lista usuarios usando apenas campos permitidos para resposta.
async function listarUsuarios(clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT ${CAMPOS_PUBLICOS_USUARIO}
       FROM usuarios
      ORDER BY nome_completo, id_usuario`
  );

  return resultado.rows.map(mapearUsuario);
}

// Busca um usuario pelo identificador numerico.
async function buscarUsuarioPorId(idUsuario, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT ${CAMPOS_PUBLICOS_USUARIO}
       FROM usuarios
      WHERE id_usuario = $1`,
    [idUsuario]
  );

  return mapearUsuario(resultado.rows[0]);
}

// Localiza e-mail duplicado, podendo ignorar o proprio usuario durante a edicao.
async function buscarUsuarioPorEmail(email, idUsuarioIgnorado, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT id_usuario
       FROM usuarios
      WHERE LOWER(email) = LOWER($1)
        AND ($2::bigint IS NULL OR id_usuario <> $2)
      LIMIT 1`,
    [email, idUsuarioIgnorado || null]
  );

  if (!resultado.rows[0]) {
    return null;
  }

  return { idUsuario: resultado.rows[0].id_usuario };
}

// Insere um usuario com o hash ja produzido pelo servico.
async function criarUsuario(dadosUsuario, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `INSERT INTO usuarios
      (nome_completo, email, senha_hash, perfil_acesso, usuario_ativo)
     VALUES ($1, $2, $3, $4, TRUE)
     RETURNING ${CAMPOS_PUBLICOS_USUARIO}`,
    [
      dadosUsuario.nomeCompleto,
      dadosUsuario.email,
      dadosUsuario.senhaHash,
      dadosUsuario.perfilAcesso
    ]
  );

  return mapearUsuario(resultado.rows[0]);
}

// Atualiza somente nome, e-mail e perfil.
async function editarUsuario(idUsuario, dadosUsuario, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `UPDATE usuarios
        SET nome_completo = $1,
            email = $2,
            perfil_acesso = $3,
            atualizado_em = CURRENT_TIMESTAMP
      WHERE id_usuario = $4
      RETURNING ${CAMPOS_PUBLICOS_USUARIO}`,
    [
      dadosUsuario.nomeCompleto,
      dadosUsuario.email,
      dadosUsuario.perfilAcesso,
      idUsuario
    ]
  );

  return mapearUsuario(resultado.rows[0]);
}

// Ativa ou desativa uma conta sem modificar outros campos.
async function alterarStatusUsuario(idUsuario, usuarioAtivo, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `UPDATE usuarios
        SET usuario_ativo = $1,
            atualizado_em = CURRENT_TIMESTAMP
      WHERE id_usuario = $2
      RETURNING ${CAMPOS_PUBLICOS_USUARIO}`,
    [usuarioAtivo, idUsuario]
  );

  return mapearUsuario(resultado.rows[0]);
}

// Substitui somente o hash da senha do usuario informado.
async function trocarSenhaUsuario(idUsuario, senhaHash, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `UPDATE usuarios
        SET senha_hash = $1,
            atualizado_em = CURRENT_TIMESTAMP
      WHERE id_usuario = $2
      RETURNING id_usuario`,
    [senhaHash, idUsuario]
  );

  return resultado.rowCount === 1;
}

// Conta todos os usuarios para proteger a criacao unica do administrador inicial.
async function contarUsuarios(clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    'SELECT COUNT(*)::integer AS quantidade FROM usuarios'
  );

  return resultado.rows[0].quantidade;
}

// Conta somente administradores ativos dentro da transacao de protecao.
async function contarAdministradoresAtivos(clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT COUNT(*)::integer AS quantidade
       FROM usuarios
      WHERE perfil_acesso = $1
        AND usuario_ativo = TRUE`,
    ['administrador']
  );

  return resultado.rows[0].quantidade;
}

// Serializa operacoes que podem afetar a existencia de um administrador ativo.
async function executarTransacaoAdministrativa(operacao) {
  const cliente = await obterPoolBanco().connect();

  try {
    await cliente.query('BEGIN');
    await cliente.query(
      'SELECT pg_advisory_xact_lock($1)',
      [CHAVE_BLOQUEIO_ADMINISTRADORES]
    );
    const resultado = await operacao(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (erro) {
    await cliente.query('ROLLBACK');
    throw erro;
  } finally {
    cliente.release();
  }
}

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  buscarUsuarioPorEmail,
  criarUsuario,
  editarUsuario,
  alterarStatusUsuario,
  trocarSenhaUsuario,
  contarUsuarios,
  contarAdministradoresAtivos,
  executarTransacaoAdministrativa
};
