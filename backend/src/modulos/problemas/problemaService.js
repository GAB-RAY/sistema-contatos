const AppError = require('../../erros/AppError');
const problemaModel = require('./problemaModel');

function normalizarNome(nomeProblema) {
  if (typeof nomeProblema !== 'string') {
    throw new AppError('Nome do problema e obrigatorio.', 400);
  }

  const nomeNormalizado = nomeProblema.trim().replace(/\s+/g, ' ');

  if (!nomeNormalizado) {
    throw new AppError('Nome do problema e obrigatorio.', 400);
  }

  return nomeNormalizado;
}

function criarProblemaService(modelo) {
  function transformarErroBanco(erro) {
    if (erro && erro.code === '23505') {
      return new AppError('Ja existe um problema com este nome.', 409);
    }

    return erro;
  }

  async function garantirNomeDisponivel(nomeProblema, idIgnorado, clienteBanco) {
    const duplicado = await modelo.buscarProblemaPorNome(
      nomeProblema,
      idIgnorado,
      clienteBanco
    );

    if (duplicado) {
      throw new AppError('Ja existe um problema com este nome.', 409);
    }
  }

  async function listarProblemasAtivos(filtros) {
    return modelo.listarProblemasAtivos(filtros);
  }

  async function listarTodosProblemas(filtros) {
    return modelo.listarTodosProblemas(filtros);
  }

  async function buscarProblemaPorId(idProblema) {
    const problema = await modelo.buscarProblemaPorId(idProblema);

    if (!problema) {
      throw new AppError('Problema nao encontrado.', 404);
    }

    return problema;
  }

  async function criarProblema(dadosProblema) {
    const nomeProblema = normalizarNome(dadosProblema.nomeProblema);

    return modelo.executarTransacaoProblema(
      async function criarDentroDaTransacao(clienteBanco) {
        await garantirNomeDisponivel(nomeProblema, null, clienteBanco);

        try {
          return await modelo.criarProblema(nomeProblema, clienteBanco);
        } catch (erro) {
          throw transformarErroBanco(erro);
        }
      }
    );
  }

  async function editarProblema(idProblema, dadosProblema) {
    const nomeProblema = normalizarNome(dadosProblema.nomeProblema);

    return modelo.executarTransacaoProblema(
      async function editarDentroDaTransacao(clienteBanco) {
        const problemaAtual = await modelo.buscarProblemaPorId(
          idProblema,
          clienteBanco
        );

        if (!problemaAtual) {
          throw new AppError('Problema nao encontrado.', 404);
        }

        await garantirNomeDisponivel(nomeProblema, idProblema, clienteBanco);

        try {
          return await modelo.editarProblema(
            idProblema,
            nomeProblema,
            clienteBanco
          );
        } catch (erro) {
          throw transformarErroBanco(erro);
        }
      }
    );
  }

  async function alterarStatusProblema(idProblema, problemaAtivo) {
    await buscarProblemaPorId(idProblema);
    return modelo.alterarStatusProblema(idProblema, problemaAtivo);
  }

  return {
    listarProblemasAtivos,
    listarTodosProblemas,
    buscarProblemaPorId,
    criarProblema,
    editarProblema,
    alterarStatusProblema
  };
}

const problemaService = criarProblemaService(problemaModel);

module.exports = problemaService;
module.exports.criarProblemaService = criarProblemaService;
