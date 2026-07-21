const { obterPoolBanco } = require('../../configuracoes/banco');

const CHAVE_BLOQUEIO_ORIGENS = 41003;
const CAMPOS_ORIGEM = `
  id_origem, nome_origem, descricao_origem,
  origem_ativa, criado_em, atualizado_em
`;

function mapearOrigem(linha) {
  if (!linha) {
    return null;
  }

  return {
    idOrigem: linha.id_origem,
    nomeOrigem: linha.nome_origem,
    descricaoOrigem: linha.descricao_origem,
    origemAtiva: linha.origem_ativa,
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em
  };
}

async function listarOrigensAtivas(filtros, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT ${CAMPOS_ORIGEM}
       FROM origens_listas
      WHERE origem_ativa = TRUE
        AND ($1::text IS NULL OR nome_origem ILIKE '%' || $1 || '%')
      ORDER BY LOWER(nome_origem), nome_origem, id_origem`,
    [filtros.nome || null]
  );

  return resultado.rows.map(mapearOrigem);
}

async function listarTodasOrigens(filtros, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT ${CAMPOS_ORIGEM}
       FROM origens_listas
      WHERE ($1::text IS NULL OR nome_origem ILIKE '%' || $1 || '%')
        AND ($2::boolean IS NULL OR origem_ativa = $2)
      ORDER BY LOWER(nome_origem), nome_origem, id_origem`,
    [
      filtros.nome || null,
      filtros.ativo === undefined ? null : filtros.ativo
    ]
  );

  return resultado.rows.map(mapearOrigem);
}

async function buscarOrigemPorId(idOrigem, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT ${CAMPOS_ORIGEM}
       FROM origens_listas
      WHERE id_origem = $1`,
    [idOrigem]
  );

  return mapearOrigem(resultado.rows[0]);
}

async function buscarOrigemPorNome(nomeOrigem, idIgnorado, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT id_origem
       FROM origens_listas
      WHERE LOWER(nome_origem) = LOWER($1)
        AND ($2::bigint IS NULL OR id_origem <> $2)
      LIMIT 1`,
    [nomeOrigem, idIgnorado || null]
  );

  return resultado.rows[0] || null;
}

async function criarOrigem(dadosOrigem, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `INSERT INTO origens_listas
      (nome_origem, descricao_origem, origem_ativa)
     VALUES ($1, $2, TRUE)
     RETURNING ${CAMPOS_ORIGEM}`,
    [dadosOrigem.nomeOrigem, dadosOrigem.descricaoOrigem]
  );

  return mapearOrigem(resultado.rows[0]);
}

async function editarOrigem(idOrigem, dadosOrigem, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `UPDATE origens_listas
        SET nome_origem = $1,
            descricao_origem = $2,
            atualizado_em = CURRENT_TIMESTAMP
      WHERE id_origem = $3
      RETURNING ${CAMPOS_ORIGEM}`,
    [dadosOrigem.nomeOrigem, dadosOrigem.descricaoOrigem, idOrigem]
  );

  return mapearOrigem(resultado.rows[0]);
}

async function alterarStatusOrigem(idOrigem, origemAtiva, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `UPDATE origens_listas
        SET origem_ativa = $1,
            atualizado_em = CURRENT_TIMESTAMP
      WHERE id_origem = $2
      RETURNING ${CAMPOS_ORIGEM}`,
    [origemAtiva, idOrigem]
  );

  return mapearOrigem(resultado.rows[0]);
}

async function executarTransacaoOrigem(operacao) {
  const cliente = await obterPoolBanco().connect();

  try {
    await cliente.query('BEGIN');
    await cliente.query('SELECT pg_advisory_xact_lock($1)', [
      CHAVE_BLOQUEIO_ORIGENS
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
  listarOrigensAtivas,
  listarTodasOrigens,
  buscarOrigemPorId,
  buscarOrigemPorNome,
  criarOrigem,
  editarOrigem,
  alterarStatusOrigem,
  executarTransacaoOrigem
};
