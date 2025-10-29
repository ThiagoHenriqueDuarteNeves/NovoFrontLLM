/**
 * Componente Chat - Interface principal de conversação
 */

import { useState, useRef, useEffect } from 'react'
import { useSettings } from '../store/settings'
import { chatStream, LMStudioAPIError } from '../api/lmstudio'
import { MarkdownMessage } from './MarkdownMessage'
import type { ChatMessage } from '../types'

export function Chat() {
  const { settings } = useSettings()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<{ prompt: number; completion: number } | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const autoScrollTimeoutRef = useRef<number | null>(null)

  // Auto-scroll inteligente: para quando usuário scrolla manualmente
  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50 // Margem de 50px

      if (isAtBottom) {
        // Usuário está no fundo, ativa auto-scroll
        if (!autoScroll) {
          setAutoScroll(true)
        }
        // Limpa timeout anterior se existir
        if (autoScrollTimeoutRef.current) {
          clearTimeout(autoScrollTimeoutRef.current)
        }
      } else {
        // Usuário scrollou para cima, desativa auto-scroll
        if (autoScroll) {
          setAutoScroll(false)
        }        // Se usuário voltar ao fundo por 1 segundo, reativa auto-scroll
        if (autoScrollTimeoutRef.current) {
          clearTimeout(autoScrollTimeoutRef.current)
        }
        autoScrollTimeoutRef.current = window.setTimeout(() => {
          const { scrollTop, scrollHeight, clientHeight } = container
          const stillAtBottom = scrollHeight - scrollTop - clientHeight < 50
          if (stillAtBottom) {
            setAutoScroll(true)
          }
        }, 1000)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current)
      }
    }
  }, [autoScroll])

  // Auto-scroll apenas se habilitado
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, autoScroll])

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return

    if (!settings.selectedModel) {
      setError('Selecione um modelo primeiro')
      return
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    }

    // Adiciona mensagem do usuário
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setError(null)
    setIsStreaming(true)

    // Prepara mensagens para envio (inclui system prompt se configurado)
    const apiMessages: ChatMessage[] = settings.systemPrompt
      ? [{ role: 'system', content: settings.systemPrompt }, ...newMessages]
      : newMessages

    // Cria placeholder para resposta do assistente
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
    }
    setMessages([...newMessages, assistantMessage])

    // Cria abort controller para poder cancelar
    abortControllerRef.current = new AbortController()

    try {      // Stream da resposta
      const stream = chatStream(
        settings.baseUrl,
        settings.apiKey,
        {
          model: settings.selectedModel,
          messages: apiMessages,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          stream: true,
        },
        abortControllerRef.current
      )

      let accumulatedContent = ''

      for await (const chunk of stream) {
        // Extrai conteúdo do delta
        const delta = chunk.choices[0]?.delta?.content
        if (delta) {
          accumulatedContent += delta

          // Atualiza mensagem do assistente incrementalmente
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: accumulatedContent,
            }
            return updated
          })
        }

        // Captura usage se disponível (geralmente no último chunk)
        if ((chunk as any).usage) {
          setUsage({
            prompt: (chunk as any).usage.prompt_tokens,
            completion: (chunk as any).usage.completion_tokens,
          })
        }
      }
    } catch (err) {
      if (err instanceof LMStudioAPIError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro desconhecido durante o chat')
      }

      // Remove mensagem do assistente se houve erro
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsStreaming(false)
    }
  }

  const handleClear = () => {
    setMessages([])
    setUsage(null)
    setError(null)
  }

  const handleResend = () => {
    if (messages.length >= 2) {
      // Pega última mensagem do usuário
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.role === 'user')

      if (lastUserMessage) {
        // Remove última troca (user + assistant)
        const withoutLast = messages.slice(0, -2)
        setMessages(withoutLast)
        setInput(lastUserMessage.content)
      }
    }
  }

  // Enter envia, Shift+Enter quebra linha
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  return (
    <main className="chat-container">
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="empty-chat">
            <h2>👋 Bem-vindo!</h2>
            <p>Selecione um modelo e comece a conversar</p>
          </div>
        ) : (
          messages.map((msg, idx) => <MarkdownMessage key={idx} content={msg.content} role={msg.role} />)
        )}

        {isStreaming && (
          <div className="streaming-indicator">
            <span className="pulse">⏳</span> Gerando resposta...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {!autoScroll && (
        <div className="scroll-notice">
          ⬇️ Auto-scroll pausado - Role para baixo para reativar
        </div>
      )}

      {error && (
        <div className="chat-error">
          ❌ <strong>Erro:</strong> {error}
        </div>
      )}

      <div className="chat-footer">
        {usage && (
          <div className="chat-stats">
            📊 Tokens: {usage.prompt} prompt + {usage.completion} completion ={' '}
            {usage.prompt + usage.completion} total
          </div>
        )}

        <div className="chat-actions">
          {messages.length > 0 && (
            <>
              <button onClick={handleClear} disabled={isStreaming} className="btn-secondary">
                🗑️ Limpar
              </button>
              <button onClick={handleResend} disabled={isStreaming || messages.length < 2} className="btn-secondary">
                🔄 Reenviar
              </button>
            </>
          )}
          {isStreaming && (
            <button onClick={handleStop} className="btn-danger">
              ⏹️ Parar
            </button>
          )}
        </div>

        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para quebrar linha)"
            disabled={isStreaming}
            rows={3}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming || !settings.selectedModel}
            className="btn-send"
          >
            📤 Enviar
          </button>
        </div>

        <small className="chat-hint">
          Modelo: <strong>{settings.selectedModel || 'Nenhum selecionado'}</strong> | Temp:{' '}
          {settings.temperature}
        </small>
      </div>
    </main>
  )
}
