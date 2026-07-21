const express = require('express');

const validarRequisicao = require('../../middlewares/validarRequisicao');
const verificarToken = require('../autenticacao/verificarToken');
const verificarPerfil = require('../autenticacao/verificarPerfil');
const problemaController = require('./problemaController');
const problemaValidacao = require('./problemaValidacao');

function criarProblemaRoutes() {
  const problemaRoutes = express.Router();
  const permitirConsulta = verificarPerfil('administrador', 'operador');
  const permitirAdministracao = verificarPerfil('administrador');

  problemaRoutes.use(verificarToken);
  problemaRoutes.get(
    '/',
    permitirConsulta,
    validarRequisicao(problemaValidacao.listarAtivos),
    problemaController.listarProblemasAtivos
  );
  problemaRoutes.get(
    '/todos',
    permitirAdministracao,
    validarRequisicao(problemaValidacao.listarTodos),
    problemaController.listarTodosProblemas
  );
  problemaRoutes.get(
    '/:id',
    permitirConsulta,
    validarRequisicao(problemaValidacao.buscarPorId),
    problemaController.buscarProblemaPorId
  );
  problemaRoutes.post(
    '/',
    permitirAdministracao,
    validarRequisicao(problemaValidacao.criar),
    problemaController.criarProblema
  );
  problemaRoutes.put(
    '/:id',
    permitirAdministracao,
    validarRequisicao(problemaValidacao.editar),
    problemaController.editarProblema
  );
  problemaRoutes.patch(
    '/:id/ativar',
    permitirAdministracao,
    validarRequisicao(problemaValidacao.alterarStatus),
    problemaController.ativarProblema
  );
  problemaRoutes.patch(
    '/:id/desativar',
    permitirAdministracao,
    validarRequisicao(problemaValidacao.alterarStatus),
    problemaController.desativarProblema
  );

  return problemaRoutes;
}

module.exports = criarProblemaRoutes;
