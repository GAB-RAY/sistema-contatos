// Representa erros operacionais que podem ser devolvidos com seguranca ao cliente.
class AppError extends Error {
  constructor(mensagem, statusHttp) {
    super(mensagem);
    this.name = 'AppError';
    this.statusHttp = statusHttp || 400;
    this.operacional = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
