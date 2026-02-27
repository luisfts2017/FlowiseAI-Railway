const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

async function conectarMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Conexão com MongoDB estabelecida com sucesso.');
  } catch (erro) {
    logger.error(`❌ Falha ao conectar no MongoDB: ${erro.message}`);
    throw erro;
  }
}

module.exports = { conectarMongoDB };
