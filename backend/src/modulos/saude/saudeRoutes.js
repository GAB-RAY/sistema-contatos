const express = require('express');
const saudeController = require('./saudeController');

const saudeRoutes = express.Router();

saudeRoutes.get('/saude', saudeController.consultarSaude);

module.exports = saudeRoutes;
