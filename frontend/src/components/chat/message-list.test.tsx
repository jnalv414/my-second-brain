/**
 * MessageList Component Tests
 *
 * Tests for the scrollable message container that displays chat history.
 *
 * Features:
 * - Renders list of ChatMessage components
 * - Shows empty state when no messages
 * - Auto-scrolls to bottom on new message
 */

import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MessageList } from './message-list'
import type { Message } from './types'

// Test fixtures
const createMessages = (count: number): Message[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${i + 1}`,
    role: i % 2 === 0 ? 'user' : 'assistant',
    content: `Message ${i + 1} content`,
  }))
}

const sampleMessages: Message[] = [
  { id: '1', role: 'user', content: 'Hello, how are you?' },
  {
    id: '2',
    role: 'assistant',
    content: 'I am doing well, thank you for asking!',
  },
  { id: '3', role: 'user', content: 'Can you help me with something?' },
  {
    id: '4',
    role: 'assistant',
    content: 'Of course! I would be happy to help. What do you need?',
  },
]

describe('MessageList', () => {
  describe('Rendering Messages', () => {
    it('renders all messages from the messages array', () => {
      render(<MessageList messages={sampleMessages} />)

      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument()
      expect(
        screen.getByText('I am doing well, thank you for asking!'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Can you help me with something?'),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Of course! I would be happy to help. What do you need?',
        ),
      ).toBeInTheDocument()
    })

    it('renders messages in correct order (first to last)', () => {
      render(<MessageList messages={sampleMessages} />)

      const messages = screen.getAllByRole('article')

      // First message should be the user's "Hello"
      expect(messages[0]).toHaveTextContent('Hello, how are you?')
      // Last message should be the assistant's response
      expect(messages[3]).toHaveTextContent(
        'Of course! I would be happy to help.',
      )
    })

    it('renders each message as a ChatMessage component', () => {
      render(<MessageList messages={sampleMessages} />)

      // Each message should be in an article element (from ChatMessage)
      const articles = screen.getAllByRole('article')
      expect(articles).toHaveLength(4)
    })

    it('handles large number of messages', () => {
      const manyMessages = createMessages(50)

      render(<MessageList messages={manyMessages} />)

      const articles = screen.getAllByRole('article')
      expect(articles).toHaveLength(50)
    })

    it('properly distinguishes user and assistant messages', () => {
      render(<MessageList messages={sampleMessages} />)

      const articles = screen.getAllByRole('article')

      // Check aria-labels to distinguish message types
      expect(articles[0]).toHaveAttribute(
        'aria-label',
        expect.stringContaining('user'),
      )
      expect(articles[1]).toHaveAttribute(
        'aria-label',
        expect.stringContaining('assistant'),
      )
    })
  })

  describe('Empty State', () => {
    it('shows empty state when messages array is empty', () => {
      render(<MessageList messages={[]} />)

      const emptyState = screen.getByTestId('empty-state')
      expect(emptyState).toBeInTheDocument()
    })

    it('displays default empty state message', () => {
      render(<MessageList messages={[]} />)

      expect(
        screen.getByText(/no messages|start a conversation/i),
      ).toBeInTheDocument()
    })

    it('displays custom empty state message when provided', () => {
      render(
        <MessageList
          messages={[]}
          emptyStateMessage="Ask me anything to get started!"
        />,
      )

      expect(
        screen.getByText('Ask me anything to get started!'),
      ).toBeInTheDocument()
    })

    it('does not show empty state when messages exist', () => {
      render(<MessageList messages={sampleMessages} />)

      const emptyState = screen.queryByTestId('empty-state')
      expect(emptyState).not.toBeInTheDocument()
    })
  })

  describe('Container Styling', () => {
    it('has scrollable container', () => {
      const { container } = render(<MessageList messages={sampleMessages} />)

      const scrollContainer = container.firstChild as HTMLElement
      // Should have overflow-y-auto or similar for scrolling
      expect(scrollContainer).toHaveClass('overflow-y-auto')
    })

    it('has flex-col layout for messages', () => {
      const { container } = render(<MessageList messages={sampleMessages} />)

      const scrollContainer = container.firstChild as HTMLElement
      expect(scrollContainer).toHaveClass('flex')
      expect(scrollContainer).toHaveClass('flex-col')
    })

    it('has gap between messages', () => {
      const { container } = render(<MessageList messages={sampleMessages} />)

      const scrollContainer = container.firstChild as HTMLElement
      // Should have gap-* class for spacing
      const hasGap = Array.from(scrollContainer.classList).some((cls) =>
        cls.startsWith('gap-'),
      )
      expect(hasGap).toBe(true)
    })
  })

  describe('Auto-scroll Behavior', () => {
    it('scrolls to bottom on initial render with messages', async () => {
      const scrollIntoViewMock = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoViewMock

      render(<MessageList messages={sampleMessages} />)

      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalled()
      })
    })

    it('scrolls to bottom when new message is added', async () => {
      const scrollIntoViewMock = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoViewMock

      const { rerender } = render(<MessageList messages={sampleMessages} />)

      // Reset mock count
      scrollIntoViewMock.mockClear()

      // Add a new message
      const newMessages: Message[] = [
        ...sampleMessages,
        { id: '5', role: 'user', content: 'New message' },
      ]

      rerender(<MessageList messages={newMessages} />)

      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalled()
      })
    })

    it('has a scroll anchor element at the bottom', () => {
      render(<MessageList messages={sampleMessages} />)

      const scrollAnchor = screen.getByTestId('scroll-anchor')
      expect(scrollAnchor).toBeInTheDocument()
    })

    it('does not scroll when no new messages are added', async () => {
      const scrollIntoViewMock = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoViewMock

      const { rerender } = render(<MessageList messages={sampleMessages} />)

      // Initial scroll
      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalled()
      })

      const initialCallCount = scrollIntoViewMock.mock.calls.length

      // Re-render with same messages
      rerender(<MessageList messages={sampleMessages} />)

      // Should not trigger additional scroll
      expect(scrollIntoViewMock.mock.calls.length).toBe(initialCallCount)
    })
  })

  describe('Accessibility', () => {
    it('has role list for the container', () => {
      render(<MessageList messages={sampleMessages} />)

      const list = screen.getByRole('list')
      expect(list).toBeInTheDocument()
    })

    it('messages are list items', () => {
      render(<MessageList messages={sampleMessages} />)

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(4)
    })

    it('has aria-live region for new messages', () => {
      const { container } = render(<MessageList messages={sampleMessages} />)

      const liveRegion = container.querySelector('[aria-live="polite"]')
      expect(liveRegion).toBeInTheDocument()
    })

    it('empty state is properly announced', () => {
      render(<MessageList messages={[]} />)

      const emptyState = screen.getByTestId('empty-state')
      expect(emptyState).toHaveAttribute('role', 'status')
    })
  })

  describe('Message IDs', () => {
    it('uses message id as key for efficient re-rendering', () => {
      const { container } = render(<MessageList messages={sampleMessages} />)

      // Each message article should have a unique identifier
      const articles = container.querySelectorAll('article')
      const ids = Array.from(articles).map((article) =>
        article.getAttribute('data-message-id'),
      )

      // All IDs should be unique
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(4)
    })

    it('preserves message elements when list is updated', async () => {
      const { rerender, container } = render(
        <MessageList messages={sampleMessages} />,
      )

      const firstArticle = container.querySelector('article')
      const firstArticleId = firstArticle?.getAttribute('data-message-id')

      // Add a new message
      const newMessages: Message[] = [
        ...sampleMessages,
        { id: '5', role: 'user', content: 'New message' },
      ]

      rerender(<MessageList messages={newMessages} />)

      // First article should still have same ID (wasn't re-created)
      const updatedFirstArticle = container.querySelector('article')
      expect(updatedFirstArticle?.getAttribute('data-message-id')).toBe(
        firstArticleId,
      )
    })
  })
})
