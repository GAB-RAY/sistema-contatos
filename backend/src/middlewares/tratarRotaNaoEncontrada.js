const AppError = require('../erros/AppError');

// Encaminha rotas desconhecidas para o tratamento centralizado de erros.
function tratarRotaNaoEncontrada(requisicao, resposta, proximo) {
  proximo(new AppError('Rota nao encontrada.', 404));
}

module.exports = tratarRotaNaoEncontrada;
