const { LogMensagem } = require('../database/models');

function sanitizarTexto(texto = '') {
  return String(texto).replace(/\s+/g, ' ').trim();
}

function normalizarNumero(numero = '') {
  return String(numero).replace(/\D/g, '');
}

function saudacaoPorHorario() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

function gerarProtocolo(prefixo = 'AT') {
  const agora = new Date();
  const data = agora.toISOString().slice(0, 10).replace(/-/g, '');
  const sufixo = Math.floor(1000 + Math.random() * 9000);
  return `${prefixo}${data}-${sufixo}`;
}

function emHorarioFuncionamento() {
  const abertura = Number(process.env.HORA_ABERTURA || 8);
  const fechamento = Number(process.env.HORA_FECHAMENTO || 18);
  const diasAtendimento = (process.env.DIAS_ATENDIMENTO || '1,2,3,4,5').split(',').map(Number);
  const agora = new Date();
  return diasAtendimento.includes(agora.getDay()) && agora.getHours() >= abertura && agora.getHours() < fechamento;
}

function detectarSaudacao(texto = '') {
  const saudacoes = ['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'eai', 'e aí'];
  const normalizado = texto.toLowerCase();
  return saudacoes.some((item) => normalizado.includes(item));
}

function gerarMenuPrincipal(nome = 'Cliente', prefixo = '!') {
  return `╔══════════════════════════╗\n║  🖥️ ASSISTÊNCIA TÉCNICA  ║\n║     Olá, ${nome}! 👋      ║\n╚══════════════════════════╝\n\nO que você precisa hoje?\n\n1️⃣ Solicitar orçamento\n2️⃣ Verificar status do serviço\n3️⃣ Nossos serviços\n4️⃣ Horários e contato\n5️⃣ Falar com um técnico\n\nDigite o número da opção desejada\nou use ${prefixo} para ver os comandos.`;
}

async function registrarLogMensagem(de, para, mensagem, tipo = 'texto') {
  try {
    await LogMensagem.create({ de, para, mensagem, tipo });
  } catch (erro) {
    // Evita quebrar o fluxo principal por falha de log
  }
}

function validarStatusOS(status) {
  return ['aguardando', 'em_análise', 'em_reparo', 'pronto', 'entregue'].includes(status);
}

module.exports = {
  sanitizarTexto,
  normalizarNumero,
  saudacaoPorHorario,
  gerarProtocolo,
  emHorarioFuncionamento,
  detectarSaudacao,
  gerarMenuPrincipal,
  registrarLogMensagem,
  validarStatusOS
};
