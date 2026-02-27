const { logger } = require('../utils/logger');

function criarGerenciadorConexao(iniciarCliente) {
  let tentativas = 0;

  async function reconectar() {
    try {
      tentativas += 1;
      const espera = Math.min(30000, 1000 * (2 ** tentativas));
      logger.warn(`🔌 Desconectado. Tentativa ${tentativas} de reconexão em ${espera}ms.`);
      await new Promise((resolve) => setTimeout(resolve, espera));
      await iniciarCliente();
    } catch (erro) {
      logger.error(`❌ Erro ao reconectar: ${erro.message}`);
      await reconectar();
    }
  }

  function resetarTentativas() {
    tentativas = 0;
  }

  return { reconectar, resetarTentativas };
}

module.exports = { criarGerenciadorConexao };
