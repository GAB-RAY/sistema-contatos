const { z } = require('zod');

const esquemaObjetoVazio = z.object({}).strict().default({});

const esquemaLogin = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(180)
    .transform(function normalizarEmail(email) {
      return email.toLowerCase();
    }),
  senha: z.string().min(1).max(128)
}).strict();

module.exports = {
  login: {
    body: esquemaLogin,
    params: esquemaObjetoVazio,
    query: esquemaObjetoVazio
  }
};
