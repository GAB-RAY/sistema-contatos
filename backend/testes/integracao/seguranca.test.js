const request = require('supertest');
const { criarApp } = require('../../src/app');

describe('Seguranca HTTP da fundacao', function testarSeguranca() {
  test('aceita somente uma origem CORS configurada', async function executarTeste() {
    const origemOficial = 'https://sistema.exemplo';
    const app = criarApp({ origensCors: [origemOficial] });

    const respostaPermitida = await request(app)
      .get('/saude')
      .set('Origin', origemOficial);
    const respostaNegada = await request(app)
      .get('/saude')
      .set('Origin', 'https://origem-nao-permitida.exemplo');

    expect(respostaPermitida.status).toBe(200);
    expect(respostaPermitida.headers['access-control-allow-origin']).toBe(origemOficial);
    expect(respostaNegada.status).toBe(403);
    expect(respostaNegada.body).toEqual({
      erro: {
        mensagem: 'Origem nao permitida pelo CORS.'
      }
    });
  });

  test('recusa corpo JSON acima do limite configurado', async function executarTeste() {
    const app = criarApp({ limiteJson: '100b' });
    const resposta = await request(app)
      .post('/rota-inexistente')
      .send({ conteudo: 'a'.repeat(200) });

    expect(resposta.status).toBe(413);
    expect(resposta.body.erro.mensagem).toBe(
      'Corpo da requisicao excede o limite permitido.'
    );
  });

  test('recusa corpo JSON malformado', async function executarTeste() {
    const app = criarApp();
    const resposta = await request(app)
      .post('/rota-inexistente')
      .set('Content-Type', 'application/json')
      .send('{"nome":');

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.mensagem).toBe('Corpo JSON invalido.');
  });

  test('limita a quantidade de requisicoes por cliente', async function executarTeste() {
    const app = criarApp({
      janelaRateLimitMs: 60 * 1000,
      maximoRequisicoes: 2
    });

    await request(app).get('/saude').expect(200);
    await request(app).get('/saude').expect(200);
    const resposta = await request(app).get('/saude');

    expect(resposta.status).toBe(429);
    expect(resposta.body.erro.mensagem).toBe(
      'Muitas requisicoes. Tente novamente mais tarde.'
    );
  });

  test('responde 404 em JSON para uma rota inexistente', async function executarTeste() {
    const app = criarApp();
    const resposta = await request(app).get('/nao-existe');

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.mensagem).toBe('Rota nao encontrada.');
  });
});
