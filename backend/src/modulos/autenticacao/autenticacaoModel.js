const { obterPoolBanco } = require('../../configuracoes/banco');

// Converte a linha do PostgreSQL para nomes usados pelo dominio de autenticacao.
function mapearUsuarioAutenticacao(linha) {
  if (!linha) {
    return null;
  }

  return {
    idUsuario: linha.id_usuario,
    nomeCompleto: linha.nome_completo,
    email: linha.email,
    senhaHash: linha.senha_hash,
    perfilAcesso: linha.perfil_acesso,
    usuarioAtivo: linha.usuario_ativo
  };
}

// Busca os dados estritamente necessarios para validar o login por e-mail.
async function buscarUsuarioPorEmail(email, clienteBanco) {
  const cliente = clienteBanco || obterPoolBanco();
  const resultado = await cliente.query(
    `SELECT id_usuario, nome_completo, email, senha_hash,
            perfil_acesso, usuario_ativo
       FROM usuarios
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1`,
    [email]
  );

  return mapearUsuarioAutenticacao(resultado.rows[0]);
}

module.exports = {
  buscarUsuarioPorEmail
};
