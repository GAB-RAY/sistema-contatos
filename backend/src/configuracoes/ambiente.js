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
  )
});

module.exports = ambiente;
