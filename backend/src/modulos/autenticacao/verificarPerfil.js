const AppError = require('../../erros/AppError');

// Cria um middleware que permite somente os perfis informados pela rota.
function verificarPerfil() {
  const perfisAutorizados = Array.from(arguments);

  return function verificarPermissao(requisicao, resposta, proximo) {
    if (!requisicao.usuario) {
      proximo(new AppError('Autenticacao necessaria.', 401));
      return;
    }

    if (!perfisAutorizados.includes(requisicao.usuario.perfilAcesso)) {
      proximo(new AppError('Acesso negado para este perfil.', 403));
      return;
    }

    proximo();
  };
}

module.exports = verificarPerfil;
