const {
  criarBairroService
} = require('../../src/modulos/bairros/bairroService');
const {
  criarProblemaService
} = require('../../src/modulos/problemas/problemaService');
const {
  criarOrigemService
} = require('../../src/modulos/origens/origemService');

const configuracoesCatalogos = [
  {
    nome: 'bairros',
    criarService: criarBairroService,
    metodosService: {
      listarAtivos: 'listarBairrosAtivos',
      listarTodos: 'listarTodosBairros',
      buscarPorId: 'buscarBairroPorId',
      criar: 'criarBairro',
      editar: 'editarBairro',
      alterarStatus: 'alterarStatusBairro'
    },
    metodosModel: {
      listarAtivos: 'listarBairrosAtivos',
      listarTodos: 'listarTodosBairros',
      buscarPorId: 'buscarBairroPorId',
      buscarPorNome: 'buscarBairroPorNome',
      criar: 'criarBairro',
      editar: 'editarBairro',
      alterarStatus: 'alterarStatusBairro',
      transacao: 'executarTransacaoBairro'
    },
    criarRegistro: function criarRegistro(sobrescritas) {
      return {
        idBairro: 1,
        nomeBairro: 'Centro',
        bairroAtivo: true,
        ...(sobrescritas || {})
      };
    },
    dadosCriacao: { nomeBairro: '  Jardim   Azul  ' },
    dadosEdicao: { nomeBairro: '  Centro   Novo  ' },
    dadosNomeVazio: { nomeBairro: '   ' },
    verificarCriacao: function verificarCriacao(modelo, metodo, cliente) {
      expect(modelo[metodo]).toHaveBeenCalledWith('Jardim Azul', cliente);
    },
    verificarEdicao: function verificarEdicao(modelo, metodo, cliente) {
      expect(modelo[metodo]).toHaveBeenCalledWith(1, 'Centro Novo', cliente);
    }
  },
  {
    nome: 'problemas',
    criarService: criarProblemaService,
    metodosService: {
      listarAtivos: 'listarProblemasAtivos',
      listarTodos: 'listarTodosProblemas',
      buscarPorId: 'buscarProblemaPorId',
      criar: 'criarProblema',
      editar: 'editarProblema',
      alterarStatus: 'alterarStatusProblema'
    },
    metodosModel: {
      listarAtivos: 'listarProblemasAtivos',
      listarTodos: 'listarTodosProblemas',
      buscarPorId: 'buscarProblemaPorId',
      buscarPorNome: 'buscarProblemaPorNome',
      criar: 'criarProblema',
      editar: 'editarProblema',
      alterarStatus: 'alterarStatusProblema',
      transacao: 'executarTransacaoProblema'
    },
    criarRegistro: function criarRegistro(sobrescritas) {
      return {
        idProblema: 1,
        nomeProblema: 'Iluminacao Publica',
        problemaAtivo: true,
        ...(sobrescritas || {})
      };
    },
    dadosCriacao: { nomeProblema: '  Coleta   de Lixo  ' },
    dadosEdicao: { nomeProblema: '  Iluminacao   Urbana  ' },
    dadosNomeVazio: { nomeProblema: '   ' },
    verificarCriacao: function verificarCriacao(modelo, metodo, cliente) {
      expect(modelo[metodo]).toHaveBeenCalledWith('Coleta de Lixo', cliente);
    },
    verificarEdicao: function verificarEdicao(modelo, metodo, cliente) {
      expect(modelo[metodo]).toHaveBeenCalledWith(
        1,
        'Iluminacao Urbana',
        cliente
      );
    }
  },
  {
    nome: 'origens',
    criarService: criarOrigemService,
    metodosService: {
      listarAtivos: 'listarOrigensAtivas',
      listarTodos: 'listarTodasOrigens',
      buscarPorId: 'buscarOrigemPorId',
      criar: 'criarOrigem',
      editar: 'editarOrigem',
      alterarStatus: 'alterarStatusOrigem'
    },
    metodosModel: {
      listarAtivos: 'listarOrigensAtivas',
      listarTodos: 'listarTodasOrigens',
      buscarPorId: 'buscarOrigemPorId',
      buscarPorNome: 'buscarOrigemPorNome',
      criar: 'criarOrigem',
      editar: 'editarOrigem',
      alterarStatus: 'alterarStatusOrigem',
      transacao: 'executarTransacaoOrigem'
    },
    criarRegistro: function criarRegistro(sobrescritas) {
      return {
        idOrigem: 1,
        nomeOrigem: 'Lista Principal',
        descricaoOrigem: 'Origem cadastrada manualmente',
        origemAtiva: true,
        ...(sobrescritas || {})
      };
    },
    dadosCriacao: {
      nomeOrigem: '  Formulario   Local  ',
      descricaoOrigem: '  Cadastro   presencial  '
    },
    dadosEdicao: {
      nomeOrigem: '  Lista   Atualizada  ',
      descricaoOrigem: '  Descricao   atualizada  '
    },
    dadosNomeVazio: {
      nomeOrigem: '   ',
      descricaoOrigem: null
    },
    verificarCriacao: function verificarCriacao(modelo, metodo, cliente) {
      expect(modelo[metodo]).toHaveBeenCalledWith({
        nomeOrigem: 'Formulario Local',
        descricaoOrigem: 'Cadastro presencial'
      }, cliente);
    },
    verificarEdicao: function verificarEdicao(modelo, metodo, cliente) {
      expect(modelo[metodo]).toHaveBeenCalledWith(1, {
        nomeOrigem: 'Lista Atualizada',
        descricaoOrigem: 'Descricao atualizada'
      }, cliente);
    }
  }
];

// Cria todas as funcoes esperadas pelo servico configurado.
function criarContexto(configuracao) {
  const modelo = {};
  const nomesMetodos = Object.values(configuracao.metodosModel);

  nomesMetodos.forEach(function criarMock(nomeMetodo) {
    modelo[nomeMetodo] = jest.fn();
  });
  modelo[configuracao.metodosModel.transacao].mockImplementation(
    async function executarTransacao(operacao) {
      return operacao({ transacao: configuracao.nome });
    }
  );

  return {
    modelo,
    service: configuracao.criarService(modelo),
    cliente: { transacao: configuracao.nome }
  };
}

describe.each(configuracoesCatalogos)(
  'service de $nome',
  function testarServiceCatalogo(configuracao) {
    test('faz a listagem padrao', async function executarTeste() {
      const contexto = criarContexto(configuracao);
      const filtros = { nome: 'cen' };
      contexto.modelo[configuracao.metodosModel.listarAtivos]
        .mockResolvedValue([configuracao.criarRegistro()]);

      const registros = await contexto.service[
        configuracao.metodosService.listarAtivos
      ](filtros);

      expect(registros).toHaveLength(1);
      expect(
        contexto.modelo[configuracao.metodosModel.listarAtivos]
      ).toHaveBeenCalledWith(filtros);
    });

    test('faz a listagem administrativa', async function executarTeste() {
      const contexto = criarContexto(configuracao);
      const filtros = { nome: 'cen', ativo: false };
      contexto.modelo[configuracao.metodosModel.listarTodos]
        .mockResolvedValue([configuracao.criarRegistro()]);

      const registros = await contexto.service[
        configuracao.metodosService.listarTodos
      ](filtros);

      expect(registros).toHaveLength(1);
      expect(
        contexto.modelo[configuracao.metodosModel.listarTodos]
      ).toHaveBeenCalledWith(filtros);
    });

    test('busca registro por id', async function executarTeste() {
      const contexto = criarContexto(configuracao);
      contexto.modelo[configuracao.metodosModel.buscarPorId]
        .mockResolvedValue(configuracao.criarRegistro());

      const registro = await contexto.service[
        configuracao.metodosService.buscarPorId
      ](1);

      expect(registro).toEqual(configuracao.criarRegistro());
    });

    test('cria com espacos normalizados', async function executarTeste() {
      const contexto = criarContexto(configuracao);
      contexto.modelo[configuracao.metodosModel.buscarPorNome]
        .mockResolvedValue(null);
      contexto.modelo[configuracao.metodosModel.criar]
        .mockResolvedValue(configuracao.criarRegistro());

      await contexto.service[configuracao.metodosService.criar](
        configuracao.dadosCriacao
      );

      configuracao.verificarCriacao(
        contexto.modelo,
        configuracao.metodosModel.criar,
        contexto.cliente
      );
    });

    test('impede nome duplicado inclusive inativo', async function executarTeste() {
      const contexto = criarContexto(configuracao);
      contexto.modelo[configuracao.metodosModel.buscarPorNome]
        .mockResolvedValue({ registroAtivo: false });

      await expect(
        contexto.service[configuracao.metodosService.criar](
          configuracao.dadosCriacao
        )
      ).rejects.toMatchObject({ statusHttp: 409 });
      expect(
        contexto.modelo[configuracao.metodosModel.criar]
      ).not.toHaveBeenCalled();
    });

    test('impede nome vazio', async function executarTeste() {
      const contexto = criarContexto(configuracao);

      await expect(
        contexto.service[configuracao.metodosService.criar](
          configuracao.dadosNomeVazio
        )
      ).rejects.toMatchObject({ statusHttp: 400 });
    });

    test('edita registro existente', async function executarTeste() {
      const contexto = criarContexto(configuracao);
      contexto.modelo[configuracao.metodosModel.buscarPorId]
        .mockResolvedValue(configuracao.criarRegistro());
      contexto.modelo[configuracao.metodosModel.buscarPorNome]
        .mockResolvedValue(null);
      contexto.modelo[configuracao.metodosModel.editar]
        .mockResolvedValue(configuracao.criarRegistro());

      await contexto.service[configuracao.metodosService.editar](
        1,
        configuracao.dadosEdicao
      );

      configuracao.verificarEdicao(
        contexto.modelo,
        configuracao.metodosModel.editar,
        contexto.cliente
      );
    });

    test('responde 404 para busca inexistente', async function executarTeste() {
      const contexto = criarContexto(configuracao);
      contexto.modelo[configuracao.metodosModel.buscarPorId]
        .mockResolvedValue(null);

      await expect(
        contexto.service[configuracao.metodosService.buscarPorId](999)
      ).rejects.toMatchObject({ statusHttp: 404 });
    });

    test('responde 404 para edicao inexistente', async function executarTeste() {
      const contexto = criarContexto(configuracao);
      contexto.modelo[configuracao.metodosModel.buscarPorId]
        .mockResolvedValue(null);

      await expect(
        contexto.service[configuracao.metodosService.editar](
          999,
          configuracao.dadosEdicao
        )
      ).rejects.toMatchObject({ statusHttp: 404 });
    });

    test('ativa e desativa sem exclusao fisica', async function executarTeste() {
      const contexto = criarContexto(configuracao);
      contexto.modelo[configuracao.metodosModel.buscarPorId]
        .mockResolvedValue(configuracao.criarRegistro());
      contexto.modelo[configuracao.metodosModel.alterarStatus]
        .mockResolvedValue(configuracao.criarRegistro());

      await contexto.service[configuracao.metodosService.alterarStatus](1, true);
      await contexto.service[configuracao.metodosService.alterarStatus](1, false);

      expect(
        contexto.modelo[configuracao.metodosModel.alterarStatus]
      ).toHaveBeenNthCalledWith(1, 1, true);
      expect(
        contexto.modelo[configuracao.metodosModel.alterarStatus]
      ).toHaveBeenNthCalledWith(2, 1, false);
    });

    test('propaga erro simulado do banco', async function executarTeste() {
      const contexto = criarContexto(configuracao);
      const erroBanco = new Error('detalhe interno do banco');
      contexto.modelo[configuracao.metodosModel.listarAtivos]
        .mockRejectedValue(erroBanco);

      await expect(
        contexto.service[configuracao.metodosService.listarAtivos]({})
      ).rejects.toBe(erroBanco);
    });
  }
);
