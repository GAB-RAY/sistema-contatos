const { obterPoolBanco } = require('../../configuracoes/banco');

const CHAVE_BLOQUEIO_PROBLEMAS = 41002;
const CAMPOS_PROBLEMA = `
  id_problema, nome_problema, problema_ativo, criado_em, atualizado_em
`;

function mapearProblema(linha) {
  if (!linha) {
    return null;
  }

  return {
    idProblema: linha.id_problema,
    nomeProblema: linha.nome_problema,
    problemaAtivo: linha.problema_ativo,
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em
  };
}

async function listarProblemasAtivos(filtros, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT ${CAMPOS_PROBLEMA}
       FROM problemas
      WHERE problema_ativo = TRUE
        AND ($1::text IS NULL OR nome_problema ILIKE '%' || $1 || '%')
      ORDER BY LOWER(nome_problema), nome_problema, id_problema`,
    [filtros.nome || null]
  );

  return resultado.rows.map(mapearProblema);
}

async function listarTodosProblemas(filtros, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT ${CAMPOS_PROBLEMA}
       FROM problemas
      WHERE ($1::text IS NULL OR nome_problema ILIKE '%' || $1 || '%')
        AND ($2::boolean IS NULL OR problema_ativo = $2)
      ORDER BY LOWER(nome_problema), nome_problema, id_problema`,
    [
      filtros.nome || null,
      filtros.ativo === undefined ? null : filtros.ativo
    ]
  );

  return resultado.rows.map(mapearProblema);
}

async function buscarProblemaPorId(idProblema, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT ${CAMPOS_PROBLEMA}
       FROM problemas
      WHERE id_problema = $1`,
    [idProblema]
  );

  return mapearProblema(resultado.rows[0]);
}

async function buscarProblemaPorNome(nomeProblema, idIgnorado, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT id_problema
       FROM problemas
      WHERE LOWER(nome_problema) = LOWER($1)
        AND ($2::integer IS NULL OR id_problema <> $2)
      LIMIT 1`,
    [nomeProblema, idIgnorado || null]
  );

  return resultado.rows[0] || null;
}

async function criarProblema(nomeProblema, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `INSERT INTO problemas (nome_problema, problema_ativo)
     VALUES ($1, TRUE)
     RETURNING ${CAMPOS_PROBLEMA}`,
    [nomeProblema]
  );

  return mapearProblema(resultado.rows[0]);
}

async function editarProblema(idProblema, nomeProblema, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `UPDATE problemas
        SET nome_problema = $1,
            atualizado_em = CURRENT_TIMESTAMP
      WHERE id_problema = $2
      RETURNING ${CAMPOS_PROBLEMA}`,
    [nomeProblema, idProblema]
  );

  return mapearProblema(resultado.rows[0]);
}

async function alterarStatusProblema(idProblema, problemaAtivo, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `UPDATE problemas
        SET problema_ativo = $1,
            atualizado_em = CURRENT_TIMESTAMP
      WHERE id_problema = $2
      RETURNING ${CAMPOS_PROBLEMA}`,
    [problemaAtivo, idProblema]
  );

  return mapearProblema(resultado.rows[0]);
}

async function executarTransacaoProblema(operacao) {
  const cliente = await obterPoolBanco().connect();

  try {
    await cliente.query('BEGIN');
    await cliente.query('SELECT pg_advisory_xact_lock($1)', [
      CHAVE_BLOQUEIO_PROBLEMAS
    ]);
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
  listarProblemasAtivos,
  listarTodosProblemas,
  buscarProblemaPorId,
  buscarProblemaPorNome,
  criarProblema,
  editarProblema,
  alterarStatusProblema,
  executarTransacaoProblema
};
