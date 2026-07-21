const {
  testarConexaoBanco,
  verificarTabelasBanco,
  encerrarPoolBanco
} = require('./banco');

// Executa a verificacao somente leitura da conexao e da estrutura publica do banco.
async function executarVerificacaoBanco() {
  try {
    const conexao = await testarConexaoBanco();

    if (!conexao.disponivel) {
      console.error('Conexao com PostgreSQL: indisponivel.');
      process.exitCode = 1;
      return;
    }

    console.log('Conexao com PostgreSQL: disponivel.');

    const estrutura = await verificarTabelasBanco();

    if (!estrutura.verificada) {
      console.error('Estrutura do banco: nao foi possivel verificar.');
      process.exitCode = 1;
      return;
    }

    console.log(`Tabelas publicas: ${estrutura.quantidadeTabelasPublicas}/14.`);
    console.log(
      `Tabelas da V1: ${estrutura.tabelasV1.quantidadeEncontrada}/` +
      `${estrutura.tabelasV1.quantidadeEsperada}.`
    );
    console.log(
      `Tabelas futuras: ${estrutura.tabelasFuturas.quantidadeEncontrada}/` +
      `${estrutura.tabelasFuturas.quantidadeEsperada} ` +
      '(somente existencia verificada).'
    );
    console.log(
      `Estrutura do banco: ${estrutura.estruturaValida ? 'valida' : 'invalida'}.`
    );

    if (!estrutura.estruturaValida) {
      process.exitCode = 1;
    }
  } finally {
    await encerrarPoolBanco();
  }
}

if (require.main === module) {
  executarVerificacaoBanco().catch(function tratarFalhaInesperada(erro) {
    const codigo = erro && erro.code ? erro.code : 'SEM_CODIGO';
    console.error(`Falha inesperada na verificacao do banco. Codigo: ${codigo}.`);
    process.exitCode = 1;
  });
}

module.exports = {
  executarVerificacaoBanco
};
