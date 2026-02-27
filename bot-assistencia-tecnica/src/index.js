require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { conectarMongoDB } = require('./database/conexao');
const { criarMensagemHandler } = require('./handlers/mensagemHandler');
const { criarGerenciadorConexao } = require('./handlers/conexaoHandler');
const { logger } = require('./utils/logger');
const { registrarLogMensagem } = require('./utils/helpers');

const estadoConversas = {};
let client;

function carregarComandos() {
  const comandos = new Map();
  const pastaComandos = path.join(__dirname, 'commands');
  const arquivos = fs.readdirSync(pastaComandos).filter((arquivo) => arquivo.endsWith('.js'));

  for (const arquivo of arquivos) {
    const comando = require(path.join(pastaComandos, arquivo));
    comandos.set(comando.nome, comando);
    for (const alias of comando.aliases || []) {
      comandos.set(alias, comando);
    }
  }

  logger.info(`📚 ${comandos.size} comandos carregados dinamicamente.`);
  return comandos;
}

async function iniciarCliente() {
  try {
    const comandos = carregarComandos();

    client = new Client({
      authStrategy: new LocalAuth({
        clientId: process.env.CLIENT_ID || 'assistencia-tecnica',
        dataPath: process.env.PASTA_SESSAO || './sessions'
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    const conexao = criarGerenciadorConexao(iniciarCliente);

    client.on('qr', (qr) => {
      logger.info('📱 Escaneie o QR Code abaixo para autenticar:');
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      conexao.resetarTentativas();
      logger.info('🤖 Bot conectado e pronto para atendimento.');
    });

    client.on('disconnected', async (motivo) => {
      logger.warn(`⚠️ Cliente desconectado. Motivo: ${motivo}`);
      await conexao.reconectar();
    });

    client.on('message', criarMensagemHandler({ client, comandos, estadoConversas }));

    client.on('message_create', async (msg) => {
      try {
        if (!msg.fromMe) return;
        await registrarLogMensagem('bot', msg.to || msg.from, msg.body || '', msg.type || 'texto');
      } catch (erro) {
        logger.error(`Erro ao registrar log de saída: ${erro.message}`);
      }
    });

    await client.initialize();
  } catch (erro) {
    logger.error(`❌ Erro na inicialização do cliente WhatsApp: ${erro.message}`);
    throw erro;
  }
}

async function iniciar() {
  try {
    await conectarMongoDB();
    await iniciarCliente();
  } catch (erro) {
    logger.error(`❌ Falha fatal ao iniciar aplicação: ${erro.message}`);
    process.exit(1);
  }
}

iniciar();
