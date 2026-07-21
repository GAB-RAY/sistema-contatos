const bairroService = require('./bairroService');

async function listarBairrosAtivos(requisicao, resposta, proximo) {
  try {
    const bairros = await bairroService.listarBairrosAtivos(
      requisicao.dadosValidados.query
    );
    return resposta.status(200).json({ bairros });
  } catch (erro) {
    proximo(erro);
  }
}

async function listarTodosBairros(requisicao, resposta, proximo) {
  try {
    const bairros = await bairroService.listarTodosBairros(
      requisicao.dadosValidados.query
    );
    return resposta.status(200).json({ bairros });
  } catch (erro) {
    proximo(erro);
  }
}

async function buscarBairroPorId(requisicao, resposta, proximo) {
  try {
    const bairro = await bairroService.buscarBairroPorId(
      requisicao.dadosValidados.params.id
    );
    return resposta.status(200).json({ bairro });
  } catch (erro) {
    proximo(erro);
  }
}

async function criarBairro(requisicao, resposta, proximo) {
  try {
    const bairro = await bairroService.criarBairro(
      requisicao.dadosValidados.body
    );
    return resposta.status(201).json({
      mensagem: 'Bairro criado com sucesso.',
      bairro
    });
  } catch (erro) {
    proximo(erro);
  }
}

async function editarBairro(requisicao, resposta, proximo) {
  try {
    const bairro = await bairroService.editarBairro(
      requisicao.dadosValidados.params.id,
      requisicao.dadosValidados.body
    );
    return resposta.status(200).json({
      mensagem: 'Bairro atualizado com sucesso.',
      bairro
    });
  } catch (erro) {
    proximo(erro);
  }
}

async function ativarBairro(requisicao, resposta, proximo) {
  try {
    const bairro = await bairroService.alterarStatusBairro(
      requisicao.dadosValidados.params.id,
      true
    );
    return resposta.status(200).json({
      mensagem: 'Bairro ativado com sucesso.',
      bairro
    });
  } catch (erro) {
    proximo(erro);
  }
}

async function desativarBairro(requisicao, resposta, proximo) {
  try {
    const bairro = await bairroService.alterarStatusBairro(
      requisicao.dadosValidados.params.id,
      false
    );
    return resposta.status(200).json({
      mensagem: 'Bairro desativado com sucesso.',
      bairro
    });
  } catch (erro) {
    proximo(erro);
  }
}

module.exports = {
  listarBairrosAtivos,
  listarTodosBairros,
  buscarBairroPorId,
  criarBairro,
  editarBairro,
  ativarBairro,
  desativarBairro
};
