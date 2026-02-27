const { OrdemServico } = require('../database/models');

module.exports = {
  nome: 'status',
  aliases: [],
  descricao: 'Consulta o status da OS por protocolo.',
  uso: '!status [protocolo]',
  async executar({ client, msg, args }) {
    try {
      const protocolo = (args[0] || '').toUpperCase();
      if (!protocolo) {
        await client.sendMessage(msg.from, 'Use: *!status [protocolo]*. Exemplo: !status AT20240115-4823');
        return;
      }

      const os = await OrdemServico.findOne({ protocolo });
      if (!os) {
        await client.sendMessage(msg.from, 'Não localizamos uma OS com esse protocolo.');
        return;
      }

      if (!msg.from.includes(os.clienteNumero) && !isAdmin(msg.from)) {
        await client.sendMessage(msg.from, 'Você não tem permissão para consultar esta OS.');
        return;
      }

      await client.sendMessage(msg.from, `🔎 *Status da OS*\nProtocolo: *${os.protocolo}*\nEquipamento: ${os.equipamento}\nStatus atual: *${os.status}*`);
    } catch (erro) {
      await client.sendMessage(msg.from, 'Erro ao consultar status da OS.');
    }
  }
};

function isAdmin(from) {
  return from.replace(/\D/g, '').startsWith(process.env.OWNER_NUMERO);
}
