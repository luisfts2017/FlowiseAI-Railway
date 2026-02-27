const { gerarMenuPrincipal } = require('../utils/helpers');

module.exports = {
  nome: 'menu',
  aliases: ['ajuda', 'help'],
  descricao: 'Exibe o menu principal e lista de comandos.',
  uso: '!menu',
  async executar({ client, msg, comandos }) {
    try {
      const prefixo = process.env.PREFIXO_COMANDO || '!';
      const nome = msg._data?.notifyName || msg.pushname || 'Cliente';

      const linhasComandos = [...new Map([...comandos.values()].map((cmd) => [cmd.nome, cmd])).values()]
        .map((cmd) => `• *${prefixo}${cmd.nome}* → ${cmd.descricao}`)
        .join('\n');

      const texto = `${gerarMenuPrincipal(nome, prefixo)}\n\n━━━━━━━━━━━━━━━━━━\n📚 *Comandos disponíveis*\n${linhasComandos}`;
      await client.sendMessage(msg.from, texto);
    } catch (erro) {
      await client.sendMessage(msg.from, 'Erro ao montar o menu.');
    }
  }
};
