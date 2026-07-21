const AppError = require('../erros/AppError');

// Cria a regra de CORS a partir da lista explicita de origens oficiais.
function criarOpcoesCors(origensPermitidas) {
  const origens = new Set(origensPermitidas);

  return {
    origin: function validarOrigem(origem, callback) {
      if (!origem || origens.has(origem)) {
        callback(null, true);
        return;
      }

      callback(new AppError('Origem nao permitida pelo CORS.', 403));
    },
    optionsSuccessStatus: 204
  };
}

module.exports = criarOpcoesCors;
