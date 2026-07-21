const usuarioService = require('./usuarioService');

// Lista usuarios sem incluir o hash de senha.
async function listarUsuarios(requisicao, resposta, proximo) {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    return resposta.status(200).json({ usuarios });
  } catch (erro) {
    proximo(erro);
  }
}

// Busca um usuario pelo id validado.
async function buscarUsuarioPorId(requisicao, resposta, proximo) {
  try {
    const usuario = await usuarioService.buscarUsuarioPorId(
      requisicao.dadosValidados.params.id
    );
    return resposta.status(200).json({ usuario });
  } catch (erro) {
    proximo(erro);
  }
}

// Cria uma conta administrativa ou operacional.
async function criarUsuario(requisicao, resposta, proximo) {
  try {
    const usuario = await usuarioService.criarUsuario(
      requisicao.dadosValidados.body
    );
    return resposta.status(201).json({
      mensagem: 'Usuario criado com sucesso.',
      usuario
    });
  } catch (erro) {
    proximo(erro);
  }
}

// Edita nome, e-mail e perfil do usuario.
async function editarUsuario(requisicao, resposta, proximo) {
  try {
    const usuario = await usuarioService.editarUsuario(
      requisicao.dadosValidados.params.id,
      requisicao.dadosValidados.body
    );
    return resposta.status(200).json({
      mensagem: 'Usuario atualizado com sucesso.',
      usuario
    });
  } catch (erro) {
    proximo(erro);
  }
}

// Ativa a conta solicitada.
async function ativarUsuario(requisicao, resposta, proximo) {
  try {
    const usuario = await usuarioService.ativarUsuario(
      requisicao.dadosValidados.params.id
    );
    return resposta.status(200).json({
      mensagem: 'Usuario ativado com sucesso.',
      usuario
    });
  } catch (erro) {
    proximo(erro);
  }
}

// Desativa a conta solicitada respeitando a protecao administrativa.
async function desativarUsuario(requisicao, resposta, proximo) {
  try {
    const usuario = await usuarioService.desativarUsuario(
      requisicao.dadosValidados.params.id,
      requisicao.usuario.idUsuario
    );
    return resposta.status(200).json({
      mensagem: 'Usuario desativado com sucesso.',
      usuario
    });
  } catch (erro) {
    proximo(erro);
  }
}

// Troca a senha sem devolver o novo hash.
async function trocarSenhaUsuario(requisicao, resposta, proximo) {
  try {
    await usuarioService.trocarSenhaUsuario(
      requisicao.dadosValidados.params.id,
      requisicao.dadosValidados.body.senhaNova
    );
    return resposta.status(200).json({
      mensagem: 'Senha alterada com sucesso.'
    });
  } catch (erro) {
    proximo(erro);
  }
}

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  editarUsuario,
  ativarUsuario,
  desativarUsuario,
  trocarSenhaUsuario
};
