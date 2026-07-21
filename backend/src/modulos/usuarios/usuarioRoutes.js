const express = require('express');

const validarRequisicao = require('../../middlewares/validarRequisicao');
const verificarToken = require('../autenticacao/verificarToken');
const verificarPerfil = require('../autenticacao/verificarPerfil');
const usuarioController = require('./usuarioController');
const usuarioValidacao = require('./usuarioValidacao');

// Registra as rotas administrativas protegidas do modulo de usuarios.
function criarUsuarioRoutes() {
  const usuarioRoutes = express.Router();

  usuarioRoutes.use(verificarToken, verificarPerfil('administrador'));

  usuarioRoutes.get(
    '/',
    validarRequisicao(usuarioValidacao.listar),
    usuarioController.listarUsuarios
  );
  usuarioRoutes.get(
    '/:id',
    validarRequisicao(usuarioValidacao.buscarPorId),
    usuarioController.buscarUsuarioPorId
  );
  usuarioRoutes.post(
    '/',
    validarRequisicao(usuarioValidacao.criar),
    usuarioController.criarUsuario
  );
  usuarioRoutes.put(
    '/:id',
    validarRequisicao(usuarioValidacao.editar),
    usuarioController.editarUsuario
  );
  usuarioRoutes.patch(
    '/:id/ativar',
    validarRequisicao(usuarioValidacao.alterarStatus),
    usuarioController.ativarUsuario
  );
  usuarioRoutes.patch(
    '/:id/desativar',
    validarRequisicao(usuarioValidacao.alterarStatus),
    usuarioController.desativarUsuario
  );
  usuarioRoutes.patch(
    '/:id/senha',
    validarRequisicao(usuarioValidacao.trocarSenha),
    usuarioController.trocarSenhaUsuario
  );

  return usuarioRoutes;
}

module.exports = criarUsuarioRoutes;
