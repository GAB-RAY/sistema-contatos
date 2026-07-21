const express = require('express');
const { rateLimit } = require('express-rate-limit');

const ambiente = require('../../configuracoes/ambiente');
const validarRequisicao = require('../../middlewares/validarRequisicao');
const autenticacaoController = require('./autenticacaoController');
const autenticacaoValidacao = require('./autenticacaoValidacao');

// Cria o limitador exclusivo do login para reduzir tentativas automatizadas.
function criarLimitadorLogin(opcoes) {
  return rateLimit({
    windowMs: opcoes.janelaMs,
    limit: opcoes.maximo,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: function responderLimiteLogin(requisicao, resposta) {
      return resposta.status(429).json({
        erro: {
          mensagem: 'Muitas tentativas de login. Tente novamente mais tarde.'
        }
      });
    }
  });
}

// Registra somente as rotas publicas permanentes de autenticacao.
function criarAutenticacaoRoutes(opcoes) {
  const configuracao = opcoes || {};
  const autenticacaoRoutes = express.Router();
  const limitadorLogin = criarLimitadorLogin({
    janelaMs: configuracao.loginJanelaMs || ambiente.autenticacao.loginJanelaMs,
    maximo: configuracao.loginMaximo || ambiente.autenticacao.loginMaximo
  });

  autenticacaoRoutes.post(
    '/login',
    limitadorLogin,
    validarRequisicao(autenticacaoValidacao.login),
    autenticacaoController.login
  );

  return autenticacaoRoutes;
}

module.exports = criarAutenticacaoRoutes;
