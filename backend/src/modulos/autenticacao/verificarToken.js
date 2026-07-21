const jwt = require('jsonwebtoken');

const ambiente = require('../../configuracoes/ambiente');
const AppError = require('../../erros/AppError');

// Cria o middleware com a biblioteca JWT e o segredo definidos pela aplicacao.
function criarVerificarToken(dependencias) {
  return function verificarToken(requisicao, resposta, proximo) {
    const autorizacao = requisicao.headers.authorization;

    if (!autorizacao) {
      proximo(new AppError('Token de autenticacao nao informado.', 401));
      return;
    }

    const partes = autorizacao.trim().split(/\s+/);

    if (
      partes.length !== 2 ||
      partes[0].toLowerCase() !== 'bearer' ||
      !partes[1]
    ) {
      proximo(new AppError('Token de autenticacao invalido.', 401));
      return;
    }

    if (!dependencias.jwtSecret) {
      proximo(new AppError('Servico de autenticacao indisponivel.', 503));
      return;
    }

    try {
      const conteudoToken = dependencias.jwt.verify(
        partes[1],
        dependencias.jwtSecret
      );

      if (
        !conteudoToken ||
        typeof conteudoToken !== 'object' ||
        !Number.isInteger(conteudoToken.idUsuario) ||
        !['administrador', 'operador'].includes(conteudoToken.perfilAcesso)
      ) {
        throw new Error('Conteudo de token invalido.');
      }

      requisicao.usuario = {
        idUsuario: conteudoToken.idUsuario,
        perfilAcesso: conteudoToken.perfilAcesso
      };
      proximo();
    } catch (erro) {
      proximo(new AppError('Token de autenticacao invalido.', 401));
    }
  };
}

const verificarToken = criarVerificarToken({
  jwt,
  jwtSecret: ambiente.autenticacao.jwtSecret
});

module.exports = verificarToken;
module.exports.criarVerificarToken = criarVerificarToken;
