const { ZodError } = require('zod');

const { encerrarPoolBanco } = require('../../configuracoes/banco');
const AppError = require('../../erros/AppError');
const usuarioService = require('./usuarioService');
const usuarioValidacao = require('./usuarioValidacao');

// Le um argumento nomeado sem aceitar o valor de outro argumento por engano.
function obterArgumento(nomeArgumento) {
  const indice = process.argv.indexOf(`--${nomeArgumento}`);

  if (indice === -1 || !process.argv[indice + 1]) {
    return undefined;
  }

  if (process.argv[indice + 1].startsWith('--')) {
    return undefined;
  }

  return process.argv[indice + 1];
}

// Cria o primeiro administrador sem disponibilizar uma rota publica permanente.
async function executarCriacaoAdministradorInicial() {
  try {
    const dadosAdministrador = usuarioValidacao.esquemaPrimeiroAdministrador.parse({
      nomeCompleto: obterArgumento('nome'),
      email: obterArgumento('email'),
      senha: process.env.ADMIN_INICIAL_SENHA
    });
    const usuario = await usuarioService.criarPrimeiroAdministrador(
      dadosAdministrador
    );

    console.log(
      `Administrador inicial criado com sucesso. ID: ${usuario.idUsuario}.`
    );
  } catch (erro) {
    if (erro instanceof ZodError) {
      console.error(
        'Dados invalidos. Informe --nome, --email e ADMIN_INICIAL_SENHA forte.'
      );
    } else if (erro instanceof AppError) {
      console.error(erro.message);
    } else {
      const codigo = erro && erro.code ? erro.code : 'SEM_CODIGO';
      console.error(
        `Falha ao criar o administrador inicial. Codigo: ${codigo}.`
      );
    }

    process.exitCode = 1;
  } finally {
    await encerrarPoolBanco();
  }
}

if (require.main === module) {
  executarCriacaoAdministradorInicial();
}

module.exports = {
  executarCriacaoAdministradorInicial,
  obterArgumento
};
