/**
 * ChatMessage Component Tests
 *
 * Tests for the message bubble component that displays user and AI messages.
 *
 * Design Reference:
 * - User bubble: max-w-2xl bg-gray-200 dark:bg-surface-dark px-6 py-4 rounded-3xl rounded-tr-md
 * - AI avatar: w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary
 * - User messages: right-aligned
 * - AI messages: left-aligned with avatar
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChatMessage } from './chat-message'
import type { Message } from './types'

// Test fixtures
const createUserMessage = (
  content = 'Hello, how are you?',
  id = 'msg-1',
): Message => ({
  id,
  role: 'user',
  content,
})

const createAssistantMessage = (
  content = 'I am doing well, thank you for asking!',
  id = 'msg-2',
): Message => ({
  id,
  role: 'assistant',
  content,
})

describe('ChatMessage', () => {
  describe('Content Rendering', () => {
    it('renders user message content', () => {
      const message = createUserMessage('Hello, this is a test message')

      render(<ChatMessage message={message} />)

      expect(
        screen.getByText('Hello, this is a test message'),
      ).toBeInTheDocument()
    })

    it('renders assistant message content', () => {
      const message = createAssistantMessage(
        'This is the AI response to your query.',
      )

      render(<ChatMessage message={message} />)

      expect(
        screen.getByText('This is the AI response to your query.'),
      ).toBeInTheDocument()
    })

    it('renders long message content without truncation', () => {
      const longContent =
        'This is a very long message that should not be truncated. '.repeat(10)
      const message = createUserMessage(longContent)

      render(<ChatMessage message={message} />)

      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('handles empty message content gracefully', () => {
      const message = createUserMessage('')

      // Should not throw
      expect(() => render(<ChatMessage message={message} />)).not.toThrow()
    })
  })

  describe('User Message Styling', () => {
    it('user message is right-aligned', () => {
      const message = createUserMessage()

      const { container } = render(<ChatMessage message={message} />)

      // The message container should have right alignment classes
      const messageWrapper = container.firstChild as HTMLElement
      expect(messageWrapper).toHaveClass('justify-end')
    })

    it('user message bubble has correct background color', () => {
      const message = createUserMessage()

      render(<ChatMessage message={message} />)

      const messageText = screen.getByText(message.content)
      const bubble = messageText.closest('div')

      // Should have bg-gray-200 for light mode
      expect(bubble).toHaveClass('bg-gray-200')
    })

    it('user message bubble has rounded-3xl with rounded-tr-md corner', () => {
      const message = createUserMessage()

      render(<ChatMessage message={message} />)

      const messageText = screen.getByText(message.content)
      const bubble = messageText.closest('div')

      expect(bubble).toHaveClass('rounded-3xl')
      expect(bubble).toHaveClass('rounded-tr-md')
    })

    it('user message bubble has correct padding', () => {
      const message = createUserMessage()

      render(<ChatMessage message={message} />)

      const messageText = screen.getByText(message.content)
      const bubble = messageText.closest('div')

      expect(bubble).toHaveClass('px-6')
      expect(bubble).toHaveClass('py-4')
    })

    it('user message does not show avatar', () => {
      const message = createUserMessage()

      render(<ChatMessage message={message} />)

      // Avatar should not be present for user messages
      const avatar = screen.queryByTestId('ai-avatar')
      expect(avatar).not.toBeInTheDocument()
    })
  })

  describe('AI Message Styling', () => {
    it('AI message is left-aligned', () => {
      const message = createAssistantMessage()

      const { container } = render(<ChatMessage message={message} />)

      // The message container should have left alignment (no justify-end)
      const messageWrapper = container.firstChild as HTMLElement
      expect(messageWrapper).toHaveClass('justify-start')
    })

    it('AI message displays avatar', () => {
      const message = createAssistantMessage()

      render(<ChatMessage message={message} />)

      const avatar = screen.getByTestId('ai-avatar')
      expect(avatar).toBeInTheDocument()
    })

    it('AI avatar has gradient background from primary to secondary', () => {
      const message = createAssistantMessage()

      render(<ChatMessage message={message} />)

      const avatar = screen.getByTestId('ai-avatar')
      expect(avatar).toHaveClass('bg-gradient-to-br')
      expect(avatar).toHaveClass('from-primary')
      expect(avatar).toHaveClass('to-secondary')
    })

    it('AI avatar has correct size (w-8 h-8)', () => {
      const message = createAssistantMessage()

      render(<ChatMessage message={message} />)

      const avatar = screen.getByTestId('ai-avatar')
      expect(avatar).toHaveClass('w-8')
      expect(avatar).toHaveClass('h-8')
    })

    it('AI avatar is rounded-full', () => {
      const message = createAssistantMessage()

      render(<ChatMessage message={message} />)

      const avatar = screen.getByTestId('ai-avatar')
      expect(avatar).toHaveClass('rounded-full')
    })
  })

  describe('Action Buttons', () => {
    it('shows action buttons for AI messages when showActions is true', () => {
      const message = createAssistantMessage()

      render(<ChatMessage message={message} showActions={true} />)

      // Should have action buttons
      const copyButton = screen.getByRole('button', { name: /copy/i })
      expect(copyButton).toBeInTheDocument()
    })

    it('does not show action buttons for user messages', () => {
      const message = createUserMessage()

      render(<ChatMessage message={message} showActions={true} />)

      // Should NOT have action buttons even with showActions true
      const copyButton = screen.queryByRole('button', { name: /copy/i })
      expect(copyButton).not.toBeInTheDocument()
    })

    it('hides action buttons when showActions is false', () => {
      const message = createAssistantMessage()

      render(<ChatMessage message={message} showActions={false} />)

      const copyButton = screen.queryByRole('button', { name: /copy/i })
      expect(copyButton).not.toBeInTheDocument()
    })

    it('passes actionButtonsProps to ActionButtons component', () => {
      const message = createAssistantMessage()
      const onCopy = vi.fn()

      render(
        <ChatMessage
          message={message}
          showActions={true}
          actionButtonsProps={{ onCopy }}
        />,
      )

      // Clicking copy should trigger the passed callback
      const copyButton = screen.getByRole('button', { name: /copy/i })
      copyButton.click()

      expect(onCopy).toHaveBeenCalled()
    })

    it('renders thumbs up button for AI messages', () => {
      const message = createAssistantMessage()

      render(<ChatMessage message={message} showActions={true} />)

      const thumbsUpButton = screen.getByRole('button', { name: /thumbs up/i })
      expect(thumbsUpButton).toBeInTheDocument()
    })

    it('renders thumbs down button for AI messages', () => {
      const message = createAssistantMessage()

      render(<ChatMessage message={message} showActions={true} />)

      const thumbsDownButton = screen.getByRole('button', {
        name: /thumbs down/i,
      })
      expect(thumbsDownButton).toBeInTheDocument()
    })

    it('renders speaker/volume button for AI messages', () => {
      const message = createAssistantMessage()

      render(<ChatMessage message={message} showActions={true} />)

      const speakerButton = screen.getByRole('button', {
        name: /speak|volume|read aloud/i,
      })
      expect(speakerButton).toBeInTheDocument()
    })

    it('renders regenerate button for AI messages', () => {
      const message = createAssistantMessage()

      render(<ChatMessage message={message} showActions={true} />)

      const regenerateButton = screen.getByRole('button', {
        name: /regenerate|retry/i,
      })
      expect(regenerateButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has appropriate role for message container', () => {
      const message = createUserMessage()

      render(<ChatMessage message={message} />)

      // Messages should be in an article or similar semantic element
      const article = screen.getByRole('article')
      expect(article).toBeInTheDocument()
    })

    it('indicates message sender via aria-label', () => {
      const userMessage = createUserMessage()
      const aiMessage = createAssistantMessage()

      const { rerender } = render(<ChatMessage message={userMessage} />)
      expect(screen.getByRole('article')).toHaveAttribute(
        'aria-label',
        expect.stringContaining('user'),
      )

      rerender(<ChatMessage message={aiMessage} />)
      expect(screen.getByRole('article')).toHaveAttribute(
        'aria-label',
        expect.stringContaining('assistant'),
      )
    })
  })
})
