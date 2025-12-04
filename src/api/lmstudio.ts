/**
 * Cliente para API do LM Studio (OpenAI-compatible)
 * Implementa listagem de modelos e chat streaming
 */

import type {
  ModelsResponse,
  ChatCompletionRequest,
  ChatCompletionChunk,
} from '../types'
import { streamChatCompletions } from '../lib/sse'

/**
 * Erro customizado para problemas de API
 */
export class LMStudioAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'LMStudioAPIError'
  }
}

/**
 * Detecta se a URL é um webhook (contém /webhook/ no caminho)
 */
function isWebhookUrl(url: string): boolean {
  return url.includes('/webhook/')
}

/**
 * Lista todos os modelos disponíveis no LM Studio
 * GET {baseUrl}/models
 * 
 * Se for um webhook, retorna um modelo padrão pois webhooks não têm endpoint /models
 */
export async function listModels(
  baseUrl: string,
  apiKey: string
): Promise<ModelsResponse> {
  try {
    // Se for um webhook, retorna um modelo padrão
    if (isWebhookUrl(baseUrl)) {
      console.log('🔗 Webhook detectado, usando modelo padrão')
      return {
        object: 'list',
        data: [
          {
            id: 'webhook-model',
            object: 'model',
            created: Date.now(),
            owned_by: 'webhook',
          }
        ]
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Adiciona Authorization header apenas se apiKey não for vazio
    if (apiKey && apiKey.trim()) {
      headers.Authorization = `Bearer ${apiKey}`
    }

    // Para ngrok, adiciona header específico
    if (baseUrl.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true'
    }

    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new LMStudioAPIError(
        `Falha ao listar modelos: ${response.statusText}`,
        response.status
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof LMStudioAPIError) {
      throw error
    }

    // Trata erros de rede/CORS
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new LMStudioAPIError(
        'Erro de rede. Verifique se o LM Studio está rodando e o CORS está habilitado.',
        undefined,
        error
      )
    }

    throw new LMStudioAPIError(
      'Erro desconhecido ao listar modelos',
      undefined,
      error
    )
  }
}

/**
 * Verifica conectividade com o LM Studio ou Webhook
 * Retorna latência em ms ou null se falhar
 */
export async function checkConnection(baseUrl: string, apiKey: string): Promise<number | null> {
  try {
    const start = performance.now()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Adiciona Authorization header apenas se apiKey não for vazio
    if (apiKey && apiKey.trim()) {
      headers.Authorization = `Bearer ${apiKey}`
    }

    // Para ngrok, adiciona header específico
    if (baseUrl.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true'
    }

    // Para webhooks, testa fazendo uma requisição simples OPTIONS ou HEAD
    if (isWebhookUrl(baseUrl)) {
      const response = await fetch(baseUrl, {
        method: 'HEAD',
        headers,
      })
      const end = performance.now()
      // Webhooks geralmente retornam 405 (Method Not Allowed) para HEAD, o que é ok
      if (response.ok || response.status === 405) {
        return Math.round(end - start)
      }
      return null
    }

    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers,
    })
    const end = performance.now()

    if (response.ok) {
      return Math.round(end - start)
    }
    return null
  } catch (error) {
    console.error('Erro ao verificar conexão:', error)
    return null
  }
}

/**
 * Inicia um chat completion com streaming
 * POST {baseUrl}/chat/completions (stream: true)
 * 
 * Retorna um async generator que emite chunks conforme chegam
 * O abort controller permite cancelar a requisição
 */
export async function* chatStream(
  baseUrl: string,
  apiKey: string,
  request: ChatCompletionRequest,
  abortController?: AbortController
): AsyncGenerator<ChatCompletionChunk> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Adiciona Authorization header apenas se apiKey não for vazio
    if (apiKey && apiKey.trim()) {
      headers.Authorization = `Bearer ${apiKey}`
    }

    // Para ngrok, adiciona header específico
    if (baseUrl.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true'
    }

    // Para webhooks, usa a URL diretamente. Para APIs OpenAI, adiciona /chat/completions
    const chatUrl = isWebhookUrl(baseUrl) ? baseUrl : `${baseUrl}/chat/completions`

    const response = await fetch(chatUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...request,
        stream: true, // Força streaming
      }),
      signal: abortController?.signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new LMStudioAPIError(
        `Falha no chat: ${response.statusText} - ${errorText}`,
        response.status
      )
    }

    if (!response.body) {
      throw new LMStudioAPIError('Resposta sem body')
    }

    // Consome stream SSE e emite chunks parseados
    yield* streamChatCompletions<ChatCompletionChunk>(response.body)
  } catch (error) {
    // Ignora erros de abort intencional
    if (error instanceof DOMException && error.name === 'AbortError') {
      return
    }

    if (error instanceof LMStudioAPIError) {
      throw error
    }

    // Trata erros de rede/CORS
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new LMStudioAPIError(
        'Erro de rede durante chat. Verifique a conexão com o LM Studio.',
        undefined,
        error
      )
    }

    throw new LMStudioAPIError('Erro desconhecido durante chat', undefined, error)
  }
}
