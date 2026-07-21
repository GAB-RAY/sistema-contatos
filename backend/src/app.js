const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');

const ambiente = require('./configuracoes/ambiente');
const criarOpcoesCors = require('./configuracoes/cors');
const saudeRoutes = require('./modulos/saude/saudeRoutes');
const tratarRotaNaoEncontrada = require('./middlewares/tratarRotaNaoEncontrada');
const tratarErro = require('./middlewares/tratarErro');

// Permite sobrescrever limites somente ao montar instancias isoladas para testes.
function obterConfiguracao(opcoes) {
  return {
    origensCors: opcoes.origensCors || ambiente.origensCors,
    limiteJson: opcoes.limiteJson || ambiente.limiteJson,
    janelaRateLimitMs: opcoes.janelaRateLimitMs || ambiente.janelaRateLimitMs,
    maximoRequisicoes: opcoes.maximoRequisicoes || ambiente.maximoRequisicoes
  };
}

// Monta o aplicativo Express com as protecoes comuns da fundacao.
function criarApp(opcoes) {
  const configuracao = obterConfiguracao(opcoes || {});
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors(criarOpcoesCors(configuracao.origensCors)));
  app.use(rateLimit({
    windowMs: configuracao.janelaRateLimitMs,
    limit: configuracao.maximoRequisicoes,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: function responderLimiteExcedido(requisicao, resposta) {
      return resposta.status(429).json({
        erro: {
          mensagem: 'Muitas requisicoes. Tente novamente mais tarde.'
        }
      });
    }
  }));
  app.use(express.json({ limit: configuracao.limiteJson }));

  app.use(saudeRoutes);

  app.use(tratarRotaNaoEncontrada);
  app.use(tratarErro);

  return app;
}

module.exports = {
  criarApp
};
