const AppError = require('../../erros/AppError');
const bairroModel = require('./bairroModel');

// Normaliza o nome mesmo quando o servico for chamado fora de uma rota HTTP.
function normalizarNome(nomeBairro) {
  if (typeof nomeBairro !== 'string') {
    throw new AppError('Nome do bairro e obrigatorio.', 400);
  }

  const nomeNormalizado = nomeBairro.trim().replace(/\s+/g, ' ');

  if (!nomeNormalizado) {
    throw new AppError('Nome do bairro e obrigatorio.', 400);
  }

  return nomeNormalizado;
}

// Cria o servico com model substituivel nos testes.
function criarBairroService(modelo) {
  // Converte violacao de unicidade em erro publico controlado.
  function transformarErroBanco(erro) {
    if (erro && erro.code === '23505') {
      return new AppError('Ja existe um bairro com este nome.', 409);
    }

    return erro;
  }

  // Garante unicidade por nome, inclusive para registros inativos.
  async function garantirNomeDisponivel(nomeBairro, idIgnorado, clienteBanco) {
    const duplicado = await modelo.buscarBairroPorNome(
      nomeBairro,
      idIgnorado,
      clienteBanco
    );

    if (duplicado) {
      throw new AppError('Ja existe um bairro com este nome.', 409);
    }
  }

  async function listarBairrosAtivos(filtros) {
    return modelo.listarBairrosAtivos(filtros);
  }

  async function listarTodosBairros(filtros) {
    return modelo.listarTodosBairros(filtros);
  }

  async function buscarBairroPorId(idBairro) {
    const bairro = await modelo.buscarBairroPorId(idBairro);

    if (!bairro) {
      throw new AppError('Bairro nao encontrado.', 404);
    }

    return bairro;
  }

  async function criarBairro(dadosBairro) {
    const nomeBairro = normalizarNome(dadosBairro.nomeBairro);

    return modelo.executarTransacaoBairro(
      async function criarDentroDaTransacao(clienteBanco) {
        await garantirNomeDisponivel(nomeBairro, null, clienteBanco);

        try {
          return await modelo.criarBairro(nomeBairro, clienteBanco);
        } catch (erro) {
          throw transformarErroBanco(erro);
        }
      }
    );
  }

  async function editarBairro(idBairro, dadosBairro) {
    const nomeBairro = normalizarNome(dadosBairro.nomeBairro);

    return modelo.executarTransacaoBairro(
      async function editarDentroDaTransacao(clienteBanco) {
        const bairroAtual = await modelo.buscarBairroPorId(
          idBairro,
          clienteBanco
        );

        if (!bairroAtual) {
          throw new AppError('Bairro nao encontrado.', 404);
        }

        await garantirNomeDisponivel(nomeBairro, idBairro, clienteBanco);

        try {
          return await modelo.editarBairro(
            idBairro,
            nomeBairro,
            clienteBanco
          );
        } catch (erro) {
          throw transformarErroBanco(erro);
        }
      }
    );
  }

  async function alterarStatusBairro(idBairro, bairroAtivo) {
    await buscarBairroPorId(idBairro);
    return modelo.alterarStatusBairro(idBairro, bairroAtivo);
  }

  return {
    listarBairrosAtivos,
    listarTodosBairros,
    buscarBairroPorId,
    criarBairro,
    editarBairro,
    alterarStatusBairro
  };
}

const bairroService = criarBairroService(bairroModel);

module.exports = bairroService;
module.exports.criarBairroService = criarBairroService;
