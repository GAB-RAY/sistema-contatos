const { z } = require('zod');

function normalizarEspacos(valor) {
  return valor.trim().replace(/\s+/g, ' ');
}

const esquemaObjetoVazio = z.object({}).strict().default({});
const esquemaNome = z
  .string()
  .transform(normalizarEspacos)
  .pipe(z.string().min(1).max(150));
const esquemaDescricao = z.union([
  z
    .string()
    .transform(normalizarEspacos)
    .pipe(z.string().min(1).max(300)),
  z.null()
]);
const esquemaParamsId = z.object({
  id: z.coerce.number().int().positive()
}).strict();
const esquemaQueryNome = z.object({
  nome: esquemaNome.optional()
}).strict();
const esquemaQueryAdministrativa = z.object({
  nome: esquemaNome.optional(),
  ativo: z.enum(['true', 'false']).transform(function converterAtivo(valor) {
    return valor === 'true';
  }).optional()
}).strict();
const esquemaCriarOrigem = z.object({
  nomeOrigem: esquemaNome,
  descricaoOrigem: esquemaDescricao.optional()
}).strict();
const esquemaEditarOrigem = z.object({
  nomeOrigem: esquemaNome,
  descricaoOrigem: esquemaDescricao
}).strict();

module.exports = {
  listarAtivas: {
    body: esquemaObjetoVazio,
    params: esquemaObjetoVazio,
    query: esquemaQueryNome
  },
  listarTodas: {
    body: esquemaObjetoVazio,
    params: esquemaObjetoVazio,
    query: esquemaQueryAdministrativa
  },
  buscarPorId: {
    body: esquemaObjetoVazio,
    params: esquemaParamsId,
    query: esquemaObjetoVazio
  },
  criar: {
    body: esquemaCriarOrigem,
    params: esquemaObjetoVazio,
    query: esquemaObjetoVazio
  },
  editar: {
    body: esquemaEditarOrigem,
    params: esquemaParamsId,
    query: esquemaObjetoVazio
  },
  alterarStatus: {
    body: esquemaObjetoVazio,
    params: esquemaParamsId,
    query: esquemaObjetoVazio
  }
};
