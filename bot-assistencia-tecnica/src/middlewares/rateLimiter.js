const janelas = new Map();

function aplicarRateLimit(numero) {
  const limite = Number(process.env.RATE_LIMIT_POR_MINUTO || 15);
  const agora = Date.now();
  const janela = janelas.get(numero);

  if (!janela || agora - janela.inicio > 60000) {
    janelas.set(numero, { inicio: agora, quantidade: 1 });
    return false;
  }

  janela.quantidade += 1;
  return janela.quantidade > limite;
}

module.exports = { aplicarRateLimit };
