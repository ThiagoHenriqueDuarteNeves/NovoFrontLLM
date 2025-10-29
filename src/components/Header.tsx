/**
 * Componente Header - Barra superior com configurações
 */

import { useState, useEffect } from 'react'
import { useSettings } from '../store/settings'
import { checkConnection } from '../api/lmstudio'

export function Header() {
  const { settings, updateSettings } = useSettings()
  const [isExpanded, setIsExpanded] = useState(false)
  const [latency, setLatency] = useState<number | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  // Verifica conectividade periodicamente
  useEffect(() => {
    const checkLatency = async () => {
      if (!settings.baseUrl) return
      setIsChecking(true)
      const result = await checkConnection(settings.baseUrl, settings.apiKey)
      setLatency(result)
      setIsChecking(false)
    }

    checkLatency()
    const interval = setInterval(checkLatency, 30000) // A cada 30s

    return () => clearInterval(interval)
  }, [settings.baseUrl, settings.apiKey])

  const handleSave = () => {
    setIsExpanded(false)
    // As configurações já são salvas automaticamente pelo Context
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>🤖 LM Studio Client</h1>
          <div className="connection-status">
            {isChecking ? (
              <span className="status-checking">⏳ Verificando...</span>
            ) : latency !== null ? (
              <span className="status-connected">✅ Conectado ({latency}ms)</span>
            ) : (
              <span className="status-disconnected">❌ Desconectado</span>
            )}
          </div>
        </div>

        <button
          className="btn-settings"
          onClick={() => setIsExpanded(!isExpanded)}
          title="Configurações"
        >
          ⚙️ Configurações
        </button>
      </div>

      {isExpanded && (
        <div className="settings-panel">
          <div className="settings-grid">
            <div className="setting-item">
              <label>
                Base URL
                <input
                  type="text"
                  value={settings.baseUrl}
                  onChange={(e) => updateSettings({ baseUrl: e.target.value })}
                  placeholder="http://192.168.1.7:1234/v1"
                />
              </label>
              <small>URL do LM Studio (incluindo /v1)</small>
            </div>

            <div className="setting-item">
              <label>
                API Key
                <input
                  type="text"
                  value={settings.apiKey}
                  onChange={(e) => updateSettings({ apiKey: e.target.value })}
                  placeholder="lm-studio"
                />
              </label>
              <small>Chave de API (padrão: lm-studio)</small>
            </div>

            <div className="setting-item">
              <label>
                Temperature
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                />
              </label>
              <small>Criatividade (0-2)</small>
            </div>

            <div className="setting-item">
              <label>
                Max Tokens
                <input
                  type="number"
                  min="1"
                  max="32000"
                  step="128"
                  value={settings.maxTokens}
                  onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
                />
              </label>
              <small>Limite de tokens na resposta</small>
            </div>

            <div className="setting-item">
              <label>
                Context Window
                <input
                  type="number"
                  min="512"
                  max="200000"
                  step="512"
                  value={settings.contextWindow}
                  onChange={(e) => updateSettings({ contextWindow: parseInt(e.target.value) })}
                />
              </label>
              <small>Tamanho da janela de contexto (tokens)</small>
            </div>

            <div className="setting-item full-width">
              <label>
                System Prompt
                <textarea
                  value={settings.systemPrompt}
                  onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
                  placeholder="Você é um assistente útil..."
                  rows={3}
                />
              </label>
              <small>Instrução inicial para o modelo</small>
            </div>

            <div className="setting-item">
              <label>
                Filtro de Prefixo
                <input
                  type="text"
                  value={settings.modelPrefixFilter}
                  onChange={(e) => updateSettings({ modelPrefixFilter: e.target.value })}
                  placeholder="gpt-oss/, qwen/, openai/"
                />
              </label>
              <small>Filtrar modelos por prefixo (ex: gpt-oss/)</small>
            </div>
          </div>

          <div className="settings-actions">
            <button className="btn-primary" onClick={handleSave}>
              ✅ Salvar e Fechar
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
