# 🔧 PROBLEMA DE CONEXÃO - SOLUÇÃO

## ❌ Problema Identificado
O front-end está mostrando "Desconectado" mesmo com LM Studio rodando.

## ✅ Causas Possíveis

### 1. localStorage com URL errada
O navegador pode ter salvado uma URL antiga no cache.

### 2. Variáveis de ambiente não carregadas
O Vite precisa ser reiniciado após mudanças no `.env`

### 3. Método HEAD não suportado (CORRIGIDO)
Mudei de `HEAD` para `GET` em `checkConnection()`

---

## 🚀 SOLUÇÃO RÁPIDA (3 passos)

### Passo 1: Abra a Página de Diagnóstico
```
http://192.168.1.6:5173/diagnostico.html
```

**Botões disponíveis:**
- 📋 Ver Configurações - Mostra o que está salvo
- 🔧 Corrigir URL - Força a URL correta
- 🗑️ Limpar Tudo - Reseta tudo
- 🔌 Testar Conexão - Testa se LM Studio responde

### Passo 2: Clique em "🔌 Testar Conexão"
Deve mostrar: ✅ Conexão OK! (Xms)

Se der erro, LM Studio não está respondendo.

### Passo 3: Se a URL estiver errada, clique em "🔧 Corrigir URL"
Depois recarregue a página principal.

---

## 🔍 Verificação Manual

### No Console do Navegador (F12):
```javascript
// Ver configurações salvas
localStorage.getItem('lmstudio-settings')

// Corrigir manualmente
localStorage.setItem('lmstudio-settings', JSON.stringify({
  baseUrl: 'http://192.168.1.7:1234/v1',
  apiKey: 'lm-studio',
  selectedModel: '',
  temperature: 0.7,
  maxTokens: 2048,
  contextWindow: 4096,
  systemPrompt: '',
  modelPrefixFilter: ''
}))

// Recarregar
location.reload()
```

---

## 📝 Mudanças Aplicadas

### Arquivo: `src/api/lmstudio.ts`
```typescript
// ANTES (linha 78-92):
export async function checkConnection(baseUrl: string, apiKey: string): Promise<number | null> {
  try {
    const start = performance.now()
    const response = await fetch(`${baseUrl}/models`, {
      method: 'HEAD',  // ❌ Alguns servidores não gostam de HEAD
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
    // ...
  }
}

// DEPOIS:
export async function checkConnection(baseUrl: string, apiKey: string): Promise<number | null> {
  try {
    const start = performance.now()
    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',  // ✅ GET é mais confiável
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
    const end = performance.now()

    if (response.ok) {
      return Math.round(end - start)
    }
    return null
  } catch (error) {
    console.error('Erro ao verificar conexão:', error)  // ✅ Log para debug
    return null
  }
}
```

---

## 🧪 Teste no Terminal

Confirme que LM Studio responde:
```powershell
Invoke-WebRequest -Uri "http://192.168.1.7:1234/v1/models" -Method GET
```

Deve retornar `StatusCode: 200` e lista de modelos.

---

## 🎯 Próximos Passos

1. ✅ Abra `http://192.168.1.6:5173/diagnostico.html`
2. ✅ Clique em "🔌 Testar Conexão"
3. ✅ Se OK, clique em "🔧 Corrigir URL"
4. ✅ Volte para `http://192.168.1.6:5173`
5. ✅ Faça hard refresh (Ctrl+Shift+R)

**Resultado esperado:**
Header deve mostrar: ✅ Conectado (Xms)

---

## 🆘 Se ainda não funcionar

### Debug no Console do Navegador:
1. Abra F12 (DevTools)
2. Vá na aba **Console**
3. Procure por erros em vermelho
4. Copie a mensagem de erro

### Possíveis erros:

#### "CORS policy"
**Solução:** No LM Studio → Settings → Enable CORS

#### "Failed to fetch"
**Solução:** LM Studio não está rodando ou URL errada

#### "net::ERR_CONNECTION_REFUSED"
**Solução:** Firewall bloqueando ou LM Studio em outro IP

---

## 📱 Testando do Celular

Depois de corrigir no PC, teste do celular:
```
http://192.168.1.6:5173
```

Se não funcionar:
1. Configure firewall (veja `fix-firewall.ps1`)
2. Certifique-se que celular está na mesma rede

---

**Status:** 
- ✅ Código corrigido (checkConnection GET)
- ✅ Página de diagnóstico criada
- ⚠️ Aguardando teste do usuário

**Data:** 28/10/2025 23:08
