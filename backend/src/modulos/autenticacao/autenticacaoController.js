const autenticacaoService = require('./autenticacaoService');

// Autentica o usuario e devolve somente token e dados publicos da conta.
async function login(requisicao, resposta, proximo) {
  try {
    const resultado = await autenticacaoService.login(
      requisicao.dadosValidados.body
    );

    return resposta.status(200).json(resultado);
  } catch (erro) {
    proximo(erro);
  }
}

module.exports = {
  login
};
