const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema(
  {
    numero: { type: String, unique: true, required: true, index: true },
    nome: { type: String, default: 'Cliente' },
    bloqueado: { type: Boolean, default: false },
    primeiraMensagem: { type: Date },
    totalAtendimentos: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } }
);

const ordemServicoSchema = new mongoose.Schema(
  {
    protocolo: { type: String, unique: true, required: true, index: true },
    clienteNumero: { type: String, required: true, index: true },
    clienteNome: { type: String, required: true },
    equipamento: { type: String, required: true },
    problema: { type: String, required: true },
    status: {
      type: String,
      enum: ['aguardando', 'em_análise', 'em_reparo', 'pronto', 'entregue'],
      default: 'aguardando'
    },
    observacoes: { type: String, default: '' },
    valorOrcamento: { type: Number },
    valorFinal: { type: Number }
  },
  { timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } }
);

const logMensagemSchema = new mongoose.Schema({
  de: { type: String, required: true },
  para: { type: String, required: true },
  mensagem: { type: String, required: true },
  tipo: { type: String, enum: ['texto', 'imagem', 'documento'], default: 'texto' },
  timestamp: { type: Date, default: Date.now }
});

const blocklistSchema = new mongoose.Schema(
  {
    numero: { type: String, unique: true, required: true, index: true },
    motivo: { type: String, default: 'Sem motivo informado' },
    bloqueadoPor: { type: String, required: true }
  },
  { timestamps: { createdAt: 'criadoEm', updatedAt: false } }
);

const Cliente = mongoose.model('Cliente', clienteSchema);
const OrdemServico = mongoose.model('OrdemServico', ordemServicoSchema);
const LogMensagem = mongoose.model('LogMensagem', logMensagemSchema);
const Blocklist = mongoose.model('Blocklist', blocklistSchema);

module.exports = { Cliente, OrdemServico, LogMensagem, Blocklist };
