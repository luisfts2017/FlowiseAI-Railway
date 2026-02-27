const { Blocklist, Cliente } = require('../database/models');

async function numeroBloqueado(numero) {
  try {
    const [naBlocklist, cliente] = await Promise.all([
      Blocklist.findOne({ numero }),
      Cliente.findOne({ numero })
    ]);
    return Boolean(naBlocklist || cliente?.bloqueado);
  } catch (erro) {
    return false;
  }
}

module.exports = { numeroBloqueado };
