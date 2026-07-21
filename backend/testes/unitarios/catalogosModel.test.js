const bairroModel = require('../../src/modulos/bairros/bairroModel');
const problemaModel = require('../../src/modulos/problemas/problemaModel');
const origemModel = require('../../src/modulos/origens/origemModel');

const configuracoesModels = [
  {
    nome: 'bairros',
    modelo: bairroModel,
    listarAtivos: 'listarBairrosAtivos',
    listarTodos: 'listarTodosBairros',
    colunaAtivo: 'bairro_ativo',
    colunaNome: 'nome_bairro'
  },
  {
    nome: 'problemas',
    modelo: problemaModel,
    listarAtivos: 'listarProblemasAtivos',
    listarTodos: 'listarTodosProblemas',
    colunaAtivo: 'problema_ativo',
    colunaNome: 'nome_problema'
  },
  {
    nome: 'origens',
    modelo: origemModel,
    listarAtivos: 'listarOrigensAtivas',
    listarTodos: 'listarTodasOrigens',
    colunaAtivo: 'origem_ativa',
    colunaNome: 'nome_origem'
  }
];

// Cria um cliente que devolve lista vazia e permite inspecionar a consulta.
function criarClienteBanco() {
  return {
    query: jest.fn().mockResolvedValue({ rows: [] })
  };
}

describe.each(configuracoesModels)(
  'model de $nome',
  function testarModelCatalogo(configuracao) {
    test('lista padrao somente ativos com nome parametrizado e ordenacao fixa', async function executarTeste() {
      const clienteBanco = criarClienteBanco();

      await configuracao.modelo[configuracao.listarAtivos](
        { nome: 'centro' },
        clienteBanco
      );
      const chamada = clienteBanco.query.mock.calls[0];

      expect(chamada[0]).toContain(`${configuracao.colunaAtivo} = TRUE`);
      expect(chamada[0]).toContain(
        `${configuracao.colunaNome} ILIKE '%' || $1 || '%'`
      );
      expect(chamada[0]).toContain(
        `ORDER BY LOWER(${configuracao.colunaNome})`
      );
      expect(chamada[1]).toEqual(['centro']);
    });

    test('aplica filtro administrativo de ativo com parametro booleano', async function executarTeste() {
      const clienteBanco = criarClienteBanco();

      await configuracao.modelo[configuracao.listarTodos](
        { nome: 'centro', ativo: false },
        clienteBanco
      );
      const chamada = clienteBanco.query.mock.calls[0];

      expect(chamada[0]).toContain(
        `($2::boolean IS NULL OR ${configuracao.colunaAtivo} = $2)`
      );
      expect(chamada[1]).toEqual(['centro', false]);
    });
  }
);
