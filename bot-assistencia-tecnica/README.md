# Bot de WhatsApp para Assistência Técnica em Informática

Projeto profissional em **Node.js + whatsapp-web.js + MongoDB** com foco em atendimento automatizado para assistência técnica.

## ✅ O que este bot faz

- Sistema de comandos dinâmico com prefixo configurável.
- Fluxo de atendimento automático com menu numérico.
- Fluxo guiado de orçamento (3 passos).
- Gestão de Ordem de Serviço (OS) com protocolo único.
- Comandos administrativos protegidos por número de owner.
- Rate limiting por número.
- Blocklist com persistência no MongoDB.
- Log de mensagens no MongoDB e em arquivo.
- Reconexão automática com backoff exponencial.

## 📁 Estrutura

```text
bot-assistencia-tecnica
├── src/
│   ├── commands/
│   ├── handlers/
│   ├── database/
│   ├── middlewares/
│   ├── utils/
│   └── index.js
├── sessions/
├── logs/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🪟 Instalação do zero no Windows

### 1) Instalar Node.js LTS
1. Acesse: https://nodejs.org
2. Baixe a versão **LTS** para Windows.
3. Marque a opção para adicionar ao PATH.
4. Valide no PowerShell:
   ```powershell
   node -v
   npm -v
   ```

### 2) Instalar MongoDB Community
1. Baixe: https://www.mongodb.com/try/download/community
2. Instale com a opção **MongoDB as a Service**.
3. Inicie o serviço MongoDB no Windows.
4. Teste conexão local padrão (`mongodb://127.0.0.1:27017`).

### 3) Configurar o projeto
```powershell
cd bot-assistencia-tecnica
npm install
copy .env.example .env
```

Edite o arquivo `.env` com seus dados reais (principalmente `OWNER_NUMERO`, `NOTIFICAR_NUMERO` e `MONGODB_URI`).

### 4) Rodar o bot
- Produção:
  ```powershell
  npm start
  ```
- Desenvolvimento (nodemon):
  ```powershell
  npm run dev
  ```

### 5) Escanear QR Code
1. Com o bot rodando, um QR será exibido no terminal.
2. Abra o WhatsApp no celular.
3. Vá em **Aparelhos conectados** > **Conectar um aparelho**.
4. Escaneie o QR.
5. A sessão ficará salva na pasta `sessions/` via `LocalAuth`.

## 🤖 Comandos disponíveis

### Cliente
- `!menu`
- `!servicos`
- `!orcamento`
- `!status [protocolo]`
- `!contato`
- `!ping`

### Admin
- `!os listar`
- `!os ver [protocolo]`
- `!os atualizar [protocolo] [status]`
- `!ban [numero] [motivo]`
- `!unban [numero]`
- `!broadcast [mensagem]`

## 🔐 Segurança aplicada

- Dados sensíveis apenas em `.env`.
- Comandos administrativos restritos ao `OWNER_NUMERO`.
- Sanitização básica de entradas.
- Consulta de OS não expõe dados de terceiros.

## ♻️ Rodar com PM2 no Windows

```powershell
npm install -g pm2
pm2 start src/index.js --name bot-assistencia
pm2 save
pm2 startup
```

> Dica: para manter sempre ativo no boot do Windows, execute o comando de startup que o PM2 retornar no terminal.

## 📝 Observação sobre o arquivo `bot.js` do repositório

O repositório original contém um `bot.js` monolítico com outra stack (Baileys + OpenAI). Este projeto novo foi criado em pasta separada (`bot-assistencia-tecnica`) seguindo sua especificação com `whatsapp-web.js`, modularização por camadas e MongoDB com Mongoose.
