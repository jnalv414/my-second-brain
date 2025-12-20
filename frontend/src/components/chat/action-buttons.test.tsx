/**
 * ActionButtons Component Tests
 *
 * Tests for the message action buttons component that appears on AI messages.
 * Buttons: copy, thumbs up, thumbs down, volume (speak), regenerate
 *
 * Design Reference:
 * - Buttons have hover:text-primary state
 * - Icons from lucide-react
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ActionButtons } from './action-buttons'

describe('ActionButtons', () => {
  describe('Rendering', () => {
    it('renders copy button', () => {
      render(<ActionButtons />)

      const copyButton = screen.getByRole('button', { name: /copy/i })
      expect(copyButton).toBeInTheDocument()
    })

    it('renders thumbs up button', () => {
      render(<ActionButtons />)

      const thumbsUpButton = screen.getByRole('button', { name: /thumbs up/i })
      expect(thumbsUpButton).toBeInTheDocument()
    })

    it('renders thumbs down button', () => {
      render(<ActionButtons />)

      const thumbsDownButton = screen.getByRole('button', {
        name: /thumbs down/i,
      })
      expect(thumbsDownButton).toBeInTheDocument()
    })

    it('renders volume/speak button', () => {
      render(<ActionButtons />)

      // Could be labeled as "speak", "volume", or "read aloud"
      const speakButton = screen.getByRole('button', {
        name: /speak|volume|read aloud/i,
      })
      expect(speakButton).toBeInTheDocument()
    })

    it('renders regenerate button', () => {
      render(<ActionButtons />)

      const regenerateButton = screen.getByRole('button', {
        name: /regenerate|retry/i,
      })
      expect(regenerateButton).toBeInTheDocument()
    })

    it('renders all five action buttons', () => {
      render(<ActionButtons />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(5)
    })
  })

  describe('Interactions', () => {
    it('calls onCopy when copy button is clicked', async () => {
      const user = userEvent.setup()
      const onCopy = vi.fn()

      render(<ActionButtons onCopy={onCopy} />)

      const copyButton = screen.getByRole('button', { name: /copy/i })
      await user.click(copyButton)

      expect(onCopy).toHaveBeenCalledTimes(1)
    })

    it('calls onThumbsUp when thumbs up button is clicked', async () => {
      const user = userEvent.setup()
      const onThumbsUp = vi.fn()

      render(<ActionButtons onThumbsUp={onThumbsUp} />)

      const thumbsUpButton = screen.getByRole('button', { name: /thumbs up/i })
      await user.click(thumbsUpButton)

      expect(onThumbsUp).toHaveBeenCalledTimes(1)
    })

    it('calls onThumbsDown when thumbs down button is clicked', async () => {
      const user = userEvent.setup()
      const onThumbsDown = vi.fn()

      render(<ActionButtons onThumbsDown={onThumbsDown} />)

      const thumbsDownButton = screen.getByRole('button', {
        name: /thumbs down/i,
      })
      await user.click(thumbsDownButton)

      expect(onThumbsDown).toHaveBeenCalledTimes(1)
    })

    it('calls onSpeak when volume button is clicked', async () => {
      const user = userEvent.setup()
      const onSpeak = vi.fn()

      render(<ActionButtons onSpeak={onSpeak} />)

      const speakButton = screen.getByRole('button', {
        name: /speak|volume|read aloud/i,
      })
      await user.click(speakButton)

      expect(onSpeak).toHaveBeenCalledTimes(1)
    })

    it('calls onRegenerate when regenerate button is clicked', async () => {
      const user = userEvent.setup()
      const onRegenerate = vi.fn()

      render(<ActionButtons onRegenerate={onRegenerate} />)

      const regenerateButton = screen.getByRole('button', {
        name: /regenerate|retry/i,
      })
      await user.click(regenerateButton)

      expect(onRegenerate).toHaveBeenCalledTimes(1)
    })

    it('does not throw when callback is not provided', async () => {
      const user = userEvent.setup()

      render(<ActionButtons />)

      const copyButton = screen.getByRole('button', { name: /copy/i })

      // Should not throw
      await expect(user.click(copyButton)).resolves.not.toThrow()
    })
  })

  describe('Styling', () => {
    it('buttons have hover:text-primary class for hover state', () => {
      render(<ActionButtons />)

      const buttons = screen.getAllByRole('button')

      // At least one button should have the hover styling class
      const hasHoverClass = buttons.some(
        (button) =>
          button.className.includes('hover:text-primary') ||
          button.classList.contains('hover:text-primary'),
      )

      expect(hasHoverClass).toBe(true)
    })

    it('buttons are contained in a flex container', () => {
      const { container } = render(<ActionButtons />)

      // The parent container should have flex layout
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('flex')
    })
  })
})
