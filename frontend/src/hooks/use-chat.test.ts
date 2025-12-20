import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useChat } from './use-chat'

describe('useChat', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ============================================================
  // TC-CHAT-001: Initial State
  // ============================================================
  describe('initial state', () => {
    it('should initialize with empty messages array', () => {
      // Arrange & Act
      const { result } = renderHook(() => useChat())

      // Assert
      expect(result.current.messages).toEqual([])
    })

    it('should initialize with isLoading set to false', () => {
      // Arrange & Act
      const { result } = renderHook(() => useChat())

      // Assert
      expect(result.current.isLoading).toBe(false)
    })

    it('should provide sendMessage function', () => {
      // Arrange & Act
      const { result } = renderHook(() => useChat())

      // Assert
      expect(typeof result.current.sendMessage).toBe('function')
    })

    it('should provide addAIMessage function', () => {
      // Arrange & Act
      const { result } = renderHook(() => useChat())

      // Assert
      expect(typeof result.current.addAIMessage).toBe('function')
    })

    it('should provide clearMessages function', () => {
      // Arrange & Act
      const { result } = renderHook(() => useChat())

      // Assert
      expect(typeof result.current.clearMessages).toBe('function')
    })
  })

  // ============================================================
  // TC-CHAT-002: sendMessage
  // ============================================================
  describe('sendMessage', () => {
    it('should add a user message to the messages array', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())
      const messageContent = 'Hello, Paddy!'

      // Act
      await act(async () => {
        await result.current.sendMessage(messageContent)
      })

      // Assert
      expect(result.current.messages).toHaveLength(1)
      expect(result.current.messages[0].role).toBe('user')
      expect(result.current.messages[0].content).toBe(messageContent)
    })

    it('should generate a unique id for each message', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())

      // Act
      await act(async () => {
        await result.current.sendMessage('First message')
        await result.current.sendMessage('Second message')
      })

      // Assert
      expect(result.current.messages).toHaveLength(2)
      expect(result.current.messages[0].id).toBeDefined()
      expect(result.current.messages[1].id).toBeDefined()
      expect(result.current.messages[0].id).not.toBe(
        result.current.messages[1].id,
      )
    })

    it('should set timestamp to current date', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())
      const now = new Date('2024-01-15T10:00:00Z')
      vi.setSystemTime(now)

      // Act
      await act(async () => {
        await result.current.sendMessage('Test message')
      })

      // Assert
      expect(result.current.messages[0].timestamp).toEqual(now)
    })

    it('should set isLoading to true while sending', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())
      let loadingDuringSend = false

      // Act
      await act(async () => {
        const sendPromise = result.current.sendMessage('Test message')
        // Check loading state immediately after starting send
        loadingDuringSend = result.current.isLoading
        await sendPromise
      })

      // Assert
      expect(loadingDuringSend).toBe(true)
    })

    it('should set isLoading to false after sending completes', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())

      // Act
      await act(async () => {
        await result.current.sendMessage('Test message')
      })

      // Assert
      expect(result.current.isLoading).toBe(false)
    })

    it('should append messages in order', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())

      // Act
      await act(async () => {
        await result.current.sendMessage('First')
        await result.current.sendMessage('Second')
        await result.current.sendMessage('Third')
      })

      // Assert
      expect(result.current.messages).toHaveLength(3)
      expect(result.current.messages[0].content).toBe('First')
      expect(result.current.messages[1].content).toBe('Second')
      expect(result.current.messages[2].content).toBe('Third')
    })

    // Edge case: Empty message
    it('should handle empty string message', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())

      // Act
      await act(async () => {
        await result.current.sendMessage('')
      })

      // Assert - should still add the message (validation is UI concern)
      expect(result.current.messages).toHaveLength(1)
      expect(result.current.messages[0].content).toBe('')
    })

    // Edge case: Whitespace-only message
    it('should handle whitespace-only message', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())

      // Act
      await act(async () => {
        await result.current.sendMessage('   ')
      })

      // Assert
      expect(result.current.messages).toHaveLength(1)
      expect(result.current.messages[0].content).toBe('   ')
    })

    // Edge case: Very long message
    it('should handle very long message content', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())
      const longMessage = 'a'.repeat(10000)

      // Act
      await act(async () => {
        await result.current.sendMessage(longMessage)
      })

      // Assert
      expect(result.current.messages[0].content).toBe(longMessage)
    })

    // Edge case: Special characters
    it('should handle special characters and unicode', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())
      const specialContent =
        "Hello! <script>alert('xss')</script> & \"quotes\" 'apostrophes' \n\t unicode: \u{1F600}"

      // Act
      await act(async () => {
        await result.current.sendMessage(specialContent)
      })

      // Assert
      expect(result.current.messages[0].content).toBe(specialContent)
    })
  })

  // ============================================================
  // TC-CHAT-003: addAIMessage
  // ============================================================
  describe('addAIMessage', () => {
    it('should add an assistant message to the messages array', () => {
      // Arrange
      const { result } = renderHook(() => useChat())
      const aiResponse = 'Hello! How can I help you today?'

      // Act
      act(() => {
        result.current.addAIMessage(aiResponse)
      })

      // Assert
      expect(result.current.messages).toHaveLength(1)
      expect(result.current.messages[0].role).toBe('assistant')
      expect(result.current.messages[0].content).toBe(aiResponse)
    })

    it('should generate a unique id for AI messages', () => {
      // Arrange
      const { result } = renderHook(() => useChat())

      // Act
      act(() => {
        result.current.addAIMessage('First AI response')
        result.current.addAIMessage('Second AI response')
      })

      // Assert
      expect(result.current.messages[0].id).toBeDefined()
      expect(result.current.messages[1].id).toBeDefined()
      expect(result.current.messages[0].id).not.toBe(
        result.current.messages[1].id,
      )
    })

    it('should set timestamp for AI messages', () => {
      // Arrange
      const { result } = renderHook(() => useChat())
      const now = new Date('2024-01-15T10:00:00Z')
      vi.setSystemTime(now)

      // Act
      act(() => {
        result.current.addAIMessage('AI response')
      })

      // Assert
      expect(result.current.messages[0].timestamp).toEqual(now)
    })

    it('should append AI message after user messages', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())

      // Act
      await act(async () => {
        await result.current.sendMessage('User question')
      })
      act(() => {
        result.current.addAIMessage('AI answer')
      })

      // Assert
      expect(result.current.messages).toHaveLength(2)
      expect(result.current.messages[0].role).toBe('user')
      expect(result.current.messages[1].role).toBe('assistant')
    })

    it('should not affect isLoading state', () => {
      // Arrange
      const { result } = renderHook(() => useChat())

      // Act
      act(() => {
        result.current.addAIMessage('AI response')
      })

      // Assert
      expect(result.current.isLoading).toBe(false)
    })
  })

  // ============================================================
  // TC-CHAT-004: clearMessages
  // ============================================================
  describe('clearMessages', () => {
    it('should remove all messages from the array', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())
      await act(async () => {
        await result.current.sendMessage('Message 1')
        await result.current.sendMessage('Message 2')
      })
      act(() => {
        result.current.addAIMessage('AI response')
      })

      // Act
      act(() => {
        result.current.clearMessages()
      })

      // Assert
      expect(result.current.messages).toEqual([])
    })

    it('should work when messages array is already empty', () => {
      // Arrange
      const { result } = renderHook(() => useChat())

      // Act - should not throw
      act(() => {
        result.current.clearMessages()
      })

      // Assert
      expect(result.current.messages).toEqual([])
    })

    it('should reset isLoading to false', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())
      await act(async () => {
        await result.current.sendMessage('Message')
      })

      // Act
      act(() => {
        result.current.clearMessages()
      })

      // Assert
      expect(result.current.isLoading).toBe(false)
    })

    it('should allow new messages after clearing', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())
      await act(async () => {
        await result.current.sendMessage('Old message')
      })
      act(() => {
        result.current.clearMessages()
      })

      // Act
      await act(async () => {
        await result.current.sendMessage('New message')
      })

      // Assert
      expect(result.current.messages).toHaveLength(1)
      expect(result.current.messages[0].content).toBe('New message')
    })
  })

  // ============================================================
  // TC-CHAT-005: isLoading State Management
  // ============================================================
  describe('isLoading state', () => {
    it('should handle multiple rapid sends correctly', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())

      // Act - send multiple messages rapidly
      await act(async () => {
        await Promise.all([
          result.current.sendMessage('Message 1'),
          result.current.sendMessage('Message 2'),
          result.current.sendMessage('Message 3'),
        ])
      })

      // Assert - all messages should be present and loading should be false
      expect(result.current.messages).toHaveLength(3)
      expect(result.current.isLoading).toBe(false)
    })
  })

  // ============================================================
  // TC-CHAT-006: Message Type Validation
  // ============================================================
  describe('message structure', () => {
    it('should have correct ChatMessage structure for user messages', async () => {
      // Arrange
      const { result } = renderHook(() => useChat())

      // Act
      await act(async () => {
        await result.current.sendMessage('Test')
      })

      // Assert
      const message = result.current.messages[0]
      expect(message).toMatchObject({
        id: expect.any(String),
        role: 'user',
        content: 'Test',
        timestamp: expect.any(Date),
      })
    })

    it('should have correct ChatMessage structure for assistant messages', () => {
      // Arrange
      const { result } = renderHook(() => useChat())

      // Act
      act(() => {
        result.current.addAIMessage('Test response')
      })

      // Assert
      const message = result.current.messages[0]
      expect(message).toMatchObject({
        id: expect.any(String),
        role: 'assistant',
        content: 'Test response',
        timestamp: expect.any(Date),
      })
    })
  })

  // ============================================================
  // TC-CHAT-007: Hook Stability
  // ============================================================
  describe('hook stability', () => {
    it('should maintain stable function references across rerenders', () => {
      // Arrange
      const { result, rerender } = renderHook(() => useChat())
      const initialSendMessage = result.current.sendMessage
      const initialAddAIMessage = result.current.addAIMessage
      const initialClearMessages = result.current.clearMessages

      // Act
      rerender()

      // Assert - functions should be stable (memoized)
      expect(result.current.sendMessage).toBe(initialSendMessage)
      expect(result.current.addAIMessage).toBe(initialAddAIMessage)
      expect(result.current.clearMessages).toBe(initialClearMessages)
    })
  })
})
