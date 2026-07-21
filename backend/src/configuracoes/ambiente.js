const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  quiet: true
});

// Converte uma configuracao numerica positiva e aplica o valor padrao quando necessario.
function obterInteiroPositivo(valor, valorPadrao) {
  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero <= 0) {
    return valorPadrao;
  }

  return numero;
}

// Mantem configuracoes numericas sensiveis dentro de um intervalo seguro.
function obterInteiroNoIntervalo(valor, valorPadrao, minimo, maximo) {
  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero < minimo || numero > maximo) {
    return valorPadrao;
  }

  return numero;
}

// Transforma a lista de origens do ambiente em valores individuais sem espacos extras.
function obterOrigensCors(valor) {
  if (!valor) {
    return [];
  }

  return valor
    .split(',')
    .map(function removerEspacos(origem) {
      return origem.trim();
    })
    .filter(function removerValoresVazios(origem) {
      return origem.length > 0;
    });
}

const ambiente = Object.freeze({
  porta: obterInteiroPositivo(process.env.PORTA, 3000),
  origensCors: obterOrigensCors(process.env.ORIGENS_CORS),
  limiteJson: process.env.LIMITE_JSON || '100kb',
  janelaRateLimitMs: obterInteiroPositivo(
    process.env.LIMITE_REQUISICOES_JANELA_MS,
    15 * 60 * 1000
  ),
  maximoRequisicoes: obterInteiroPositivo(
    process.env.LIMITE_REQUISICOES_MAXIMO,
    100
  ),
  banco: Object.freeze({
    host: process.env.BANCO_HOST || '',
    porta: obterInteiroPositivo(process.env.BANCO_PORTA, 5432),
    usuario: process.env.BANCO_USUARIO || '',
    senha: process.env.BANCO_SENHA || '',
    nome: process.env.BANCO_NOME || '',
    tempoLimiteConexaoMs: obterInteiroPositivo(
      process.env.BANCO_TEMPO_LIMITE_CONEXAO_MS,
      5000
    )
  }),
  autenticacao: Object.freeze({
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
    bcryptCusto: obterInteiroNoIntervalo(
      process.env.BCRYPT_CUSTO,
      12,
      10,
      14
    ),
    loginJanelaMs: obterInteiroPositivo(
      process.env.LOGIN_LIMITE_JANELA_MS,
      15 * 60 * 1000
    ),
    loginMaximo: obterInteiroPositivo(
      process.env.LOGIN_LIMITE_MAXIMO,
      5
    )
  })
});

module.exports = ambiente;
