const { obterPoolBanco } = require('../../configuracoes/banco');

const CHAVE_BLOQUEIO_BAIRROS = 41001;
const CAMPOS_BAIRRO = `
  id_bairro, nome_bairro, bairro_ativo, criado_em, atualizado_em
`;

// Converte a linha do banco para o contrato do modulo.
function mapearBairro(linha) {
  if (!linha) {
    return null;
  }

  return {
    idBairro: linha.id_bairro,
    nomeBairro: linha.nome_bairro,
    bairroAtivo: linha.bairro_ativo,
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em
  };
}

// Lista somente bairros ativos com busca opcional por nome.
async function listarBairrosAtivos(filtros, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT ${CAMPOS_BAIRRO}
       FROM bairros
      WHERE bairro_ativo = TRUE
        AND ($1::text IS NULL OR nome_bairro ILIKE '%' || $1 || '%')
      ORDER BY LOWER(nome_bairro), nome_bairro, id_bairro`,
    [filtros.nome || null]
  );

  return resultado.rows.map(mapearBairro);
}

// Lista todos os bairros para a area administrativa.
async function listarTodosBairros(filtros, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT ${CAMPOS_BAIRRO}
       FROM bairros
      WHERE ($1::text IS NULL OR nome_bairro ILIKE '%' || $1 || '%')
        AND ($2::boolean IS NULL OR bairro_ativo = $2)
      ORDER BY LOWER(nome_bairro), nome_bairro, id_bairro`,
    [
      filtros.nome || null,
      filtros.ativo === undefined ? null : filtros.ativo
    ]
  );

  return resultado.rows.map(mapearBairro);
}

// Busca um bairro pelo identificador.
async function buscarBairroPorId(idBairro, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT ${CAMPOS_BAIRRO}
       FROM bairros
      WHERE id_bairro = $1`,
    [idBairro]
  );

  return mapearBairro(resultado.rows[0]);
}

// Busca nome duplicado sem diferenciar maiusculas e minusculas, inclusive inativos.
async function buscarBairroPorNome(nomeBairro, idIgnorado, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT id_bairro
       FROM bairros
      WHERE LOWER(nome_bairro) = LOWER($1)
        AND ($2::smallint IS NULL OR id_bairro <> $2)
      LIMIT 1`,
    [nomeBairro, idIgnorado || null]
  );

  return resultado.rows[0] || null;
}

// Cria um bairro ativo.
async function criarBairro(nomeBairro, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `INSERT INTO bairros (nome_bairro, bairro_ativo)
     VALUES ($1, TRUE)
     RETURNING ${CAMPOS_BAIRRO}`,
    [nomeBairro]
  );

  return mapearBairro(resultado.rows[0]);
}

// Edita somente o nome do bairro.
async function editarBairro(idBairro, nomeBairro, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `UPDATE bairros
        SET nome_bairro = $1,
            atualizado_em = CURRENT_TIMESTAMP
      WHERE id_bairro = $2
      RETURNING ${CAMPOS_BAIRRO}`,
    [nomeBairro, idBairro]
  );

  return mapearBairro(resultado.rows[0]);
}

// Altera somente o estado ativo do bairro.
async function alterarStatusBairro(idBairro, bairroAtivo, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `UPDATE bairros
        SET bairro_ativo = $1,
            atualizado_em = CURRENT_TIMESTAMP
      WHERE id_bairro = $2
      RETURNING ${CAMPOS_BAIRRO}`,
    [bairroAtivo, idBairro]
  );

  return mapearBairro(resultado.rows[0]);
}

// Serializa criacoes e edicoes para reforcar a unicidade sem alterar o schema.
async function executarTransacaoBairro(operacao) {
  const cliente = await obterPoolBanco().connect();

  try {
    await cliente.query('BEGIN');
    await cliente.query('SELECT pg_advisory_xact_lock($1)', [
      CHAVE_BLOQUEIO_BAIRROS
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
  listarBairrosAtivos,
  listarTodosBairros,
  buscarBairroPorId,
  buscarBairroPorNome,
  criarBairro,
  editarBairro,
  alterarStatusBairro,
  executarTransacaoBairro
};
