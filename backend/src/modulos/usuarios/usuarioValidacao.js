const { z } = require('zod');

const esquemaObjetoVazio = z.object({}).strict().default({});
const esquemaParamsId = z.object({
  id: z.coerce.number().int().positive()
}).strict();
const esquemaEmail = z
  .string()
  .trim()
  .email()
  .max(180)
  .transform(function normalizarEmail(email) {
    return email.toLowerCase();
  });
const esquemaNome = z.string().trim().min(3).max(150);
const esquemaPerfil = z.enum(['administrador', 'operador']);
const esquemaSenhaForte = z
  .string()
  .min(12)
  .max(128)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/[0-9]/);

const esquemaCriarUsuario = z.object({
  nomeCompleto: esquemaNome,
  email: esquemaEmail,
  senha: esquemaSenhaForte,
  perfilAcesso: esquemaPerfil
}).strict();

const esquemaEditarUsuario = z.object({
  nomeCompleto: esquemaNome,
  email: esquemaEmail,
  perfilAcesso: esquemaPerfil
}).strict();

const esquemaTrocarSenha = z.object({
  senhaNova: esquemaSenhaForte
}).strict();

const esquemaPrimeiroAdministrador = z.object({
  nomeCompleto: esquemaNome,
  email: esquemaEmail,
  senha: esquemaSenhaForte
}).strict();

module.exports = {
  esquemaPrimeiroAdministrador,
  listar: {
    body: esquemaObjetoVazio,
    params: esquemaObjetoVazio,
    query: esquemaObjetoVazio
  },
  buscarPorId: {
    body: esquemaObjetoVazio,
    params: esquemaParamsId,
    query: esquemaObjetoVazio
  },
  criar: {
    body: esquemaCriarUsuario,
    params: esquemaObjetoVazio,
    query: esquemaObjetoVazio
  },
  editar: {
    params: esquemaParamsId,
    body: esquemaEditarUsuario,
    query: esquemaObjetoVazio
  },
  alterarStatus: {
    body: esquemaObjetoVazio,
    params: esquemaParamsId,
    query: esquemaObjetoVazio
  },
  trocarSenha: {
    params: esquemaParamsId,
    body: esquemaTrocarSenha,
    query: esquemaObjetoVazio
  }
};
