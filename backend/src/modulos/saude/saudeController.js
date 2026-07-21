// Cria o controller com uma verificacao de banco substituivel nos testes.
function criarSaudeController(dependencias) {
  // Confirma a aplicacao e informa somente o estado publico da conexao com o banco.
  async function consultarSaude(requisicao, resposta) {
    const estadoBanco = await dependencias.testarConexaoBanco();
    const bancoDisponivel = estadoBanco.disponivel === true;

    return resposta.status(bancoDisponivel ? 200 : 503).json({
      status: bancoDisponivel ? 'ok' : 'degradado',
      aplicacao: 'disponivel',
      bancoDados: bancoDisponivel ? 'disponivel' : 'indisponivel'
    });
  }

  return {
    consultarSaude
  };
}

module.exports = {
  criarSaudeController
};
