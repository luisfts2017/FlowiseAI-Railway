module.exports = {
  nome: 'ping',
  aliases: [],
  descricao: 'Verifica se o bot está online.',
  uso: '!ping',
  async executar({ client, msg }) {
    try {
      const inicio = Date.now();
      await client.sendMessage(msg.from, `Pong! 🏓 delay: ${Date.now() - inicio}ms`);
    } catch (erro) {
      await client.sendMessage(msg.from, 'Erro ao executar ping.');
    }
  }
};
