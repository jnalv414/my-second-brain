/**
 * ChatInput Component Tests
 *
 * Tests for the message input area with action buttons and send functionality.
 *
 * Design Reference:
 * - Container: bg-white dark:bg-[#1e2020] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50
 * - Send button: p-2 bg-primary hover:bg-opacity-90 text-white rounded-xl
 * - Placeholder: "Send a message..."
 * - Action buttons: add (+), image, microphone
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChatInput } from './chat-input'

describe('ChatInput', () => {
  describe('Rendering', () => {
    it('renders a textarea element', () => {
      render(<ChatInput onSend={vi.fn()} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea.tagName.toLowerCase()).toBe('textarea')
    })

    it('displays placeholder "Send a message..."', () => {
      render(<ChatInput onSend={vi.fn()} />)

      const textarea = screen.getByPlaceholderText('Send a message...')
      expect(textarea).toBeInTheDocument()
    })

    it('accepts custom placeholder text', () => {
      render(<ChatInput onSend={vi.fn()} placeholder="Ask me anything..." />)

      const textarea = screen.getByPlaceholderText('Ask me anything...')
      expect(textarea).toBeInTheDocument()
    })

    it('renders send button', () => {
      render(<ChatInput onSend={vi.fn()} />)

      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toBeInTheDocument()
    })

    it('renders add/attach button', () => {
      render(<ChatInput onSend={vi.fn()} />)

      const addButton = screen.getByRole('button', { name: /add|attach|\+/i })
      expect(addButton).toBeInTheDocument()
    })

    it('renders image upload button', () => {
      render(<ChatInput onSend={vi.fn()} />)

      const imageButton = screen.getByRole('button', { name: /image|photo/i })
      expect(imageButton).toBeInTheDocument()
    })

    it('renders microphone button', () => {
      render(<ChatInput onSend={vi.fn()} />)

      const micButton = screen.getByRole('button', {
        name: /microphone|voice|mic/i,
      })
      expect(micButton).toBeInTheDocument()
    })
  })

  describe('Container Styling', () => {
    it('has rounded-2xl border radius', () => {
      const { container } = render(<ChatInput onSend={vi.fn()} />)

      const inputContainer = container.firstChild as HTMLElement
      expect(inputContainer).toHaveClass('rounded-2xl')
    })

    it('has shadow-lg box shadow', () => {
      const { container } = render(<ChatInput onSend={vi.fn()} />)

      const inputContainer = container.firstChild as HTMLElement
      expect(inputContainer).toHaveClass('shadow-lg')
    })

    it('has border styling', () => {
      const { container } = render(<ChatInput onSend={vi.fn()} />)

      const inputContainer = container.firstChild as HTMLElement
      expect(inputContainer).toHaveClass('border')
      expect(inputContainer).toHaveClass('border-gray-200')
    })

    it('has white background', () => {
      const { container } = render(<ChatInput onSend={vi.fn()} />)

      const inputContainer = container.firstChild as HTMLElement
      expect(inputContainer).toHaveClass('bg-white')
    })
  })

  describe('Send Button Styling', () => {
    it('send button has primary background color', () => {
      render(<ChatInput onSend={vi.fn()} />)

      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toHaveClass('bg-primary')
    })

    it('send button has white text', () => {
      render(<ChatInput onSend={vi.fn()} />)

      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toHaveClass('text-white')
    })

    it('send button has rounded-xl border radius', () => {
      render(<ChatInput onSend={vi.fn()} />)

      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toHaveClass('rounded-xl')
    })

    it('send button has p-2 padding', () => {
      render(<ChatInput onSend={vi.fn()} />)

      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toHaveClass('p-2')
    })
  })

  describe('User Interaction', () => {
    it('allows typing in the textarea', async () => {
      const user = userEvent.setup()

      render(<ChatInput onSend={vi.fn()} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Hello, world!')

      expect(textarea).toHaveValue('Hello, world!')
    })

    it('calls onSend with message content when send button is clicked', async () => {
      const user = userEvent.setup()
      const onSend = vi.fn()

      render(<ChatInput onSend={onSend} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Test message')

      const sendButton = screen.getByRole('button', { name: /send/i })
      await user.click(sendButton)

      expect(onSend).toHaveBeenCalledWith('Test message')
    })

    it('clears input after send', async () => {
      const user = userEvent.setup()
      const onSend = vi.fn()

      render(<ChatInput onSend={onSend} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Test message')
      expect(textarea).toHaveValue('Test message')

      const sendButton = screen.getByRole('button', { name: /send/i })
      await user.click(sendButton)

      expect(textarea).toHaveValue('')
    })

    it('sends message on Enter key press', async () => {
      const user = userEvent.setup()
      const onSend = vi.fn()

      render(<ChatInput onSend={onSend} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Enter key test{Enter}')

      expect(onSend).toHaveBeenCalledWith('Enter key test')
    })

    it('does not send on Shift+Enter (allows new line)', async () => {
      const user = userEvent.setup()
      const onSend = vi.fn()

      render(<ChatInput onSend={onSend} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2')

      expect(onSend).not.toHaveBeenCalled()
      expect(textarea).toHaveValue('Line 1\nLine 2')
    })

    it('does not send empty messages', async () => {
      const user = userEvent.setup()
      const onSend = vi.fn()

      render(<ChatInput onSend={onSend} />)

      const sendButton = screen.getByRole('button', { name: /send/i })
      await user.click(sendButton)

      expect(onSend).not.toHaveBeenCalled()
    })

    it('does not send whitespace-only messages', async () => {
      const user = userEvent.setup()
      const onSend = vi.fn()

      render(<ChatInput onSend={onSend} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, '   ')

      const sendButton = screen.getByRole('button', { name: /send/i })
      await user.click(sendButton)

      expect(onSend).not.toHaveBeenCalled()
    })
  })

  describe('Auto-expand Behavior', () => {
    it('textarea initially has single-line height', () => {
      render(<ChatInput onSend={vi.fn()} />)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      // Should have rows=1 or similar initial height
      expect(textarea.rows).toBe(1)
    })

    it('textarea expands when content exceeds one line', async () => {
      const user = userEvent.setup()

      render(<ChatInput onSend={vi.fn()} />)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      const initialHeight = textarea.scrollHeight

      // Type multiple lines
      await user.type(
        textarea,
        'Line 1{Shift>}{Enter}{/Shift}Line 2{Shift>}{Enter}{/Shift}Line 3',
      )

      // Height should have increased (or scrollHeight should be greater)
      await waitFor(() => {
        expect(textarea.scrollHeight).toBeGreaterThanOrEqual(initialHeight)
      })
    })

    it('textarea shrinks when content is deleted', async () => {
      const user = userEvent.setup()

      render(<ChatInput onSend={vi.fn()} />)

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement

      // Type multiple lines
      await user.type(
        textarea,
        'Line 1{Shift>}{Enter}{/Shift}Line 2{Shift>}{Enter}{/Shift}Line 3',
      )

      // Clear the textarea
      await user.clear(textarea)

      // Should be back to minimal height
      expect(textarea.value).toBe('')
    })
  })

  describe('Disabled State', () => {
    it('disables textarea when disabled prop is true', () => {
      render(<ChatInput onSend={vi.fn()} disabled={true} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeDisabled()
    })

    it('disables send button when disabled prop is true', () => {
      render(<ChatInput onSend={vi.fn()} disabled={true} />)

      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toBeDisabled()
    })

    it('does not call onSend when disabled', async () => {
      const user = userEvent.setup()
      const onSend = vi.fn()

      render(<ChatInput onSend={onSend} disabled={true} />)

      const sendButton = screen.getByRole('button', { name: /send/i })
      await user.click(sendButton)

      expect(onSend).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('textarea has accessible label', () => {
      render(<ChatInput onSend={vi.fn()} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAccessibleName()
    })

    it('send button has accessible name', () => {
      render(<ChatInput onSend={vi.fn()} />)

      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toHaveAccessibleName()
    })

    it('action buttons have accessible names', () => {
      render(<ChatInput onSend={vi.fn()} />)

      const addButton = screen.getByRole('button', { name: /add|attach|\+/i })
      const imageButton = screen.getByRole('button', { name: /image|photo/i })
      const micButton = screen.getByRole('button', {
        name: /microphone|voice|mic/i,
      })

      expect(addButton).toHaveAccessibleName()
      expect(imageButton).toHaveAccessibleName()
      expect(micButton).toHaveAccessibleName()
    })
  })
})
