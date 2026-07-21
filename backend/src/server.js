const ambiente = require('./configuracoes/ambiente');
const { criarApp } = require('./app');

// Inicia o servidor HTTP usando as configuracoes carregadas do ambiente.
function iniciarServidor() {
  const app = criarApp();

  return app.listen(ambiente.porta, function informarInicializacao() {
    console.log(`Servidor iniciado na porta ${ambiente.porta}.`);
  });
}

if (require.main === module) {
  iniciarServidor();
}

module.exports = {
  iniciarServidor
};
