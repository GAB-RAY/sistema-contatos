const { ZodError } = require('zod');

const AppError = require('../erros/AppError');

// Valida as partes declaradas da requisicao e disponibiliza somente os dados aceitos.
function validarRequisicao(esquemas) {
  return function executarValidacao(requisicao, resposta, proximo) {
    try {
      const dadosValidados = {};

      if (esquemas.body) {
        dadosValidados.body = esquemas.body.parse(requisicao.body);
      }

      if (esquemas.params) {
        dadosValidados.params = esquemas.params.parse(requisicao.params);
      }

      if (esquemas.query) {
        dadosValidados.query = esquemas.query.parse(requisicao.query);
      }

      requisicao.dadosValidados = dadosValidados;
      proximo();
    } catch (erro) {
      if (erro instanceof ZodError) {
        proximo(new AppError('Dados da requisicao invalidos.', 400));
        return;
      }

      proximo(erro);
    }
  };
}

module.exports = validarRequisicao;
