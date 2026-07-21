const AppError = require('../../erros/AppError');
const origemModel = require('./origemModel');

function normalizarNome(nomeOrigem) {
  if (typeof nomeOrigem !== 'string') {
    throw new AppError('Nome da origem e obrigatorio.', 400);
  }

  const nomeNormalizado = nomeOrigem.trim().replace(/\s+/g, ' ');

  if (!nomeNormalizado) {
    throw new AppError('Nome da origem e obrigatorio.', 400);
  }

  return nomeNormalizado;
}

function normalizarDescricao(descricaoOrigem) {
  if (descricaoOrigem === undefined || descricaoOrigem === null) {
    return null;
  }

  if (typeof descricaoOrigem !== 'string') {
    throw new AppError('Descricao da origem invalida.', 400);
  }

  const descricaoNormalizada = descricaoOrigem.trim().replace(/\s+/g, ' ');

  if (!descricaoNormalizada) {
    throw new AppError('Descricao da origem nao pode ser vazia.', 400);
  }

  return descricaoNormalizada;
}

function criarOrigemService(modelo) {
  function transformarErroBanco(erro) {
    if (erro && erro.code === '23505') {
      return new AppError('Ja existe uma origem com este nome.', 409);
    }

    return erro;
  }

  async function garantirNomeDisponivel(nomeOrigem, idIgnorado, clienteBanco) {
    const duplicado = await modelo.buscarOrigemPorNome(
      nomeOrigem,
      idIgnorado,
      clienteBanco
    );

    if (duplicado) {
      throw new AppError('Ja existe uma origem com este nome.', 409);
    }
  }

  async function listarOrigensAtivas(filtros) {
    return modelo.listarOrigensAtivas(filtros);
  }

  async function listarTodasOrigens(filtros) {
    return modelo.listarTodasOrigens(filtros);
  }

  async function buscarOrigemPorId(idOrigem) {
    const origem = await modelo.buscarOrigemPorId(idOrigem);

    if (!origem) {
      throw new AppError('Origem nao encontrada.', 404);
    }

    return origem;
  }

  async function criarOrigem(dadosOrigem) {
    const origemNormalizada = {
      nomeOrigem: normalizarNome(dadosOrigem.nomeOrigem),
      descricaoOrigem: normalizarDescricao(dadosOrigem.descricaoOrigem)
    };

    return modelo.executarTransacaoOrigem(
      async function criarDentroDaTransacao(clienteBanco) {
        await garantirNomeDisponivel(
          origemNormalizada.nomeOrigem,
          null,
          clienteBanco
        );

        try {
          return await modelo.criarOrigem(origemNormalizada, clienteBanco);
        } catch (erro) {
          throw transformarErroBanco(erro);
        }
      }
    );
  }

  async function editarOrigem(idOrigem, dadosOrigem) {
    const origemNormalizada = {
      nomeOrigem: normalizarNome(dadosOrigem.nomeOrigem),
      descricaoOrigem: normalizarDescricao(dadosOrigem.descricaoOrigem)
    };

    return modelo.executarTransacaoOrigem(
      async function editarDentroDaTransacao(clienteBanco) {
        const origemAtual = await modelo.buscarOrigemPorId(
          idOrigem,
          clienteBanco
        );

        if (!origemAtual) {
          throw new AppError('Origem nao encontrada.', 404);
        }

        await garantirNomeDisponivel(
          origemNormalizada.nomeOrigem,
          idOrigem,
          clienteBanco
        );

        try {
          return await modelo.editarOrigem(
            idOrigem,
            origemNormalizada,
            clienteBanco
          );
        } catch (erro) {
          throw transformarErroBanco(erro);
        }
      }
    );
  }

  async function alterarStatusOrigem(idOrigem, origemAtiva) {
    await buscarOrigemPorId(idOrigem);
    return modelo.alterarStatusOrigem(idOrigem, origemAtiva);
  }

  return {
    listarOrigensAtivas,
    listarTodasOrigens,
    buscarOrigemPorId,
    criarOrigem,
    editarOrigem,
    alterarStatusOrigem
  };
}

const origemService = criarOrigemService(origemModel);

module.exports = origemService;
module.exports.criarOrigemService = criarOrigemService;
