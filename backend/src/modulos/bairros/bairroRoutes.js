const express = require('express');

const validarRequisicao = require('../../middlewares/validarRequisicao');
const verificarToken = require('../autenticacao/verificarToken');
const verificarPerfil = require('../autenticacao/verificarPerfil');
const bairroController = require('./bairroController');
const bairroValidacao = require('./bairroValidacao');

function criarBairroRoutes() {
  const bairroRoutes = express.Router();
  const permitirConsulta = verificarPerfil('administrador', 'operador');
  const permitirAdministracao = verificarPerfil('administrador');

  bairroRoutes.use(verificarToken);
  bairroRoutes.get(
    '/',
    permitirConsulta,
    validarRequisicao(bairroValidacao.listarAtivos),
    bairroController.listarBairrosAtivos
  );
  bairroRoutes.get(
    '/todos',
    permitirAdministracao,
    validarRequisicao(bairroValidacao.listarTodos),
    bairroController.listarTodosBairros
  );
  bairroRoutes.get(
    '/:id',
    permitirConsulta,
    validarRequisicao(bairroValidacao.buscarPorId),
    bairroController.buscarBairroPorId
  );
  bairroRoutes.post(
    '/',
    permitirAdministracao,
    validarRequisicao(bairroValidacao.criar),
    bairroController.criarBairro
  );
  bairroRoutes.put(
    '/:id',
    permitirAdministracao,
    validarRequisicao(bairroValidacao.editar),
    bairroController.editarBairro
  );
  bairroRoutes.patch(
    '/:id/ativar',
    permitirAdministracao,
    validarRequisicao(bairroValidacao.alterarStatus),
    bairroController.ativarBairro
  );
  bairroRoutes.patch(
    '/:id/desativar',
    permitirAdministracao,
    validarRequisicao(bairroValidacao.alterarStatus),
    bairroController.desativarBairro
  );

  return bairroRoutes;
}

module.exports = criarBairroRoutes;
