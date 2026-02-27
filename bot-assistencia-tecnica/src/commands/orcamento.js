module.exports = {
  nome: 'orcamento',
  aliases: ['orçamento'],
  descricao: 'Inicia o fluxo guiado de orçamento.',
  uso: '!orcamento',
  async executar({ client, msg, estadoConversas }) {
    try {
      const numero = msg.from.replace(/\D/g, '');
      estadoConversas[numero] = { tipo: 'orcamento', etapa: 'equipamento' };
      await client.sendMessage(msg.from, 'Perfeito! Vamos iniciar seu orçamento.\n\nPasso 1/3: Qual equipamento você deseja avaliar?');
    } catch (erro) {
      await client.sendMessage(msg.from, 'Não foi possível iniciar o orçamento agora.');
    }
  }
};
