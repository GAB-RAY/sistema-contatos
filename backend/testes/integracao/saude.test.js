const request = require('supertest');
const { criarApp } = require('../../src/app');

// Simula uma conexao valida sem acessar o PostgreSQL real durante o teste HTTP.
async function simularBancoDisponivel() {
  return { disponivel: true };
}

describe('GET /saude', function testarRotaSaude() {
  test('responde 200 quando aplicacao e banco estao disponiveis', async function executarTeste() {
    const app = criarApp({ testarConexaoBanco: simularBancoDisponivel });
    const resposta = await request(app).get('/saude');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({
      status: 'ok',
      aplicacao: 'disponivel',
      bancoDados: 'disponivel'
    });
    expect(resposta.headers['content-type']).toMatch(/json/);
  });

  test('responde 503 sem detalhes internos quando o banco esta indisponivel', async function executarTeste() {
    const app = criarApp({
      testarConexaoBanco: async function simularBancoIndisponivel() {
        return {
          disponivel: false,
          mensagem: 'detalhe que nao pode aparecer na resposta'
        };
      }
    });
    const resposta = await request(app).get('/saude');

    expect(resposta.status).toBe(503);
    expect(resposta.body).toEqual({
      status: 'degradado',
      aplicacao: 'disponivel',
      bancoDados: 'indisponivel'
    });
    expect(JSON.stringify(resposta.body)).not.toContain('detalhe');
  });

  test('inclui os cabecalhos de seguranca do Helmet', async function executarTeste() {
    const app = criarApp({ testarConexaoBanco: simularBancoDisponivel });
    const resposta = await request(app).get('/saude');

    expect(resposta.headers['x-content-type-options']).toBe('nosniff');
    expect(resposta.headers['x-frame-options']).toBeDefined();
    expect(resposta.headers['x-powered-by']).toBeUndefined();
  });
});
