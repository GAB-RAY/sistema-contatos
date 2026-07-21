const { z } = require('zod');

function normalizarEspacos(valor) {
  return valor.trim().replace(/\s+/g, ' ');
}

const esquemaObjetoVazio = z.object({}).strict().default({});
const esquemaNome = z
  .string()
  .transform(normalizarEspacos)
  .pipe(z.string().min(1).max(150));
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
const esquemaBodyNome = z.object({
  nomeProblema: esquemaNome
}).strict();

module.exports = {
  listarAtivos: {
    body: esquemaObjetoVazio,
    params: esquemaObjetoVazio,
    query: esquemaQueryNome
  },
  listarTodos: {
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
    body: esquemaBodyNome,
    params: esquemaObjetoVazio,
    query: esquemaObjetoVazio
  },
  editar: {
    body: esquemaBodyNome,
    params: esquemaParamsId,
    query: esquemaObjetoVazio
  },
  alterarStatus: {
    body: esquemaObjetoVazio,
    params: esquemaParamsId,
    query: esquemaObjetoVazio
  }
};
