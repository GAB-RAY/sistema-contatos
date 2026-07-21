const {
  TABELAS_V1,
  TABELAS_FUTURAS,
  testarConexaoBanco,
  verificarTabelasBanco
} = require('../../src/configuracoes/banco');

describe('Configuracao do PostgreSQL', function testarBanco() {
  test('confirma uma conexao valida com uma consulta somente leitura', async function executarTeste() {
    const horarioBanco = new Date('2026-01-01T12:00:00.000Z');
    const clienteBanco = {
      query: jest.fn().mockResolvedValue({
        rows: [{ horario_banco: horarioBanco }]
      })
    };

    const resultado = await testarConexaoBanco(clienteBanco);

    expect(resultado).toEqual({
      disponivel: true,
      mensagem: 'Conexao com PostgreSQL disponivel.',
      horarioBanco
    });
    expect(clienteBanco.query).toHaveBeenCalledWith(
      'SELECT NOW() AS horario_banco'
    );
  });

  test('trata falha de conexao sem expor senha ou encerrar o processo', async function executarTeste() {
    const erroConexao = new Error('senha-super-secreta');
    erroConexao.code = '28P01';
    const clienteBanco = {
      query: jest.fn().mockRejectedValue(erroConexao)
    };
    const registrarErro = jest
      .spyOn(console, 'error')
      .mockImplementation(function ignorarLogNoTeste() {});

    const resultado = await testarConexaoBanco(clienteBanco);
    const textoRegistrado = registrarErro.mock.calls.flat().join(' ');

    expect(resultado).toEqual({
      disponivel: false,
      mensagem: 'Banco de dados indisponivel.'
    });
    expect(textoRegistrado).toContain('28P01');
    expect(textoRegistrado).not.toContain('senha-super-secreta');
  });

  test('confirma exatamente as 10 tabelas V1 e as 4 tabelas futuras', async function executarTeste() {
    const tabelasEsperadas = [...TABELAS_V1, ...TABELAS_FUTURAS];
    const clienteBanco = {
      query: jest.fn().mockResolvedValue({
        rows: tabelasEsperadas.map(function criarLinha(nomeTabela) {
          return { table_name: nomeTabela };
        })
      })
    };

    const resultado = await verificarTabelasBanco(clienteBanco);
    const consultaExecutada = clienteBanco.query.mock.calls[0][0];

    expect(resultado.verificada).toBe(true);
    expect(resultado.estruturaValida).toBe(true);
    expect(resultado.quantidadeTabelasPublicas).toBe(14);
    expect(resultado.tabelasV1.quantidadeEncontrada).toBe(10);
    expect(resultado.tabelasV1.faltantes).toEqual([]);
    expect(resultado.tabelasFuturas.quantidadeEncontrada).toBe(4);
    expect(resultado.tabelasFuturas.faltantes).toEqual([]);
    expect(resultado.tabelasExtras).toEqual([]);
    expect(consultaExecutada).toContain('information_schema.tables');
    expect(consultaExecutada).not.toMatch(/CREATE|DROP|ALTER/i);
    expect(clienteBanco.query.mock.calls[0][1]).toEqual(['public']);
  });

  test('marca a estrutura como invalida quando uma tabela estiver ausente', async function executarTeste() {
    const tabelasIncompletas = [...TABELAS_V1, ...TABELAS_FUTURAS].slice(1);
    const clienteBanco = {
      query: jest.fn().mockResolvedValue({
        rows: tabelasIncompletas.map(function criarLinha(nomeTabela) {
          return { table_name: nomeTabela };
        })
      })
    };

    const resultado = await verificarTabelasBanco(clienteBanco);

    expect(resultado.estruturaValida).toBe(false);
    expect(resultado.quantidadeTabelasPublicas).toBe(13);
    expect(resultado.tabelasV1.faltantes).toEqual([TABELAS_V1[0]]);
  });
});
