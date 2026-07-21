const AppError = require('../erros/AppError');

// Traduz erros do parser JSON em respostas publicas sem detalhes internos.
function obterErroDeCorpo(erro) {
  if (erro && erro.type === 'entity.too.large') {
    return new AppError('Corpo da requisicao excede o limite permitido.', 413);
  }

  if (erro && erro.type === 'entity.parse.failed') {
    return new AppError('Corpo JSON invalido.', 400);
  }

  return null;
}

// Centraliza a resposta de erros operacionais e protege detalhes de falhas internas.
function tratarErro(erro, requisicao, resposta, proximo) {
  const erroDeCorpo = obterErroDeCorpo(erro);
  const erroPublico = erroDeCorpo || (erro instanceof AppError ? erro : null);

  if (erroPublico) {
    return resposta.status(erroPublico.statusHttp).json({
      erro: {
        mensagem: erroPublico.message
      }
    });
  }

  return resposta.status(500).json({
    erro: {
      mensagem: 'Erro interno do servidor.'
    }
  });
}

module.exports = tratarErro;
