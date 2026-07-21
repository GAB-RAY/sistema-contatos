const origemService = require('./origemService');

async function listarOrigensAtivas(requisicao, resposta, proximo) {
  try {
    const origens = await origemService.listarOrigensAtivas(
      requisicao.dadosValidados.query
    );
    return resposta.status(200).json({ origens });
  } catch (erro) {
    proximo(erro);
  }
}

async function listarTodasOrigens(requisicao, resposta, proximo) {
  try {
    const origens = await origemService.listarTodasOrigens(
      requisicao.dadosValidados.query
    );
    return resposta.status(200).json({ origens });
  } catch (erro) {
    proximo(erro);
  }
}

async function buscarOrigemPorId(requisicao, resposta, proximo) {
  try {
    const origem = await origemService.buscarOrigemPorId(
      requisicao.dadosValidados.params.id
    );
    return resposta.status(200).json({ origem });
  } catch (erro) {
    proximo(erro);
  }
}

async function criarOrigem(requisicao, resposta, proximo) {
  try {
    const origem = await origemService.criarOrigem(
      requisicao.dadosValidados.body
    );
    return resposta.status(201).json({
      mensagem: 'Origem criada com sucesso.',
      origem
    });
  } catch (erro) {
    proximo(erro);
  }
}

async function editarOrigem(requisicao, resposta, proximo) {
  try {
    const origem = await origemService.editarOrigem(
      requisicao.dadosValidados.params.id,
      requisicao.dadosValidados.body
    );
    return resposta.status(200).json({
      mensagem: 'Origem atualizada com sucesso.',
      origem
    });
  } catch (erro) {
    proximo(erro);
  }
}

async function ativarOrigem(requisicao, resposta, proximo) {
  try {
    const origem = await origemService.alterarStatusOrigem(
      requisicao.dadosValidados.params.id,
      true
    );
    return resposta.status(200).json({
      mensagem: 'Origem ativada com sucesso.',
      origem
    });
  } catch (erro) {
    proximo(erro);
  }
}

async function desativarOrigem(requisicao, resposta, proximo) {
  try {
    const origem = await origemService.alterarStatusOrigem(
      requisicao.dadosValidados.params.id,
      false
    );
    return resposta.status(200).json({
      mensagem: 'Origem desativada com sucesso.',
      origem
    });
  } catch (erro) {
    proximo(erro);
  }
}

module.exports = {
  listarOrigensAtivas,
  listarTodasOrigens,
  buscarOrigemPorId,
  criarOrigem,
  editarOrigem,
  ativarOrigem,
  desativarOrigem
};
