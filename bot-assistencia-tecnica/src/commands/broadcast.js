const { Cliente } = require('../database/models');

module.exports = {
  nome: 'broadcast',
  aliases: [],
  descricao: 'Envia mensagem para todos os clientes cadastrados (admin).',
  uso: '!broadcast [mensagem]',
  async executar({ client, msg, args }) {
    try {
      if (!isAdmin(msg.from)) {
        await client.sendMessage(msg.from, 'Comando restrito ao administrador.');
        return;
      }

      const mensagem = args.join(' ').trim();
      if (!mensagem) {
        await client.sendMessage(msg.from, 'Uso correto: !broadcast [mensagem]');
        return;
      }

      const clientes = await Cliente.find({ bloqueado: false });
      let enviados = 0;

      for (const cliente of clientes) {
        try {
          await client.sendMessage(`${cliente.numero}@c.us`, `📢 *Comunicado da Assistência Técnica*\n\n${mensagem}`);
          enviados += 1;
        } catch (erroInterno) {
          // Ignora falhas individuais para continuar o broadcast.
        }
      }

      await client.sendMessage(msg.from, `✅ Broadcast concluído. Mensagens enviadas: ${enviados}`);
    } catch (erro) {
      await client.sendMessage(msg.from, 'Erro ao executar broadcast.');
    }
  }
};

function isAdmin(from) {
  return from.replace(/\D/g, '').startsWith(process.env.OWNER_NUMERO);
}
