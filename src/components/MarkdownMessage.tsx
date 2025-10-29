/**
 * Componente MarkdownMessage - Renderiza mensagens com Markdown e syntax highlighting
 */

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

interface MarkdownMessageProps {
  content: string
  role: 'user' | 'assistant' | 'system'
}

export function MarkdownMessage({ content, role }: MarkdownMessageProps) {
  const [showThinking, setShowThinking] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null)

  // Detecta se há tag <think> (completa ou incompleta)
  const hasThinking = /<think>/i.test(content)
  
  // Extrai todo o conteúdo dentro de <think>...</think> ou <think>...(até o fim se incompleto)
  let thinkingContent = ''
  let visibleContent = content
  
  if (hasThinking) {
    // Tenta pegar o conteúdo entre <think> e </think>
    const completeMatch = content.match(/<think>([\s\S]*?)<\/think>/i)
    if (completeMatch) {
      thinkingContent = completeMatch[1].trim()
      visibleContent = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
    } else {
      // Se não tem </think>, pega tudo depois de <think>
      const incompleteMatch = content.match(/<think>([\s\S]*?)$/i)
      if (incompleteMatch) {
        thinkingContent = incompleteMatch[1].trim()
        visibleContent = content.replace(/<think>[\s\S]*$/gi, '').trim()
      }
    }
  }

  // Aplica highlight após renderização
  useEffect(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      if (block instanceof HTMLElement && !block.dataset.highlighted) {
        hljs.highlightElement(block)
      }
    })
  }, [content, showThinking, visibleContent])
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopyFeedback('✅')
      setTimeout(() => setCopyFeedback(null), 1500)
    } catch (err) {
      console.error('Falha ao copiar:', err)
      setCopyFeedback('❌')
    }
  }

  const handleCopyCode = async (text: string, index?: number) => {
    console.log('📋 Tentando copiar código:', { text, index, length: text.length })
    
    try {
      // Verifica se clipboard API está disponível
      if (!navigator.clipboard) {
        console.error('❌ Clipboard API não disponível')
        throw new Error('Clipboard API não disponível')
      }
      
      await navigator.clipboard.writeText(text)
      console.log('✅ Código copiado com sucesso!')
      
      if (typeof index === 'number') {
        setCopiedCodeIndex(index)
        setTimeout(() => setCopiedCodeIndex(null), 2000)
      } else {
        setCopyFeedback('✅')
        setTimeout(() => setCopyFeedback(null), 1500)
      }
    } catch (err) {
      console.error('❌ Falha ao copiar código:', err)
      console.error('Tipo do erro:', typeof err, err)
      
      if (typeof index === 'number') {
        setCopiedCodeIndex(-1) // -1 indica erro
        setTimeout(() => setCopiedCodeIndex(null), 2000)
      } else {
        setCopyFeedback('❌')
      }
    }
  }

  return (
    <div className={`message message-${role}`}>
      <div className="message-avatar">{role === 'user' ? '👤' : '🤖'}</div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-role">{role === 'user' ? 'Você' : 'Assistente'}</span>
          <div className="message-actions">
            {hasThinking && (
              <button
                className="btn-icon-small"
                onClick={() => setShowThinking(!showThinking)}
                title={showThinking ? 'Ocultar pensamento' : 'Mostrar pensamento'}
              >
                {showThinking ? '🧠' : '💭'}
              </button>
            )}
            <button
              className="btn-copy"
              onClick={handleCopyMessage}
              title="Copiar mensagem"
            >
              {copyFeedback || '📋'}
            </button>
          </div>
        </div>

        {/* Seção de pensamento (thinking) */}
        {hasThinking && showThinking && (
          <div className="message-thinking">
            <div className="thinking-header">
              <span>🧠 Raciocínio</span>
              <button
                className="btn-copy-small"
                onClick={() => handleCopyCode(thinkingContent)}
                title="Copiar raciocínio"
              >
                📋
              </button>
            </div>
            <div className="thinking-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {thinkingContent}
              </ReactMarkdown>
            </div>
          </div>
        )}        <div className="message-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{              // Customiza renderização de código
              code({ inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '')
                const lang = match ? match[1] : ''
                
                // Extrai o texto do código de forma mais robusta
                let codeText = ''
                if (typeof children === 'string') {
                  codeText = children
                } else if (Array.isArray(children)) {
                  codeText = children.join('')
                } else {
                  codeText = String(children)
                }
                
                // Remove quebra de linha final se existir
                codeText = codeText.replace(/\n$/, '')
                
                // Gera um índice único baseado no conteúdo
                const codeIndex = codeText.length + codeText.charCodeAt(0)
                
                console.log('🔍 Código detectado:', { lang, length: codeText.length, preview: codeText.substring(0, 50) })

                return !inline ? (
                  <div className="code-block">
                    <div className="code-header">
                      {lang && <div className="code-lang">{lang}</div>}
                      <button
                        className={`btn-copy-code ${copiedCodeIndex === codeIndex ? 'copied' : ''}`}
                        onClick={(e) => {
                          e.preventDefault()
                          console.log('🖱️ Botão clicado! Copiando:', codeText.substring(0, 50))
                          handleCopyCode(codeText, codeIndex)
                        }}
                        title="Copiar código"
                      >
                        {copiedCodeIndex === codeIndex ? '✅ Copiado!' : 
                         copiedCodeIndex === -1 ? '❌ Erro' : 
                         '📋 Copiar'}
                      </button>
                    </div>
                    <pre>
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
              // Tabelas com estilo
              table({ children, ...props }) {
                return (
                  <div className="table-wrapper">
                    <table {...props}>{children}</table>
                  </div>
                )
              },
            }}
          >
            {visibleContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
