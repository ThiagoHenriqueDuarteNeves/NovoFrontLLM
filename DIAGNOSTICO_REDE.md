# 🔧 Guia de Diagnóstico - Acesso via Rede Local

## Problema: Servidor só funciona em abas anônimas / não funciona no celular

### ✅ Correções Aplicadas

#### 1. **Bug no Toggle de Raciocínio** - CORRIGIDO
**Problema:** O botão "Raciocínio" estava mostrando a mensagem completa em vez de apenas o conteúdo dentro de `<think>...</think>`

**Solução:** 
- Linha 149 de `MarkdownMessage.tsx` corrigida
- Agora sempre mostra apenas `visibleContent` (sem as tags `<think>`)
- A seção de raciocínio mostra apenas `thinkingContent` (conteúdo dentro de `<think>`)

```tsx
// ANTES (ERRADO):
{visibleContent || content}  // ❌ Mostrava tudo se visibleContent estivesse vazio

// DEPOIS (CORRETO):
{visibleContent}  // ✅ Mostra apenas conteúdo sem <think>
```

#### 2. **Acesso via Rede Local** - DIAGNÓSTICO

---

## 🔍 Diagnóstico Passo a Passo

### Passo 1: Verificar se o servidor está rodando
```powershell
# No terminal do VS Code, você deve ver:
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.6:5173/
```

✅ **IP da rede:** `192.168.1.6` (use este no celular)

---

### Passo 2: Configurar Firewall do Windows

**Opção A: Script Automático (Recomendado)**
```powershell
# Execute como Administrador:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\fix-firewall.ps1
```

**Opção B: Manual**
1. Abra **Windows Defender Firewall**
2. Clique em **Configurações avançadas**
3. Clique em **Regras de Entrada** → **Nova Regra**
4. Tipo: **Porta**
5. Protocolo: **TCP**, Porta: **5173**
6. Ação: **Permitir conexão**
7. Perfil: Marque **todos**
8. Nome: **Vite Dev Server**

---

### Passo 3: Verificar Conexão de Rede

**No computador (PowerShell):**
```powershell
# Obter seu IP local
ipconfig | Select-String "IPv4"

# Verificar se a porta está aberta
netstat -an | Select-String "5173"
```

**No celular:**
1. Conecte na **mesma rede Wi-Fi**
2. Abra o navegador
3. Digite: `http://192.168.1.6:5173` (use seu IP real)

---

### Passo 4: Testar Conectividade

**Do celular, teste:**
```
http://192.168.1.6:5173
```

**Se não funcionar, teste o LM Studio diretamente:**
```
http://192.168.1.7:1234/v1/models
```

---

## 🚨 Problemas Comuns

### Problema: "ERR_CONNECTION_REFUSED"
**Causa:** Firewall bloqueando conexão

**Solução:**
1. Execute `fix-firewall.ps1` como Administrador
2. OU desative temporariamente o firewall para testar:
   ```powershell
   # Desativar (APENAS PARA TESTE):
   Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
   
   # Reativar depois:
   Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
   ```

---

### Problema: "ERR_CONNECTION_TIMED_OUT"
**Causa:** Computador e celular em redes diferentes

**Solução:**
1. Verifique se ambos estão na mesma rede Wi-Fi
2. Algumas redes bloqueiam comunicação entre dispositivos (ex: redes públicas)
3. Tente usar um hotspot do celular e conecte o PC nele

---

### Problema: "Funciona em aba anônima, não funciona em aba normal"
**Causa:** Cache do navegador ou service workers

**Solução no PC:**
```
1. Pressione Ctrl+Shift+Delete
2. Limpe "Imagens e arquivos em cache"
3. Limpe "Cookies e outros dados de sites"
4. Feche TODAS as abas do localhost:5173
5. Reabra
```

**Solução no celular:**
```
1. Configurações do navegador → Limpar dados
2. OU use aba anônima
```

---

### Problema: LM Studio não responde
**Causa:** LM Studio não configurado para aceitar conexões de rede

**Solução:**
1. Abra LM Studio
2. Vá em **Settings** → **Server**
3. Marque **"Enable CORS"**
4. Marque **"Network accessible"**
5. Restart o servidor

---

## 🧪 Testes Rápidos

### Teste 1: Servidor Local
```bash
# No navegador do PC:
http://localhost:5173
```
✅ Deve funcionar

### Teste 2: IP Local no PC
```bash
# No navegador do PC:
http://192.168.1.6:5173
```
✅ Deve funcionar (se funcionar, firewall está OK)

### Teste 3: IP Local no Celular
```bash
# No navegador do celular:
http://192.168.1.6:5173
```
✅ Se falhar aqui, problema é:
- Firewall do Windows
- Rede isolando dispositivos
- IP errado

---

## 📱 Configuração Ideal para Rede Local

### No arquivo `.env`:
```env
VITE_BASE_URL=http://192.168.1.7:1234/v1
```

### No LM Studio:
- ✅ Server running
- ✅ CORS enabled
- ✅ Network accessible
- ✅ Listen on: `0.0.0.0:1234` (não `localhost`)

### No Windows:
- ✅ Firewall porta 5173 liberada
- ✅ Rede configurada como "Privada" (não "Pública")

---

## 🎯 Comandos Úteis

### Ver regras do firewall:
```powershell
netsh advfirewall firewall show rule name=all | Select-String "5173"
```

### Ver conexões ativas:
```powershell
netstat -ano | Select-String "5173"
```

### Ver IP local:
```powershell
(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*","Ethernet*" | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress
```

### Testar conectividade:
```powershell
# Do celular, via navegador:
http://192.168.1.6:5173

# Do PC, testar LM Studio:
curl http://192.168.1.7:1234/v1/models
```

---

## ✅ Checklist Final

Antes de testar no celular:

- [ ] Servidor Vite rodando (`npm run dev`)
- [ ] IP de rede aparecendo no terminal
- [ ] Firewall configurado (executou `fix-firewall.ps1`)
- [ ] LM Studio rodando com CORS enabled
- [ ] Celular na mesma rede Wi-Fi
- [ ] Cache do navegador limpo
- [ ] Testou no PC primeiro (`http://192.168.1.6:5173`)

---

## 🆘 Ainda não funciona?

### Solução Alternativa: Usar Ngrok
```bash
# Instalar ngrok
choco install ngrok

# Expor porta 5173
ngrok http 5173

# Usar a URL fornecida (ex: https://abc123.ngrok.io)
```

### Solução Alternativa: Usar Hotspot
1. Ative hotspot no celular
2. Conecte o PC no hotspot
3. Acesse via IP do hotspot

---

## 📝 Resumo das Mudanças

### Arquivo: `MarkdownMessage.tsx`
```tsx
// LINHA 149 - CORRIGIDA
// Antes: {visibleContent || content}
// Depois: {visibleContent}
```

**Comportamento esperado:**
- Mensagem normal: Exibe texto SEM as tags `<think>`
- Botão 💭: Aparece apenas se houver `<think>` na mensagem
- Ao clicar 🧠: Exibe APENAS o conteúdo dentro de `<think>...</think>`

### Arquivo: `vite.config.ts`
```ts
server: {
  host: true, // ✅ Já estava correto
}
```

---

## 🎉 Resultado Esperado

Após as correções:

✅ **Toggle de Raciocínio:**
- Exibe apenas conteúdo de `<think>` quando expandido
- Conteúdo normal não inclui tags `<think>`

✅ **Acesso via Rede:**
- PC: `http://localhost:5173`
- Celular: `http://192.168.1.6:5173`
- Ambos funcionam perfeitamente

---

**Data:** 28/10/2025  
**Status:** ✅ Corrigido e Documentado
