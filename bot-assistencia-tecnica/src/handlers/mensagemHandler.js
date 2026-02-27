const { Cliente, OrdemServico } = require('../database/models');
const { aplicarRateLimit } = require('../middlewares/rateLimiter');
const { numeroBloqueado } = require('../middlewares/blocklist');
const {
  sanitizarTexto,
  normalizarNumero,
  saudacaoPorHorario,
  emHorarioFuncionamento,
  detectarSaudacao,
  gerarMenuPrincipal,
  registrarLogMensagem,
  gerarProtocolo
} = require('../utils/helpers');
const { logger } = require('../utils/logger');

function criarMensagemHandler({ client, comandos, estadoConversas }) {
  return async function mensagemHandler(msg) {
    try {
      if (msg.fromMe) return;

      const numero = normalizarNumero(msg.from);
      const textoOriginal = msg.body || '';
      const texto = sanitizarTexto(textoOriginal);
      const prefixo = process.env.PREFIXO_COMANDO || '!';

      if (!numero || !texto) return;

      await registrarLogMensagem(numero, 'bot', texto, msg.type || 'texto');

      if (await numeroBloqueado(numero)) {
        logger.warn(`🚫 Mensagem ignorada de número bloqueado: ${numero}`);
        return;
      }

      if (aplicarRateLimit(numero)) {
        await client.sendMessage(msg.from, '⚠️ Você enviou muitas mensagens em pouco tempo. Aguarde um minuto e tente novamente.');
        return;
      }

      let cliente = await Cliente.findOne({ numero });
      const nomeContato = msg._data?.notifyName || msg.pushname || cliente?.nome || 'Cliente';

      if (!cliente) {
        cliente = await Cliente.create({
          numero,
          nome: nomeContato,
          primeiraMensagem: new Date(),
          totalAtendimentos: 1
        });

        const boasVindas = `${saudacaoPorHorario()}, *${nomeContato}*! Seja bem-vindo(a) à *${process.env.NOME_EMPRESA || 'Assistência Técnica'}*.`;
        await client.sendMessage(msg.from, `${boasVindas}\n\n${gerarMenuPrincipal(nomeContato, prefixo)}`);
        await registrarLogMensagem('bot', numero, 'Mensagem de boas-vindas enviada.');
        return;
      }

      if (!emHorarioFuncionamento()) {
        await client.sendMessage(msg.from, '🕐 No momento estamos fora do horário de atendimento. Retornaremos assim que possível no próximo período comercial.');
      }

      if (estadoConversas[numero]?.tipo === 'orcamento') {
        await processarFluxoOrcamento({ client, msg, texto, numero, nomeContato, estadoConversas });
        return;
      }

      if (detectarSaudacao(texto)) {
        await client.sendMessage(msg.from, `${saudacaoPorHorario()}, ${nomeContato}! Posso te ajudar com orçamento, status ou serviços. Digite *${prefixo}menu*.`);
        return;
      }

      if (/^[1-5]$/.test(texto)) {
        const mapaOpcoes = {
          '1': 'orcamento',
          '2': 'status',
          '3': 'servicos',
          '4': 'contato',
          '5': 'menu'
        };
        const comandoMenu = comandos.get(mapaOpcoes[texto]);
        if (comandoMenu) {
          await comandoMenu.executar({ client, msg, args: [], comandos, estadoConversas });
          return;
        }
      }

      if (texto.startsWith(prefixo)) {
        const [nomeBruto, ...args] = texto.slice(prefixo.length).split(' ');
        const nomeComando = nomeBruto.toLowerCase();
        const comando = comandos.get(nomeComando) || [...comandos.values()].find((cmd) => cmd.aliases?.includes(nomeComando));

        if (!comando) {
          await client.sendMessage(msg.from, `❓ Comando não reconhecido. Digite *${prefixo}menu* para ver as opções.`);
          return;
        }

        await comando.executar({ client, msg, args, comandos, estadoConversas });
        return;
      }

      await client.sendMessage(msg.from, `Não entendi sua mensagem. Digite *${prefixo}menu* para ver o menu principal. 🙂`);
    } catch (erro) {
      logger.error(`❌ Erro no tratamento de mensagem: ${erro.message}`);
    }
  };
}

async function processarFluxoOrcamento({ client, msg, texto, numero, nomeContato, estadoConversas }) {
  try {
    const etapaAtual = estadoConversas[numero]?.etapa;

    if (etapaAtual === 'equipamento') {
      estadoConversas[numero].equipamento = texto;
      estadoConversas[numero].etapa = 'problema';
      await client.sendMessage(msg.from, 'Perfeito! Agora descreva o problema encontrado no equipamento.');
      return;
    }

    if (etapaAtual === 'problema') {
      estadoConversas[numero].problema = texto;
      const { equipamento, problema } = estadoConversas[numero];
      estadoConversas[numero].etapa = 'confirmacao';
      await client.sendMessage(
        msg.from,
        `Confirma os dados para abrir o orçamento?\n\n📌 Equipamento: ${equipamento}\n🛠️ Problema: ${problema}\n\nResponda com *sim* para confirmar ou *não* para reiniciar.`
      );
      return;
    }

    if (etapaAtual === 'confirmacao') {
      if (texto.toLowerCase() === 'sim') {
        const protocolo = gerarProtocolo('AT');
        const { equipamento, problema } = estadoConversas[numero];

        await OrdemServico.create({
          protocolo,
          clienteNumero: numero,
          clienteNome: nomeContato,
          equipamento,
          problema,
          status: 'aguardando'
        });

        await client.sendMessage(msg.from, `✅ Orçamento registrado com sucesso!\nSeu protocolo é *${protocolo}*.\nEm breve um técnico fará contato.`);

        const destinoNotificacao = `${process.env.NOTIFICAR_NUMERO}@c.us`;
        await client.sendMessage(destinoNotificacao, `📣 Novo orçamento recebido\nCliente: ${nomeContato}\nNúmero: ${numero}\nProtocolo: ${protocolo}`);
        delete estadoConversas[numero];
        return;
      }

      if (texto.toLowerCase() === 'não' || texto.toLowerCase() === 'nao') {
        estadoConversas[numero] = { tipo: 'orcamento', etapa: 'equipamento' };
        await client.sendMessage(msg.from, 'Sem problemas! Vamos reiniciar. Qual é o equipamento?');
        return;
      }

      await client.sendMessage(msg.from, 'Por favor, responda apenas com *sim* ou *não*.');
    }
  } catch (erro) {
    logger.error(`❌ Erro no fluxo de orçamento: ${erro.message}`);
    await client.sendMessage(msg.from, 'Tivemos um problema ao processar seu orçamento. Tente novamente em alguns instantes.');
  }
}

module.exports = { criarMensagemHandler };
