const { Blocklist, Cliente } = require('../database/models');

module.exports = {
  nome: 'ban',
  aliases: ['unban'],
  descricao: 'Bloqueia ou desbloqueia números (admin).',
  uso: '!ban [numero] [motivo] | !unban [numero]',
  async executar({ client, msg, args }) {
    try {
      if (!isAdmin(msg.from)) {
        await client.sendMessage(msg.from, 'Comando restrito ao administrador.');
        return;
      }

      const comandoDigitado = msg.body.split(' ')[0].replace('!', '').toLowerCase();
      const numero = (args[0] || '').replace(/\D/g, '');
      if (!numero) {
        await client.sendMessage(msg.from, 'Informe um número válido no formato DDI+DDD+número.');
        return;
      }

      if (comandoDigitado === 'unban') {
        await Blocklist.deleteOne({ numero });
        await Cliente.updateOne({ numero }, { bloqueado: false });
        await client.sendMessage(msg.from, `✅ Número ${numero} removido da blocklist.`);
        return;
      }

      const motivo = args.slice(1).join(' ') || 'Violação de política de atendimento';
      await Blocklist.findOneAndUpdate(
        { numero },
        { numero, motivo, bloqueadoPor: process.env.OWNER_NUMERO },
        { upsert: true, new: true }
      );
      await Cliente.updateOne({ numero }, { bloqueado: true });
      await client.sendMessage(msg.from, `🚫 Número ${numero} bloqueado. Motivo: ${motivo}`);
    } catch (erro) {
      await client.sendMessage(msg.from, 'Erro ao processar banimento.');
    }
  }
};

function isAdmin(from) {
  return from.replace(/\D/g, '').startsWith(process.env.OWNER_NUMERO);
}
