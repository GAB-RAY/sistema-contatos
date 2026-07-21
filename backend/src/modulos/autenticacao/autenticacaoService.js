const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ambiente = require('../../configuracoes/ambiente');
const AppError = require('../../erros/AppError');
const autenticacaoModel = require('./autenticacaoModel');

// Cria o servico com dependencias substituiveis nos testes unitarios.
function criarAutenticacaoService(dependencias) {
  const modelo = dependencias.modelo;
  const bibliotecaBcrypt = dependencias.bcrypt;
  const bibliotecaJwt = dependencias.jwt;
  const jwtSecret = dependencias.jwtSecret;
  const jwtExpiresIn = dependencias.jwtExpiresIn;

  // Valida credenciais sem diferenciar e-mail inexistente, senha errada ou conta inativa.
  async function login(dadosLogin) {
    const usuario = await modelo.buscarUsuarioPorEmail(dadosLogin.email);

    if (!usuario || !usuario.usuarioAtivo) {
      throw new AppError('E-mail ou senha invalidos.', 401);
    }

    const senhaCorreta = await bibliotecaBcrypt.compare(
      dadosLogin.senha,
      usuario.senhaHash
    );

    if (!senhaCorreta) {
      throw new AppError('E-mail ou senha invalidos.', 401);
    }

    if (!jwtSecret) {
      throw new AppError('Servico de autenticacao indisponivel.', 503);
    }

    const token = bibliotecaJwt.sign(
      {
        idUsuario: usuario.idUsuario,
        perfilAcesso: usuario.perfilAcesso
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    return {
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: {
        idUsuario: usuario.idUsuario,
        nomeCompleto: usuario.nomeCompleto,
        email: usuario.email,
        perfilAcesso: usuario.perfilAcesso
      }
    };
  }

  return {
    login
  };
}

const autenticacaoService = criarAutenticacaoService({
  modelo: autenticacaoModel,
  bcrypt,
  jwt,
  jwtSecret: ambiente.autenticacao.jwtSecret,
  jwtExpiresIn: ambiente.autenticacao.jwtExpiresIn
});

module.exports = autenticacaoService;
module.exports.criarAutenticacaoService = criarAutenticacaoService;
