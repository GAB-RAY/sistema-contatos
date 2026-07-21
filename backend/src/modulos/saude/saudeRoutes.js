const express = require('express');
const { criarSaudeController } = require('./saudeController');

// Monta a rota de saude com as dependencias definidas pela aplicacao.
function criarSaudeRoutes(dependencias) {
  const saudeRoutes = express.Router();
  const saudeController = criarSaudeController(dependencias);

  saudeRoutes.get('/saude', saudeController.consultarSaude);

  return saudeRoutes;
}

module.exports = criarSaudeRoutes;
