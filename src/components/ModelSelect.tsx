/**
 * Componente ModelSelect - Sidebar para selecionar modelos
 */

import { useState, useEffect } from 'react'
import { useSettings } from '../store/settings'
import { listModels, LMStudioAPIError } from '../api/lmstudio'
import type { Model } from '../types'

interface ModelSelectProps {
  isOpen?: boolean
  onClose?: () => void
}

export function ModelSelect({ isOpen = false, onClose }: ModelSelectProps) {
  const { settings, updateSettings } = useSettings()
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const loadModels = async () => {
    if (!settings.baseUrl) {
      setError('Configure a Base URL primeiro')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Primeiro teste a conexão
      const connectionTest = await fetch(`${settings.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
          ...(settings.apiKey && { 'Authorization': `Bearer ${settings.apiKey}` })
        }
      })

      if (!connectionTest.ok) {
        throw new Error(`Erro HTTP ${connectionTest.status}: ${connectionTest.statusText}`)
      }

      // Consume response to avoid memory leak
      await connectionTest.json()

      const response = await listModels(settings.baseUrl, settings.apiKey)
      setModels(response.data)

      // Se não há modelo selecionado, seleciona o primeiro
      if (!settings.selectedModel && response.data.length > 0) {
        updateSettings({ selectedModel: response.data[0].id })
      }

      if (response.data.length === 0) {
        setError('⚠️ Nenhum modelo disponível no servidor. Verifique se há modelos carregados no LM Studio.')
      }
    } catch (err) {
      if (err instanceof LMStudioAPIError) {
        setError(`❌ ${err.message}`)
      } else {
        setError(`❌ Erro ao carregar modelos: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Carrega modelos ao montar e quando Base URL mudar
  useEffect(() => {
    loadModels()
  }, [settings.baseUrl, settings.apiKey])

  // Filtra modelos baseado em search term e prefixo configurado
  const filteredModels = models.filter((model) => {
    const matchesSearch = model.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPrefix = settings.modelPrefixFilter
      ? model.id.startsWith(settings.modelPrefixFilter)
      : true
    return matchesSearch && matchesPrefix
  })

  const handleModelSelect = (modelId: string) => {
    updateSettings({ selectedModel: modelId })
    // Fecha a sidebar em mobile após selecionar
    if (onClose) {
      onClose()
    }
  }

  return (
    <aside className={`model-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Modelos</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onClose && (
            <button
              onClick={onClose}
              className="btn-icon btn-close-sidebar"
              title="Fechar menu"
              aria-label="Fechar menu de modelos"
            >
              ✕
            </button>
          )}

          <button
            onClick={loadModels}
            disabled={loading}
            className="btn-icon"
            title="Recarregar modelos"
          >
            {loading ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Buscar modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.8 }}>
            📍 URL: {settings.baseUrl}
          </div>
        </div>
      )}

      {settings.modelPrefixFilter && (
        <div className="prefix-filter-info">
          📌 Filtro ativo: <code>{settings.modelPrefixFilter}</code>
        </div>
      )}

      <div className="models-list">
        {loading ? (
          <div className="loading-state">Carregando modelos...</div>
        ) : filteredModels.length === 0 ? (
          <div className="empty-state">
            {models.length === 0 ? 'Nenhum modelo disponível' : 'Nenhum modelo encontrado'}
          </div>
        ) : (
          filteredModels.map((model) => (
            <button
              key={model.id}
              className={`model-item ${settings.selectedModel === model.id ? 'selected' : ''}`}
              onClick={() => handleModelSelect(model.id)}
            >
              <div className="model-id">{model.id}</div>
              {model.owned_by && <div className="model-owner">by {model.owned_by}</div>}
            </button>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <small>
          {filteredModels.length} modelo{filteredModels.length !== 1 ? 's' : ''} de {models.length}
        </small>
      </div>
    </aside>
  )
}
