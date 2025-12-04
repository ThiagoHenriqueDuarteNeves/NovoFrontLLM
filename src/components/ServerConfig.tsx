/**
 * Componente ServerConfig - Interface para configurar o servidor da API
 */

import { useState } from 'react'
import { useSettings } from '../store/settings'
import { checkConnection } from '../api/lmstudio'

export function ServerConfig() {
  const { settings, updateSettings } = useSettings()
  const [isExpanded, setIsExpanded] = useState(false)
  const [tempUrl, setTempUrl] = useState(settings.baseUrl)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error'
    message: string
    latency?: number
  }>({
    status: 'idle',
    message: ''
  })

  const presetServers = [
    {
      name: 'Ngrok Server (Padrão)',
      url: 'https://37a0702aef57.ngrok-free.app/v1',
      description: 'Servidor via Ngrok tunnel'
    },
    {
      name: 'Local LM Studio',
      url: 'http://localhost:1234/v1',
      description: 'LM Studio rodando localmente'
    },
    {
      name: 'Rede Local',
      url: 'http://192.168.1.7:1234/v1',
      description: 'LM Studio na rede local'
    }
  ]

  const handleTestConnection = async () => {
    if (!tempUrl.trim()) {
      setConnectionStatus({
        status: 'error',
        message: 'Por favor, insira uma URL válida'
      })
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus({
      status: 'testing',
      message: 'Testando conexão...'
    })

    try {
      const latency = await checkConnection(tempUrl, settings.apiKey)
      
      if (latency !== null) {
        setConnectionStatus({
          status: 'success',
          message: `✅ Conexão bem-sucedida!`,
          latency
        })
      } else {
        setConnectionStatus({
          status: 'error',
          message: '❌ Falha na conexão. Verifique a URL e se o servidor está rodando.'
        })
      }
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: `❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSaveAndClose = () => {
    updateSettings({ baseUrl: tempUrl.trim() })
    setIsExpanded(false)
    setConnectionStatus({ status: 'idle', message: '' })
  }

  const handlePresetSelect = (url: string) => {
    setTempUrl(url)
    setConnectionStatus({ status: 'idle', message: '' })
  }

  const formatUrl = (url: string) => {
    if (!url.trim()) return url

    // Remove trailing slash
    let cleanUrl = url.trim().replace(/\/$/, '')
    
    // TESTE: Desabilitado temporariamente - para reverter, descomente as linhas abaixo
    /*
    // Se já termina com /v1, retorna como está
    if (cleanUrl.endsWith('/v1')) {
      return cleanUrl
    }
    
    // Adiciona /v1 garantindo que há uma barra
    return `${cleanUrl}/v1`
    */
    
    // Retorna URL sem adicionar /v1 (TESTE)
    return cleanUrl
  }

  return (
    <div className="server-config">
      <button
        className="btn-server-config"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Configurar Servidor da API"
      >
        🌐 Servidor API
      </button>

      {isExpanded && (
        <div className="server-config-panel">
          <div className="panel-header">
            <h3>🌐 Configuração do Servidor da API</h3>
            <p>Configure o endereço do servidor que hospeda sua API compatível com OpenAI</p>
          </div>

          <div className="current-server">
            <label>📍 Servidor Atual:</label>
            <div className="current-url">{settings.baseUrl}</div>
          </div>

          <div className="preset-servers">
            <label>⚡ Servidores Pré-configurados:</label>
            <div className="preset-grid">
              {presetServers.map((preset, index) => (
                <button
                  key={index}
                  className={`preset-btn ${tempUrl === preset.url ? 'active' : ''}`}
                  onClick={() => handlePresetSelect(preset.url)}
                >
                  <div className="preset-name">{preset.name}</div>
                  <div className="preset-url">{preset.url}</div>
                  <div className="preset-desc">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="custom-server">
            <label>🛠️ URL Personalizada:</label>
            <div className="url-input-group">
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => {
                  setTempUrl(e.target.value)
                  setConnectionStatus({ status: 'idle', message: '' })
                }}
                onBlur={(e) => setTempUrl(formatUrl(e.target.value))}
                placeholder="https://seu-servidor.com/v1"
                className="url-input"
              />
              <button
                className="btn-test"
                onClick={handleTestConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? '⏳' : '🔍'} Testar
              </button>
            </div>
            
            {tempUrl.trim() && !tempUrl.endsWith('/v1') && (
              <div className="url-preview">
                📋 URL que será usada: <code>{formatUrl(tempUrl)}</code>
              </div>
            )}
            
            {connectionStatus.status !== 'idle' && (
              <div className={`connection-result ${connectionStatus.status}`}>
                {connectionStatus.message}
                {connectionStatus.latency && (
                  <span className="latency"> ({connectionStatus.latency}ms)</span>
                )}
              </div>
            )}
          </div>

          <div className="panel-actions">
            <button
              className="btn-cancel"
              onClick={() => {
                setTempUrl(settings.baseUrl)
                setIsExpanded(false)
                setConnectionStatus({ status: 'idle', message: '' })
              }}
            >
              ❌ Cancelar
            </button>
            <button
              className="btn-save"
              onClick={handleSaveAndClose}
              disabled={!tempUrl.trim()}
            >
              ✅ Salvar e Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}