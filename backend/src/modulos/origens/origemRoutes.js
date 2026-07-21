const express = require('express');

const validarRequisicao = require('../../middlewares/validarRequisicao');
const verificarToken = require('../autenticacao/verificarToken');
const verificarPerfil = require('../autenticacao/verificarPerfil');
const origemController = require('./origemController');
const origemValidacao = require('./origemValidacao');

function criarOrigemRoutes() {
  const origemRoutes = express.Router();
  const permitirConsulta = verificarPerfil('administrador', 'operador');
  const permitirAdministracao = verificarPerfil('administrador');

  origemRoutes.use(verificarToken);
  origemRoutes.get(
    '/',
    permitirConsulta,
    validarRequisicao(origemValidacao.listarAtivas),
    origemController.listarOrigensAtivas
  );
  origemRoutes.get(
    '/todos',
    permitirAdministracao,
    validarRequisicao(origemValidacao.listarTodas),
    origemController.listarTodasOrigens
  );
  origemRoutes.get(
    '/:id',
    permitirConsulta,
    validarRequisicao(origemValidacao.buscarPorId),
    origemController.buscarOrigemPorId
  );
  origemRoutes.post(
    '/',
    permitirAdministracao,
    validarRequisicao(origemValidacao.criar),
    origemController.criarOrigem
  );
  origemRoutes.put(
    '/:id',
    permitirAdministracao,
    validarRequisicao(origemValidacao.editar),
    origemController.editarOrigem
  );
  origemRoutes.patch(
    '/:id/ativar',
    permitirAdministracao,
    validarRequisicao(origemValidacao.alterarStatus),
    origemController.ativarOrigem
  );
  origemRoutes.patch(
    '/:id/desativar',
    permitirAdministracao,
    validarRequisicao(origemValidacao.alterarStatus),
    origemController.desativarOrigem
  );

  return origemRoutes;
}

module.exports = criarOrigemRoutes;
