const { OrdemServico } = require('../database/models');
const { validarStatusOS } = require('../utils/helpers');

module.exports = {
  nome: 'os',
  aliases: [],
  descricao: 'Gerencia ordens de serviço (admin).',
  uso: '!os listar | !os ver [protocolo] | !os atualizar [protocolo] [status]',
  async executar({ client, msg, args }) {
    try {
      if (!isAdmin(msg.from)) {
        await client.sendMessage(msg.from, 'Comando restrito ao administrador.');
        return;
      }

      const acao = (args[0] || '').toLowerCase();
      if (acao === 'listar') {
        const ordens = await OrdemServico.find({ status: { $ne: 'entregue' } }).sort({ criadoEm: -1 }).limit(20);
        const texto = ordens.length
          ? ordens.map((item) => `• ${item.protocolo} | ${item.clienteNome} | ${item.status}`).join('\n')
          : 'Nenhuma OS aberta no momento.';
        await client.sendMessage(msg.from, `📋 *OS em aberto*\n${texto}`);
        return;
      }

      if (acao === 'ver') {
        const protocolo = (args[1] || '').toUpperCase();
        const os = await OrdemServico.findOne({ protocolo });
        if (!os) {
          await client.sendMessage(msg.from, 'OS não encontrada.');
          return;
        }
        await client.sendMessage(msg.from, `🧾 *Detalhes da OS*\nProtocolo: ${os.protocolo}\nCliente: ${os.clienteNome}\nNúmero: ${os.clienteNumero}\nEquipamento: ${os.equipamento}\nProblema: ${os.problema}\nStatus: ${os.status}\nObservações: ${os.observacoes || 'Nenhuma'}`);
        return;
      }

      if (acao === 'atualizar') {
        const protocolo = (args[1] || '').toUpperCase();
        const status = (args[2] || '').toLowerCase();
        if (!validarStatusOS(status)) {
          await client.sendMessage(msg.from, 'Status inválido. Use: aguardando | em_análise | em_reparo | pronto | entregue');
          return;
        }

        const os = await OrdemServico.findOneAndUpdate({ protocolo }, { status }, { new: true });
        if (!os) {
          await client.sendMessage(msg.from, 'OS não encontrada para atualização.');
          return;
        }

        await client.sendMessage(msg.from, `✅ OS ${protocolo} atualizada para *${status}*.`);


        if (status === 'em_reparo') {
          await client.sendMessage(`${os.clienteNumero}@c.us`, `💰 Orçamento aprovado e serviço iniciado para a OS *${os.protocolo}*. Nossa equipe já está trabalhando no seu equipamento.`);
        }

        if (status === 'pronto') {
          await client.sendMessage(`${os.clienteNumero}@c.us`, `📦 Seu equipamento da OS *${os.protocolo}* está pronto para retirada. Obrigado por confiar na nossa assistência técnica!`);
        }
        if (status === 'entregue') {
          await client.sendMessage(`${os.clienteNumero}@c.us`, `🙏 Atendimento finalizado com sucesso! Agradecemos pela preferência. Sempre que precisar, estamos à disposição.`);
        }
        return;
      }

      await client.sendMessage(msg.from, 'Uso: !os listar | !os ver [protocolo] | !os atualizar [protocolo] [status]');
    } catch (erro) {
      await client.sendMessage(msg.from, 'Erro ao processar comando OS.');
    }
  }
};

function isAdmin(from) {
  return from.replace(/\D/g, '').startsWith(process.env.OWNER_NUMERO);
}
