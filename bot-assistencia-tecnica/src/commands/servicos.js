module.exports = {
  nome: 'servicos',
  aliases: ['serviços'],
  descricao: 'Lista serviços e preços médios.',
  uso: '!servicos',
  async executar({ client, msg }) {
    try {
      const texto = `🛠️ *Serviços oferecidos*\n\n• Formatação de notebook/desktop: *R$ 180 a R$ 250*\n• Upgrade SSD/RAM: *R$ 80 + peça*\n• Limpeza interna e troca de pasta térmica: *R$ 120*\n• Remoção de vírus: *R$ 150*\n• Instalação de impressora/rede: *R$ 90*\n\nValores podem variar após diagnóstico técnico.`;
      await client.sendMessage(msg.from, texto);
    } catch (erro) {
      await client.sendMessage(msg.from, 'Erro ao consultar serviços.');
    }
  }
};
