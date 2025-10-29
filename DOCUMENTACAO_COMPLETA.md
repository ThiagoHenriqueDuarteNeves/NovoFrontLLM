# 🚀 LM Studio Front-End - Projeto Completo

## 📋 Visão Geral

SPA completo em **React 18 + TypeScript + Vite** para funcionar como cliente web do LM Studio acessível via rede local.

### 🎯 Objetivo
Fornecer uma interface moderna e responsiva para:
- Descobrir modelos disponíveis no LM Studio
- Chat em tempo real com streaming SSE
- Renderização avançada (Markdown, syntax highlighting)
- Configuração dinâmica de parâmetros
- Funcionamento em rede local (LAN)

---

## ✨ Funcionalidades Implementadas

### ✅ Core Features
- [x] **Descoberta de Modelos**: GET `/models` com lista dinâmica
- [x] **Filtro por Prefixo**: Filtrar modelos por namespace (ex: `gpt-oss/`, `qwen/`)
- [x] **Chat com Streaming**: POST `/chat/completions` com SSE em tempo real
- [x] **Markdown + Syntax Highlight**: Renderização avançada com `react-markdown` + `highlight.js`
- [x] **Configurações Completas**: UI para ajustar Base URL, API Key, Temperature, Max Tokens
- [x] **Context Window**: Novo seletor de janela de contexto (512-200k tokens)
- [x] **Persistência**: localStorage para salvar preferências
- [x] **Tratamento de Erros**: CORS, timeouts, desconexões
- [x] **Cancelamento**: Botão "Parar" para abortar requisições
- [x] **Design Responsivo**: Funciona em desktop, tablet, mobile

### ✨ Melhorias Recentes (3 Solicitações)
1. [x] **Botão de Cópia em Blocos de Código**: Cada bloco tem botão "📋 Copiar"
2. [x] **Toggle para Tags `<think>`**: Botão 💭 para ocultar/mostrar raciocínio
3. [x] **Seletor de Context Window**: Campo para ajustar tamanho da janela de contexto

---

## 📁 Estrutura do Projeto

```
lmstudio-front/
├── 📄 index.html                 # Entry HTML
├── 📄 vite.config.ts             # Config Vite com React
├── 📄 tsconfig.json              # TypeScript config
├── 📄 tsconfig.node.json         # TypeScript para Node
├── 📄 package.json               # Dependências
├── 📄 .env                       # Variáveis de ambiente
├── 📄 .env.example               # Template de .env
├── 📄 .eslintrc.cjs              # ESLint config
├── 📄 .prettierrc                # Prettier config
├── 📄 README.md                  # Documentação principal
├── 📄 GUIA_MELHORIAS.md          # Guia das 3 melhorias
├── 📄 MELHORIAS.md               # Detalhes técnicos
│
├── 📁 src/
│   ├── 📄 main.tsx               # Entry point React
│   ├── 📄 App.tsx                # App principal com layout
│   ├── 📄 App.css                # Estilos da aplicação
│   ├── 📄 index.css              # Estilos base
│   ├── 📄 vite-env.d.ts          # Tipos do Vite
│   │
│   ├── 📁 api/
│   │   └── 📄 lmstudio.ts        # Cliente LM Studio API
│   │                             # Functions: listModels, chatStream, checkConnection
│   │
│   ├── 📁 lib/
│   │   └── 📄 sse.ts             # Parser SSE para streaming
│   │                             # Functions: parseSSEStream, streamChatCompletions
│   │
│   ├── 📁 store/
│   │   └── 📄 settings.tsx       # Context API + localStorage
│   │                             # Context: SettingsProvider, useSettings hook
│   │
│   ├── 📁 types/
│   │   └── 📄 index.ts           # Tipos TypeScript completos
│   │                             # Interfaces: Model, ChatMessage, AppSettings, etc
│   │
│   └── 📁 components/
│       ├── 📄 App.tsx            # Layout principal
│       ├── 📄 Header.tsx         # Barra superior com configurações
│       ├── 📄 ModelSelect.tsx    # Sidebar com lista de modelos
│       ├── 📄 Chat.tsx           # Interface de chat
│       └── 📄 MarkdownMessage.tsx # Renderização de mensagens
│
└── 📁 public/
    └── 📄 vite.svg               # Logo (ignorável)
```

---

## 🛠 Stack Técnico

### Dependências
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-markdown": "^9.0.1",
  "remark-gfm": "^4.0.0",
  "highlight.js": "^11.9.0"
}
```

### Dev Dependencies
```json
{
  "@vitejs/plugin-react": "^4.2.1",
  "@types/react": "^18.2.43",
  "@types/react-dom": "^18.2.17",
  "typescript": "~5.9.3",
  "vite": "npm:rolldown-vite@7.1.14",
  "eslint": "^8.55.0",
  "prettier": "^3.1.1"
}
```

---

## 🚀 Como Usar

### 1️⃣ Instalação

```bash
cd lmstudio-front
npm install
```

### 2️⃣ Configurar LM Studio

1. Abra **LM Studio**
2. Vá em **Settings → Server**
3. Habilite: **CORS** ✓ e **Serve on LAN** ✓
4. Anote o IP (ex: `http://192.168.1.7:1234`)

### 3️⃣ Iniciar Servidor

```bash
npm run dev
```

**Output:**
```
  ➜  Local:   http://localhost:5174/
  ➜  Network: http://192.168.1.6:5174/
```

### 4️⃣ Acessar Aplicação

- **Local**: http://localhost:5174/
- **Rede LAN**: http://192.168.1.6:5174/ (de outra máquina)

### 5️⃣ Configurar Base URL (1ª vez)

1. Clique em **⚙️ Configurações**
2. Altere **"Base URL"** para `http://192.168.1.7:1234/v1`
3. Clique em **"✅ Salvar e Fechar"**
4. Selecione um modelo na sidebar
5. Comece a conversar! 💬

---

## 📊 Arquitetura

### Data Flow

```
User Input
    ↓
Chat Component (handleSend)
    ↓
Settings Context (modelo, temperatura, etc)
    ↓
API Layer (chatStream)
    ↓
Fetch + SSE Stream
    ↓
SSE Parser (sse.ts)
    ↓
Accumulate Chunks
    ↓
MarkdownMessage Component (renderiza)
    ↓
React Markdown + Highlight.js
    ↓
Display to User
```

### State Management

- **Settings Context**: Gerencia configurações globais
- **Component State**: chat messages, input, streaming status
- **localStorage**: Persistência de preferências

---

## 🎨 UI/UX Highlights

### Layout
```
┌────────────────────────────────────────────────┐
│ 🤖 LM Studio Client  ✅ Conectado  ⚙️ Config   │ ← Header
├──────────────┬────────────────────────────────┤
│              │                                │
│  Modelos     │  💬 Chat Interface           │
│  ────────    │  ─────────────────────        │
│ • gpt-oss/   │                                │
│ • qwen/      │  👤 Mensagem do usuário      │
│ • mistral    │                                │
│              │  🤖 Resposta com:             │
│ [🔄]         │  - Markdown                   │
│              │  - Syntax highlight          │
│              │  - [📋 Copiar]              │
│              │  - [💭 Thinking]            │
│              │                                │
│              │  [📤 Enviar]  [⏹️ Parar]     │
└──────────────┴────────────────────────────────┘
```

### Dark Theme
- Tema GitHub Dark (escuro profissional)
- Cores consistentes
- Acessibilidade WCAG AA

---

## 🔌 API Compatibility

### LM Studio OpenAI-compatible

**Endpoints Suportados:**

1. **GET /models**
   ```json
   {
     "object": "list",
     "data": [
       {"id": "model-name", "owned_by": "owner"}
     ]
   }
   ```

2. **POST /chat/completions**
   ```json
   {
     "model": "model-id",
     "messages": [
       {"role": "user", "content": "Hello"}
     ],
     "temperature": 0.7,
     "max_tokens": 2048,
     "stream": true
   }
   ```

### SSE Streaming
Suporta streaming com `data: {...}` delimitado por linhas vazias.
Trata `[DONE]` como marcador de fim.

---

## 📝 Variáveis de Ambiente

### .env
```env
VITE_LMS_BASE_URL=http://192.168.1.7:1234/v1
VITE_LMS_API_KEY=lm-studio
```

### Opções
- `VITE_LMS_BASE_URL`: URL base do LM Studio (obrigatório)
- `VITE_LMS_API_KEY`: Chave de API (padrão: lm-studio)

---

## 🧪 Testes

### Teste 1: Conexão
```
1. Abra aplicação
2. Verifique indicador de conexão no header
3. ✅ Deve mostrar "✅ Conectado (XXms)"
```

### Teste 2: Modelos
```
1. Clique em 🔄 (recarregar modelos)
2. Verifique se aparecem na sidebar
3. Selecione um modelo
4. ✅ Deve ser salvo automaticamente
```

### Teste 3: Chat com Streaming
```
1. Digite "Olá, como você está?"
2. Pressione Enter
3. Veja a resposta aparecer em tempo real
4. ✅ Deve renderizar Markdown
```

### Teste 4: Cópia de Código
```
1. Pedir código ao modelo
2. Clicar em "📋 Copiar"
3. Colar em editor
4. ✅ Código deve estar correto
```

### Teste 5: Thinking
```
1. Modelo com raciocínio
2. Clique em 💭 para expandir
3. ✅ Deve mostrar raciocínio em seção azul
```

---

## 🚢 Build para Produção

```bash
npm run build
```

**Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-XXXXX.js
│   └── index-XXXXX.css
└── vite.svg
```

**Deploy:** Copie a pasta `dist/` para seu servidor web (nginx, Apache, etc)

---

## 📦 Estrutura de Componentes React

### App.tsx
```
App
├── SettingsProvider (Context)
├── Header
│   ├── Status de conexão
│   ├── Configurações (expansível)
│   └── Botão de settings
├── App Body
│   ├── ModelSelect (Sidebar)
│   │   ├── Search bar
│   │   ├── Filtro de prefixo
│   │   ├── Lista de modelos
│   │   └── Contador
│   └── Chat (Main)
│       ├── Messages Container
│       ├── Message List
│       │   └── MarkdownMessage (repetido)
│       ├── Error Alert
│       ├── Token Counter
│       ├── Action Buttons
│       └── Chat Input (textarea + send)
```

---

## 🔐 Segurança

- ✅ Sem armazenamento de secrets no código
- ✅ Variáveis de ambiente (.env)
- ✅ CORS configurável no LM Studio
- ✅ API Key como Bearer token
- ✅ Sem requisições de terceiros

---

## ⚡ Performance

- **Vite**: Build ultrarrápido (HMR em tempo real)
- **React 18**: Renderização otimizada com Concurrent Features
- **Streaming**: Chunks processados incrementalmente
- **Lazy Loading**: CSS/JS otimizados
- **Bundle**: ~150KB gzipped (sem dependências pesadas)

---

## 🆘 Troubleshooting

### Erro: "❌ Desconectado"
- [ ] Verifique se LM Studio está rodando
- [ ] Confirme se CORS está habilitado
- [ ] Teste: `curl http://192.168.1.7:1234/v1/models`

### Nenhum modelo aparece
- [ ] Carregue um modelo no LM Studio
- [ ] Clique em 🔄 para recarregar
- [ ] Verifique console do browser (F12)

### Streaming não funciona
- [ ] Verifique se modelo suporta streaming
- [ ] Veja erros em F12 → Console
- [ ] Tente outro modelo

### Cópia de código não funciona
- [ ] Verifique permissões de clipboard
- [ ] Tente em outro navegador
- [ ] Recarregue a página (F5)

---

## 📚 Documentação Adicional

- **GUIA_MELHORIAS.md**: Detalhes das 3 melhorias implementadas
- **MELHORIAS.md**: Resumo técnico das mudanças
- **README.md**: Este arquivo

---

## 🤝 Contribuindo

Melhorias sugeridas são bem-vindas! Algumas ideias:

- [ ] Histórico de conversas
- [ ] Export de chats
- [ ] Temas customizáveis
- [ ] Suporte a embeddings
- [ ] Vision/image analysis
- [ ] Voice input/output

---

## 📄 License

MIT

---

## 🎉 Status

✅ **COMPLETO E PRONTO PARA USO**

- 100% das funcionalidades implementadas
- 3 melhorias conforme solicitado
- Sem erros TypeScript
- Compilando com sucesso
- Pronto para deploy

---

## 📞 Informações de Contato

Para suporte ou dúvidas sobre:
- **Frontend**: React/TypeScript
- **API Integration**: LM Studio OpenAI-compatible
- **Deployment**: Vite/Production

---

**Versão**: 1.0.0  
**Atualizado**: 28/10/2025  
**Status**: ✅ Production Ready
