const AppError = require('../../src/erros/AppError');
const tratarErro = require('../../src/middlewares/tratarErro');

// Cria uma resposta Express minima para observar status e corpo devolvidos.
function criarResposta() {
  const resposta = {
    status: jest.fn(function definirStatus() {
      return resposta;
    }),
    json: jest.fn(function enviarJson() {
      return resposta;
    })
  };

  return resposta;
}

describe('tratarErro', function testarMiddleware() {
  test('devolve a mensagem e o status de um AppError', function executarTeste() {
    const resposta = criarResposta();
    const erro = new AppError('Acesso negado.', 403);

    tratarErro(erro, {}, resposta, jest.fn());

    expect(resposta.status).toHaveBeenCalledWith(403);
    expect(resposta.json).toHaveBeenCalledWith({
      erro: {
        mensagem: 'Acesso negado.'
      }
    });
  });

  test('oculta os detalhes de um erro inesperado', function executarTeste() {
    const resposta = criarResposta();

    tratarErro(new Error('detalhe interno'), {}, resposta, jest.fn());

    expect(resposta.status).toHaveBeenCalledWith(500);
    expect(resposta.json).toHaveBeenCalledWith({
      erro: {
        mensagem: 'Erro interno do servidor.'
      }
    });
  });
});
