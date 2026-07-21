const bcrypt = require('bcrypt');

const ambiente = require('../../configuracoes/ambiente');
const AppError = require('../../erros/AppError');
const usuarioModel = require('./usuarioModel');

// Cria o servico com modelo e bcrypt substituiveis nos testes.
function criarUsuarioService(dependencias) {
  const modelo = dependencias.modelo;
  const bibliotecaBcrypt = dependencias.bcrypt;
  const custoBcrypt = dependencias.custoBcrypt;

  // Converte a violacao de unicidade do PostgreSQL em erro publico controlado.
  function transformarErroBanco(erro) {
    if (erro && erro.code === '23505') {
      return new AppError('Ja existe um usuario com este e-mail.', 409);
    }

    return erro;
  }

  // Interrompe a operacao quando o e-mail ja pertence a outra conta.
  async function garantirEmailDisponivel(email, idUsuarioIgnorado, clienteBanco) {
    const usuarioDuplicado = await modelo.buscarUsuarioPorEmail(
      email,
      idUsuarioIgnorado,
      clienteBanco
    );

    if (usuarioDuplicado) {
      throw new AppError('Ja existe um usuario com este e-mail.', 409);
    }
  }

  // Gera o hash com o custo configurado sem armazenar a senha em texto puro.
  async function gerarHashSenha(senha) {
    return bibliotecaBcrypt.hash(senha, custoBcrypt);
  }

  // Cria o administrador inicial somente enquanto a tabela de usuarios estiver vazia.
  async function criarPrimeiroAdministrador(dadosAdministrador) {
    const senhaHash = await gerarHashSenha(dadosAdministrador.senha);

    return modelo.executarTransacaoAdministrativa(
      async function criarDentroDaTransacao(clienteBanco) {
        const quantidadeUsuarios = await modelo.contarUsuarios(clienteBanco);

        if (quantidadeUsuarios > 0) {
          throw new AppError(
            'O administrador inicial ja foi criado.',
            409
          );
        }

        try {
          return await modelo.criarUsuario(
            {
              nomeCompleto: dadosAdministrador.nomeCompleto,
              email: dadosAdministrador.email,
              senhaHash,
              perfilAcesso: 'administrador'
            },
            clienteBanco
          );
        } catch (erro) {
          throw transformarErroBanco(erro);
        }
      }
    );
  }

  // Lista todos os usuarios sem consultar ou devolver senha_hash.
  async function listarUsuarios() {
    return modelo.listarUsuarios();
  }

  // Busca a conta solicitada ou informa que ela nao existe.
  async function buscarUsuarioPorId(idUsuario) {
    const usuario = await modelo.buscarUsuarioPorId(idUsuario);

    if (!usuario) {
      throw new AppError('Usuario nao encontrado.', 404);
    }

    return usuario;
  }

  // Cria uma conta depois de validar unicidade e gerar o hash da senha.
  async function criarUsuario(dadosUsuario) {
    await garantirEmailDisponivel(dadosUsuario.email, null);
    const senhaHash = await gerarHashSenha(dadosUsuario.senha);

    try {
      return await modelo.criarUsuario({
        nomeCompleto: dadosUsuario.nomeCompleto,
        email: dadosUsuario.email,
        senhaHash,
        perfilAcesso: dadosUsuario.perfilAcesso
      });
    } catch (erro) {
      throw transformarErroBanco(erro);
    }
  }

  // Edita dados publicos e protege o ultimo administrador ativo contra rebaixamento.
  async function editarUsuario(idUsuario, dadosUsuario) {
    return modelo.executarTransacaoAdministrativa(
      async function editarDentroDaTransacao(clienteBanco) {
        const usuarioAtual = await modelo.buscarUsuarioPorId(
          idUsuario,
          clienteBanco
        );

        if (!usuarioAtual) {
          throw new AppError('Usuario nao encontrado.', 404);
        }

        await garantirEmailDisponivel(
          dadosUsuario.email,
          idUsuario,
          clienteBanco
        );

        if (
          usuarioAtual.usuarioAtivo &&
          usuarioAtual.perfilAcesso === 'administrador' &&
          dadosUsuario.perfilAcesso !== 'administrador'
        ) {
          const quantidadeAdministradores =
            await modelo.contarAdministradoresAtivos(clienteBanco);

          if (quantidadeAdministradores <= 1) {
            throw new AppError(
              'O ultimo administrador ativo nao pode perder esse perfil.',
              409
            );
          }
        }

        try {
          return await modelo.editarUsuario(
            idUsuario,
            dadosUsuario,
            clienteBanco
          );
        } catch (erro) {
          throw transformarErroBanco(erro);
        }
      }
    );
  }

  // Ativa uma conta existente.
  async function ativarUsuario(idUsuario) {
    await buscarUsuarioPorId(idUsuario);
    return modelo.alterarStatusUsuario(idUsuario, true);
  }

  // Desativa uma conta sem permitir a perda do ultimo administrador ativo.
  async function desativarUsuario(idUsuario, idUsuarioSolicitante) {
    return modelo.executarTransacaoAdministrativa(
      async function desativarDentroDaTransacao(clienteBanco) {
        const usuarioAtual = await modelo.buscarUsuarioPorId(
          idUsuario,
          clienteBanco
        );

        if (!usuarioAtual) {
          throw new AppError('Usuario nao encontrado.', 404);
        }

        if (
          usuarioAtual.usuarioAtivo &&
          usuarioAtual.perfilAcesso === 'administrador'
        ) {
          const quantidadeAdministradores =
            await modelo.contarAdministradoresAtivos(clienteBanco);

          if (quantidadeAdministradores <= 1) {
            const mensagem = idUsuario === idUsuarioSolicitante
              ? 'Voce nao pode desativar sua conta sendo o ultimo administrador ativo.'
              : 'O ultimo administrador ativo nao pode ser desativado.';
            throw new AppError(mensagem, 409);
          }
        }

        return modelo.alterarStatusUsuario(
          idUsuario,
          false,
          clienteBanco
        );
      }
    );
  }

  // Troca a senha de uma conta existente usando um novo hash bcrypt.
  async function trocarSenhaUsuario(idUsuario, senhaNova) {
    await buscarUsuarioPorId(idUsuario);
    const senhaHash = await gerarHashSenha(senhaNova);
    const senhaAlterada = await modelo.trocarSenhaUsuario(
      idUsuario,
      senhaHash
    );

    if (!senhaAlterada) {
      throw new AppError('Usuario nao encontrado.', 404);
    }
  }

  return {
    criarPrimeiroAdministrador,
    listarUsuarios,
    buscarUsuarioPorId,
    criarUsuario,
    editarUsuario,
    ativarUsuario,
    desativarUsuario,
    trocarSenhaUsuario
  };
}

const usuarioService = criarUsuarioService({
  modelo: usuarioModel,
  bcrypt,
  custoBcrypt: ambiente.autenticacao.bcryptCusto
});

module.exports = usuarioService;
module.exports.criarUsuarioService = criarUsuarioService;
