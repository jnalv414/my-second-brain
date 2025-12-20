import { useCallback, useState } from 'react'
import { flushSync } from 'react-dom'

/**
 * Chat state management hook
 *
 * Manages chat messages, loading state, and message operations
 * for the AI chat interface.
 */

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  sendMessage: (content: string) => Promise<void>
  addAIMessage: (content: string) => void
  clearMessages: () => void
}

/**
 * Generates a unique ID for messages
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Hook for managing chat state and operations
 *
 * @returns Chat state and operations
 *
 * @example
 * ```tsx
 * const { messages, isLoading, sendMessage, clearMessages } = useChat()
 *
 * await sendMessage("Hello, Paddy!")
 * ```
 */
export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    // Use flushSync to ensure isLoading is visible synchronously
    flushSync(() => {
      setIsLoading(true)
    })

    const newMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])

    // Simulate async operation (in a real implementation, this would call an API)
    await Promise.resolve()

    setIsLoading(false)
  }, [])

  const addAIMessage = useCallback((content: string): void => {
    const newMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
  }, [])

  const clearMessages = useCallback((): void => {
    setMessages([])
    setIsLoading(false)
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    addAIMessage,
    clearMessages,
  }
}
