const problemaService = require('./problemaService');

async function listarProblemasAtivos(requisicao, resposta, proximo) {
  try {
    const problemas = await problemaService.listarProblemasAtivos(
      requisicao.dadosValidados.query
    );
    return resposta.status(200).json({ problemas });
  } catch (erro) {
    proximo(erro);
  }
}

async function listarTodosProblemas(requisicao, resposta, proximo) {
  try {
    const problemas = await problemaService.listarTodosProblemas(
      requisicao.dadosValidados.query
    );
    return resposta.status(200).json({ problemas });
  } catch (erro) {
    proximo(erro);
  }
}

async function buscarProblemaPorId(requisicao, resposta, proximo) {
  try {
    const problema = await problemaService.buscarProblemaPorId(
      requisicao.dadosValidados.params.id
    );
    return resposta.status(200).json({ problema });
  } catch (erro) {
    proximo(erro);
  }
}

async function criarProblema(requisicao, resposta, proximo) {
  try {
    const problema = await problemaService.criarProblema(
      requisicao.dadosValidados.body
    );
    return resposta.status(201).json({
      mensagem: 'Problema criado com sucesso.',
      problema
    });
  } catch (erro) {
    proximo(erro);
  }
}

async function editarProblema(requisicao, resposta, proximo) {
  try {
    const problema = await problemaService.editarProblema(
      requisicao.dadosValidados.params.id,
      requisicao.dadosValidados.body
    );
    return resposta.status(200).json({
      mensagem: 'Problema atualizado com sucesso.',
      problema
    });
  } catch (erro) {
    proximo(erro);
  }
}

async function ativarProblema(requisicao, resposta, proximo) {
  try {
    const problema = await problemaService.alterarStatusProblema(
      requisicao.dadosValidados.params.id,
      true
    );
    return resposta.status(200).json({
      mensagem: 'Problema ativado com sucesso.',
      problema
    });
  } catch (erro) {
    proximo(erro);
  }
}

async function desativarProblema(requisicao, resposta, proximo) {
  try {
    const problema = await problemaService.alterarStatusProblema(
      requisicao.dadosValidados.params.id,
      false
    );
    return resposta.status(200).json({
      mensagem: 'Problema desativado com sucesso.',
      problema
    });
  } catch (erro) {
    proximo(erro);
  }
}

module.exports = {
  listarProblemasAtivos,
  listarTodosProblemas,
  buscarProblemaPorId,
  criarProblema,
  editarProblema,
  ativarProblema,
  desativarProblema
};
