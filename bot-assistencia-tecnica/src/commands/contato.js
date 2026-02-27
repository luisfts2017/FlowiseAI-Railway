module.exports = {
  nome: 'contato',
  aliases: ['horario', 'endereco'],
  descricao: 'Exibe horário e canais de atendimento.',
  uso: '!contato',
  async executar({ client, msg }) {
    try {
      const texto = `📍 *Contato da assistência técnica*\n\n🏢 Empresa: ${process.env.NOME_EMPRESA || 'Assistência Técnica'}\n🕐 Horário: Seg a Sex, 08h às 18h\n📞 WhatsApp: ${(process.env.NOTIFICAR_NUMERO || '').replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4')}\n📌 Endereço: Rua Exemplo, 123 - Centro\n\nSe preferir, digite *5* para falar com um técnico.`;
      await client.sendMessage(msg.from, texto);
    } catch (erro) {
      await client.sendMessage(msg.from, 'Erro ao mostrar contato.');
    }
  }
};
