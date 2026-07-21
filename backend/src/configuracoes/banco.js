const { Pool } = require('pg');

const ambiente = require('./ambiente');

const TABELAS_V1 = Object.freeze([
  'usuarios',
  'bairros',
  'problemas',
  'origens_listas',
  'contatos',
  'importacoes',
  'importacao_itens',
  'consentimentos',
  'tentativas_contato',
  'historico_alteracoes'
]);

const TABELAS_FUTURAS = Object.freeze([
  'campanhas',
  'campanha_destinatarios',
  'sessoes_whatsapp',
  'mensagens_whatsapp'
]);

const TABELAS_ESPERADAS = Object.freeze([
  ...TABELAS_V1,
  ...TABELAS_FUTURAS
]);

let poolBanco;

// Registra somente o contexto e o codigo tecnico, sem credenciais ou string de conexao.
function registrarErroBanco(contexto, erro) {
  const codigo = erro && erro.code ? erro.code : 'SEM_CODIGO';
  console.error(`${contexto} Codigo: ${codigo}.`);
}

// Impede que o pg use valores implicitos quando a configuracao obrigatoria estiver ausente.
function validarConfiguracaoBanco(configuracao) {
  const campos = [
    ['BANCO_HOST', configuracao.host],
    ['BANCO_PORTA', configuracao.porta],
    ['BANCO_USUARIO', configuracao.usuario],
    ['BANCO_SENHA', configuracao.senha],
    ['BANCO_NOME', configuracao.nome]
  ];
  const camposAusentes = campos
    .filter(function verificarCampo(item) {
      return item[1] === undefined || item[1] === null || item[1] === '';
    })
    .map(function obterNomeCampo(item) {
      return item[0];
    });

  if (camposAusentes.length > 0) {
    const erro = new Error(
      `Configuracao do banco incompleta: ${camposAusentes.join(', ')}.`
    );
    erro.code = 'CONFIGURACAO_INCOMPLETA';
    throw erro;
  }
}

// Cria o pool sob demanda para que a aplicacao consiga reportar configuracao ausente com seguranca.
function obterPoolBanco() {
  if (poolBanco) {
    return poolBanco;
  }

  validarConfiguracaoBanco(ambiente.banco);

  poolBanco = new Pool({
    host: ambiente.banco.host,
    port: ambiente.banco.porta,
    user: ambiente.banco.usuario,
    password: ambiente.banco.senha,
    database: ambiente.banco.nome,
    connectionTimeoutMillis: ambiente.banco.tempoLimiteConexaoMs
  });

  poolBanco.on('error', function tratarErroInesperadoNoPool(erro) {
    registrarErroBanco('Erro inesperado em uma conexao ociosa do PostgreSQL.', erro);
  });

  return poolBanco;
}

// Executa uma consulta simples e devolve um estado claro sem encerrar o processo.
async function testarConexaoBanco(clienteBanco) {
  try {
    const cliente = clienteBanco || obterPoolBanco();
    const resultado = await cliente.query('SELECT NOW() AS horario_banco');

    return {
      disponivel: true,
      mensagem: 'Conexao com PostgreSQL disponivel.',
      horarioBanco: resultado.rows[0].horario_banco
    };
  } catch (erro) {
    registrarErroBanco('Falha ao testar a conexao com PostgreSQL.', erro);

    return {
      disponivel: false,
      mensagem: 'Banco de dados indisponivel.'
    };
  }
}

// Resume quantas tabelas esperadas foram encontradas em um grupo.
function resumirTabelas(tabelasEsperadas, conjuntoTabelasPublicas) {
  const encontradas = tabelasEsperadas.filter(function verificarTabela(nomeTabela) {
    return conjuntoTabelasPublicas.has(nomeTabela);
  });
  const faltantes = tabelasEsperadas.filter(function verificarTabela(nomeTabela) {
    return !conjuntoTabelasPublicas.has(nomeTabela);
  });

  return {
    quantidadeEsperada: tabelasEsperadas.length,
    quantidadeEncontrada: encontradas.length,
    encontradas,
    faltantes
  };
}

// Consulta apenas o catalogo do PostgreSQL e confirma as 14 tabelas definidas no script oficial.
async function verificarTabelasBanco(clienteBanco) {
  try {
    const cliente = clienteBanco || obterPoolBanco();
    const resultado = await cliente.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = $1
         AND table_type = 'BASE TABLE'
       ORDER BY table_name`,
      ['public']
    );
    const tabelasPublicas = resultado.rows.map(function obterNomeTabela(linha) {
      return linha.table_name;
    });
    const conjuntoTabelasPublicas = new Set(tabelasPublicas);
    const conjuntoTabelasEsperadas = new Set(TABELAS_ESPERADAS);
    const tabelasV1 = resumirTabelas(TABELAS_V1, conjuntoTabelasPublicas);
    const tabelasFuturas = resumirTabelas(
      TABELAS_FUTURAS,
      conjuntoTabelasPublicas
    );
    const tabelasExtras = tabelasPublicas.filter(function verificarTabela(nomeTabela) {
      return !conjuntoTabelasEsperadas.has(nomeTabela);
    });
    const estruturaValida =
      tabelasPublicas.length === TABELAS_ESPERADAS.length &&
      tabelasV1.faltantes.length === 0 &&
      tabelasFuturas.faltantes.length === 0 &&
      tabelasExtras.length === 0;

    return {
      verificada: true,
      estruturaValida,
      quantidadeTabelasPublicas: tabelasPublicas.length,
      tabelasPublicas,
      tabelasV1,
      tabelasFuturas,
      tabelasExtras
    };
  } catch (erro) {
    registrarErroBanco('Falha ao verificar as tabelas do PostgreSQL.', erro);

    return {
      verificada: false,
      estruturaValida: false,
      mensagem: 'Nao foi possivel verificar as tabelas do banco.'
    };
  }
}

// Encerra o pool de forma controlada em comandos de verificacao e testes externos.
async function encerrarPoolBanco() {
  if (!poolBanco) {
    return;
  }

  await poolBanco.end();
  poolBanco = undefined;
}

module.exports = {
  TABELAS_V1,
  TABELAS_FUTURAS,
  obterPoolBanco,
  testarConexaoBanco,
  verificarTabelasBanco,
  encerrarPoolBanco
};
