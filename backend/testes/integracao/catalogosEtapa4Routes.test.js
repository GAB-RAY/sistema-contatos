process.env.JWT_SECRET = 'segredo-longo-e-exclusivo-da-integracao-etapa-4';

const jwt = require('jsonwebtoken');
const request = require('supertest');

const { criarApp } = require('../../src/app');
const bairroService = require('../../src/modulos/bairros/bairroService');
const problemaService = require('../../src/modulos/problemas/problemaService');
const origemService = require('../../src/modulos/origens/origemService');

const SEGREDO_TESTE = process.env.JWT_SECRET;

const configuracoesCatalogos = [
  {
    nome: 'bairros',
    caminho: '/bairros',
    service: bairroService,
    metodos: {
      listarAtivos: 'listarBairrosAtivos',
      listarTodos: 'listarTodosBairros',
      buscarPorId: 'buscarBairroPorId',
      criar: 'criarBairro',
      editar: 'editarBairro',
      alterarStatus: 'alterarStatusBairro'
    },
    chaveColecao: 'bairros',
    chaveRegistro: 'bairro',
    criarRegistro: function criarRegistro(sobrescritas) {
      return {
        idBairro: 1,
        nomeBairro: 'Centro',
        bairroAtivo: true,
        ...(sobrescritas || {})
      };
    },
    bodyCriacao: { nomeBairro: '  Jardim   Azul  ' },
    bodyCriacaoEsperado: { nomeBairro: 'Jardim Azul' },
    bodyEdicao: { nomeBairro: '  Centro   Novo  ' },
    bodyEdicaoEsperado: { nomeBairro: 'Centro Novo' },
    bodyVazio: { nomeBairro: '   ' }
  },
  {
    nome: 'problemas',
    caminho: '/problemas',
    service: problemaService,
    metodos: {
      listarAtivos: 'listarProblemasAtivos',
      listarTodos: 'listarTodosProblemas',
      buscarPorId: 'buscarProblemaPorId',
      criar: 'criarProblema',
      editar: 'editarProblema',
      alterarStatus: 'alterarStatusProblema'
    },
    chaveColecao: 'problemas',
    chaveRegistro: 'problema',
    criarRegistro: function criarRegistro(sobrescritas) {
      return {
        idProblema: 1,
        nomeProblema: 'Iluminacao Publica',
        problemaAtivo: true,
        ...(sobrescritas || {})
      };
    },
    bodyCriacao: { nomeProblema: '  Coleta   de Lixo  ' },
    bodyCriacaoEsperado: { nomeProblema: 'Coleta de Lixo' },
    bodyEdicao: { nomeProblema: '  Iluminacao   Urbana  ' },
    bodyEdicaoEsperado: { nomeProblema: 'Iluminacao Urbana' },
    bodyVazio: { nomeProblema: '   ' }
  },
  {
    nome: 'origens',
    caminho: '/origens',
    service: origemService,
    metodos: {
      listarAtivos: 'listarOrigensAtivas',
      listarTodos: 'listarTodasOrigens',
      buscarPorId: 'buscarOrigemPorId',
      criar: 'criarOrigem',
      editar: 'editarOrigem',
      alterarStatus: 'alterarStatusOrigem'
    },
    chaveColecao: 'origens',
    chaveRegistro: 'origem',
    criarRegistro: function criarRegistro(sobrescritas) {
      return {
        idOrigem: 1,
        nomeOrigem: 'Lista Principal',
        descricaoOrigem: 'Cadastro presencial',
        origemAtiva: true,
        ...(sobrescritas || {})
      };
    },
    bodyCriacao: {
      nomeOrigem: '  Formulario   Local  ',
      descricaoOrigem: '  Cadastro   presencial  '
    },
    bodyCriacaoEsperado: {
      nomeOrigem: 'Formulario Local',
      descricaoOrigem: 'Cadastro presencial'
    },
    bodyEdicao: {
      nomeOrigem: '  Lista   Atualizada  ',
      descricaoOrigem: '  Descricao   atualizada  '
    },
    bodyEdicaoEsperado: {
      nomeOrigem: 'Lista Atualizada',
      descricaoOrigem: 'Descricao atualizada'
    },
    bodyVazio: {
      nomeOrigem: '   ',
      descricaoOrigem: null
    }
  }
];

async function simularBancoDisponivel() {
  return { disponivel: true };
}

function criarToken(perfilAcesso) {
  return jwt.sign(
    { idUsuario: 1, perfilAcesso },
    SEGREDO_TESTE,
    { expiresIn: '1h' }
  );
}

function criarAplicacao() {
  return criarApp({
    testarConexaoBanco: simularBancoDisponivel
  });
}

afterEach(function restaurarMocks() {
  jest.restoreAllMocks();
});

describe.each(configuracoesCatalogos)(
  'rotas de $nome',
  function testarRotasCatalogo(configuracao) {
    test('impede acesso publico a listagem', async function executarTeste() {
      const resposta = await request(criarAplicacao()).get(configuracao.caminho);

      expect(resposta.status).toBe(401);
    });

    test('operador consulta listagem padrao e filtro por nome', async function executarTeste() {
      const listarAtivos = jest
        .spyOn(configuracao.service, configuracao.metodos.listarAtivos)
        .mockResolvedValue([configuracao.criarRegistro()]);
      const resposta = await request(criarAplicacao())
        .get(configuracao.caminho)
        .query({ nome: '  centro   novo  ' })
        .set('Authorization', `Bearer ${criarToken('operador')}`);

      expect(resposta.status).toBe(200);
      expect(resposta.body[configuracao.chaveColecao]).toHaveLength(1);
      expect(listarAtivos).toHaveBeenCalledWith({ nome: 'centro novo' });
    });

    test('operador nao acessa listagem administrativa', async function executarTeste() {
      const listarTodos = jest
        .spyOn(configuracao.service, configuracao.metodos.listarTodos)
        .mockResolvedValue([]);
      const resposta = await request(criarAplicacao())
        .get(`${configuracao.caminho}/todos`)
        .set('Authorization', `Bearer ${criarToken('operador')}`);

      expect(resposta.status).toBe(403);
      expect(listarTodos).not.toHaveBeenCalled();
    });

    test('administrador filtra listagem administrativa por ativo', async function executarTeste() {
      const listarTodos = jest
        .spyOn(configuracao.service, configuracao.metodos.listarTodos)
        .mockResolvedValue([configuracao.criarRegistro()]);
      const resposta = await request(criarAplicacao())
        .get(`${configuracao.caminho}/todos`)
        .query({ nome: 'centro', ativo: 'false' })
        .set('Authorization', `Bearer ${criarToken('administrador')}`);

      expect(resposta.status).toBe(200);
      expect(listarTodos).toHaveBeenCalledWith({
        nome: 'centro',
        ativo: false
      });
    });

    test('operador busca registro por id', async function executarTeste() {
      const buscarPorId = jest
        .spyOn(configuracao.service, configuracao.metodos.buscarPorId)
        .mockResolvedValue(configuracao.criarRegistro());
      const resposta = await request(criarAplicacao())
        .get(`${configuracao.caminho}/1`)
        .set('Authorization', `Bearer ${criarToken('operador')}`);

      expect(resposta.status).toBe(200);
      expect(resposta.body[configuracao.chaveRegistro]).toEqual(
        configuracao.criarRegistro()
      );
      expect(buscarPorId).toHaveBeenCalledWith(1);
    });

    test('operador e bloqueado em escrita', async function executarTeste() {
      const criarRegistro = jest
        .spyOn(configuracao.service, configuracao.metodos.criar)
        .mockResolvedValue(configuracao.criarRegistro());
      const resposta = await request(criarAplicacao())
        .post(configuracao.caminho)
        .set('Authorization', `Bearer ${criarToken('operador')}`)
        .send(configuracao.bodyCriacao);

      expect(resposta.status).toBe(403);
      expect(criarRegistro).not.toHaveBeenCalled();
    });

    test('administrador cria com dados normalizados', async function executarTeste() {
      const criarRegistro = jest
        .spyOn(configuracao.service, configuracao.metodos.criar)
        .mockResolvedValue(configuracao.criarRegistro());
      const resposta = await request(criarAplicacao())
        .post(configuracao.caminho)
        .set('Authorization', `Bearer ${criarToken('administrador')}`)
        .send(configuracao.bodyCriacao);

      expect(resposta.status).toBe(201);
      expect(criarRegistro).toHaveBeenCalledWith(
        configuracao.bodyCriacaoEsperado
      );
    });

    test('Zod impede nome vazio', async function executarTeste() {
      const criarRegistro = jest
        .spyOn(configuracao.service, configuracao.metodos.criar)
        .mockResolvedValue(configuracao.criarRegistro());
      const resposta = await request(criarAplicacao())
        .post(configuracao.caminho)
        .set('Authorization', `Bearer ${criarToken('administrador')}`)
        .send(configuracao.bodyVazio);

      expect(resposta.status).toBe(400);
      expect(criarRegistro).not.toHaveBeenCalled();
    });

    test('administrador edita registro', async function executarTeste() {
      const editarRegistro = jest
        .spyOn(configuracao.service, configuracao.metodos.editar)
        .mockResolvedValue(configuracao.criarRegistro());
      const resposta = await request(criarAplicacao())
        .put(`${configuracao.caminho}/1`)
        .set('Authorization', `Bearer ${criarToken('administrador')}`)
        .send(configuracao.bodyEdicao);

      expect(resposta.status).toBe(200);
      expect(editarRegistro).toHaveBeenCalledWith(
        1,
        configuracao.bodyEdicaoEsperado
      );
    });

    test('administrador ativa e desativa registro', async function executarTeste() {
      const alterarStatus = jest
        .spyOn(configuracao.service, configuracao.metodos.alterarStatus)
        .mockResolvedValue(configuracao.criarRegistro());
      const app = criarAplicacao();
      const token = criarToken('administrador');

      const respostaAtivacao = await request(app)
        .patch(`${configuracao.caminho}/1/ativar`)
        .set('Authorization', `Bearer ${token}`);
      const respostaDesativacao = await request(app)
        .patch(`${configuracao.caminho}/1/desativar`)
        .set('Authorization', `Bearer ${token}`);

      expect(respostaAtivacao.status).toBe(200);
      expect(respostaDesativacao.status).toBe(200);
      expect(alterarStatus).toHaveBeenNthCalledWith(1, 1, true);
      expect(alterarStatus).toHaveBeenNthCalledWith(2, 1, false);
    });

    test('rejeita query param nao previsto', async function executarTeste() {
      const listarAtivos = jest
        .spyOn(configuracao.service, configuracao.metodos.listarAtivos)
        .mockResolvedValue([]);
      const resposta = await request(criarAplicacao())
        .get(configuracao.caminho)
        .query({ ordenarPor: 'sql_inseguro' })
        .set('Authorization', `Bearer ${criarToken('operador')}`);

      expect(resposta.status).toBe(400);
      expect(listarAtivos).not.toHaveBeenCalled();
    });

    test('oculta detalhes de erro simulado do banco', async function executarTeste() {
      jest
        .spyOn(configuracao.service, configuracao.metodos.listarAtivos)
        .mockRejectedValue(new Error('detalhe interno do PostgreSQL'));
      const resposta = await request(criarAplicacao())
        .get(configuracao.caminho)
        .set('Authorization', `Bearer ${criarToken('operador')}`);

      expect(resposta.status).toBe(500);
      expect(resposta.body).toEqual({
        erro: {
          mensagem: 'Erro interno do servidor.'
        }
      });
      expect(JSON.stringify(resposta.body)).not.toContain('PostgreSQL');
      expect(JSON.stringify(resposta.body)).not.toContain('stack');
    });
  }
);
