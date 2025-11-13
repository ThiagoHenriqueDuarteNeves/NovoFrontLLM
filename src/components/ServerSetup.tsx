/**
 * Componente ServerSetup - Configuração inicial obrigatória do servidor
 * Aparece na primeira execução ou quando não há servidor configurado
 */

import { useState } from 'react'
import { useSettings } from '../store/settings'
import { checkConnection } from '../api/lmstudio'

export function ServerSetup() {
  const { settings, updateSettings } = useSettings()
  const [serverUrl, setServerUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error'
    message: string
    latency?: number
  }>({
    status: 'idle',
    message: ''
  })

  const suggestedServers = [
    {
      name: 'Ngrok Tunnel (exemplo)',
      url: 'https://example.ngrok.app',
      description: 'Exemplo: Servidor via Ngrok (não pré-configurado)',
      icon: '🌐'
    },
    {
      name: 'Local LM Studio',
      url: 'http://localhost:1234',
      description: 'LM Studio rodando localmente',
      icon: '💻'
    },
    {
      name: 'Rede Local',
      url: 'http://192.168.1.7:1234',
      description: 'Servidor na rede local',
      icon: '🏠'
    }
  ]

  const formatUrl = (url: string) => {
    if (!url.trim()) return url

    // Remove trailing slash
    let cleanUrl = url.trim().replace(/\/$/, '')
    
    // Se já termina com /v1, retorna como está
    if (cleanUrl.endsWith('/v1')) {
      return cleanUrl
    }
    
    // Adiciona /v1 garantindo que há uma barra
    return `${cleanUrl}/v1`
  }

  const handleTestAndConnect = async () => {
    if (!serverUrl.trim()) {
      setConnectionStatus({
        status: 'error',
        message: '❌ Por favor, insira uma URL válida'
      })
      return
    }

    setIsLoading(true)
    setConnectionStatus({
      status: 'testing',
      message: '🔍 Testando conexão com o servidor...'
    })

    try {
      const formattedUrl = formatUrl(serverUrl.trim())
      const latency = await checkConnection(formattedUrl, settings.apiKey)
      
      if (latency !== null) {
        setConnectionStatus({
          status: 'success',
          message: `✅ Conexão estabelecida com sucesso!`,
          latency
        })

        // Salva a configuração e continua
        setTimeout(() => {
          updateSettings({ 
            baseUrl: formattedUrl,
            serverConfigured: true 
          })
        }, 1500)
      } else {
        setConnectionStatus({
          status: 'error',
          message: '❌ Não foi possível conectar ao servidor. Verifique a URL e tente novamente.'
        })
      }
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: `❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (url: string) => {
    setServerUrl(url)
    setConnectionStatus({ status: 'idle', message: '' })
  }

  const handleSkip = () => {
    // Usa a URL padrão local do LM Studio (localhost) se o usuário pular.
    // Também permite sobrescrever via VITE_LMS_BASE_URL em ambientes onde aplicável.
    const defaultLocal = import.meta.env.VITE_LMS_BASE_URL || 'http://localhost:1234/v1'
    updateSettings({ 
      baseUrl: defaultLocal,
      serverConfigured: true 
    })
  }

  return (
    <div className="server-setup-overlay">
      <div className="server-setup-modal">
        <div className="setup-header">
          <div className="setup-icon">🚀</div>
          <h1>Bem-vindo ao LM Studio Client</h1>
          <p>Para começar, configure o endereço do seu servidor de IA</p>
        </div>

        <div className="setup-content">
          <div className="suggestions-section">
            <label className="section-label">
              ⚡ Servidores Sugeridos (clique para selecionar):
            </label>
            <div className="suggestions-grid">
              {suggestedServers.map((server, index) => (
                <button
                  key={index}
                  className={`suggestion-btn ${serverUrl === server.url ? 'selected' : ''}`}
                  onClick={() => handleSuggestionClick(server.url)}
                  disabled={isLoading}
                >
                  <div className="suggestion-icon">{server.icon}</div>
                  <div className="suggestion-info">
                    <div className="suggestion-name">{server.name}</div>
                    <div className="suggestion-url">{server.url}</div>
                    <div className="suggestion-desc">{server.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="custom-section">
            <label className="section-label">
              🛠️ Ou insira uma URL personalizada:
            </label>
            <div className="url-input-container">
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => {
                  setServerUrl(e.target.value)
                  setConnectionStatus({ status: 'idle', message: '' })
                }}
                placeholder="https://seu-servidor.com"
                className="server-url-input"
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleTestAndConnect()
                  }
                }}
              />
              {serverUrl.trim() && !serverUrl.endsWith('/v1') && (
                <div className="url-preview">
                  📋 URL que será usada: <code>{formatUrl(serverUrl)}</code>
                </div>
              )}
            </div>
          </div>

          {connectionStatus.status !== 'idle' && (
            <div className={`connection-feedback ${connectionStatus.status}`}>
              <div className="feedback-message">
                {connectionStatus.message}
                {connectionStatus.latency && (
                  <span className="latency-info"> (Latência: {connectionStatus.latency}ms)</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="setup-actions">
          <button
            className="btn-skip"
            onClick={handleSkip}
            disabled={isLoading}
          >
            Pular (usar padrão)
          </button>
          <button
            className="btn-connect"
            onClick={handleTestAndConnect}
            disabled={!serverUrl.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner">⏳</span>
                Conectando...
              </>
            ) : (
              <>
                🔗 Testar e Conectar
              </>
            )}
          </button>
        </div>

        <div className="setup-footer">
          <small>
            💡 <strong>Dica:</strong> Você pode alterar o servidor a qualquer momento nas configurações
          </small>
        </div>
      </div>
    </div>
  )
}