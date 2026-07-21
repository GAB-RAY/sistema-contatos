const AppError = require('../../src/erros/AppError');

describe('AppError', function testarAppError() {
  test('cria um erro operacional com status HTTP informado', function executarTeste() {
    const erro = new AppError('Requisicao invalida.', 422);

    expect(erro).toBeInstanceOf(Error);
    expect(erro.name).toBe('AppError');
    expect(erro.message).toBe('Requisicao invalida.');
    expect(erro.statusHttp).toBe(422);
    expect(erro.operacional).toBe(true);
  });

  test('usa status 400 quando nenhum status e informado', function executarTeste() {
    const erro = new AppError('Requisicao invalida.');

    expect(erro.statusHttp).toBe(400);
  });
});
