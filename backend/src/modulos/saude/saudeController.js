// Confirma que o processo HTTP esta disponivel sem consultar servicos externos.
function consultarSaude(requisicao, resposta) {
  return resposta.status(200).json({
    status: 'ok'
  });
}

module.exports = {
  consultarSaude
};
