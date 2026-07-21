const request = require('supertest');
const { criarApp } = require('../../src/app');

describe('GET /saude', function testarRotaSaude() {
  test('responde 200 e informa que o servidor esta disponivel', async function executarTeste() {
    const app = criarApp();
    const resposta = await request(app).get('/saude');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ status: 'ok' });
    expect(resposta.headers['content-type']).toMatch(/json/);
  });

  test('inclui os cabecalhos de seguranca do Helmet', async function executarTeste() {
    const app = criarApp();
    const resposta = await request(app).get('/saude');

    expect(resposta.headers['x-content-type-options']).toBe('nosniff');
    expect(resposta.headers['x-frame-options']).toBeDefined();
    expect(resposta.headers['x-powered-by']).toBeUndefined();
  });
});
