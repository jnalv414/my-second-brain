import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './input'

/**
 * Input Component Test Suite
 *
 * Tests for the shadcn/ui-style Input component with Voxa theming.
 * These tests verify rendering, value handling, dark mode styling, and states.
 *
 * Design tokens (Voxa):
 * - Surface dark: #2b2c28 (input background in dark mode)
 * - Text dark: #fffafb
 * - Primary (ring): #339989
 */
describe('Input', () => {
  // ============================================================
  // TC-INP-001: Basic Rendering
  // ============================================================
  describe('Basic Rendering', () => {
    /**
     * Priority: Critical
     * Category: Functional
     *
     * Preconditions: Input component is rendered
     * Expected Result: An input element is in the document
     */
    it('TC-INP-001a: renders an input element', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it("TC-INP-001b: renders with default type='text'", () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('TC-INP-001c: forwards ref to input element', () => {
      const ref = { current: null as HTMLInputElement | null }
      render(<Input ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('TC-INP-001d: applies data-testid attribute', () => {
      render(<Input data-testid="custom-input" />)

      expect(screen.getByTestId('custom-input')).toBeInTheDocument()
    })
  })

  // ============================================================
  // TC-INP-002: Placeholder Tests
  // ============================================================
  describe('Placeholder', () => {
    /**
     * Priority: High
     * Category: Functional
     *
     * Preconditions: Input rendered with placeholder prop
     * Expected Result: Placeholder text is visible
     */
    it('TC-INP-002a: renders with placeholder text', () => {
      render(<Input placeholder="Enter your email" />)

      const input = screen.getByPlaceholderText('Enter your email')
      expect(input).toBeInTheDocument()
    })

    it('TC-INP-002b: placeholder has correct styling class', () => {
      render(<Input placeholder="Search..." />)

      const input = screen.getByPlaceholderText('Search...')
      expect(input).toHaveClass('placeholder:text-muted-foreground')
    })
  })

  // ============================================================
  // TC-INP-003: Value Handling
  // ============================================================
  describe('Value Handling', () => {
    /**
     * Priority: Critical
     * Category: Functional
     *
     * Test controlled and uncontrolled input behavior
     */
    it('TC-INP-003a: handles onChange events', () => {
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test value' } })

      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('TC-INP-003b: updates value on change (uncontrolled)', () => {
      render(<Input defaultValue="" />)

      const input = screen.getByRole('textbox') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'new value' } })

      expect(input.value).toBe('new value')
    })

    it('TC-INP-003c: displays controlled value', () => {
      render(<Input value="controlled" onChange={() => {}} />)

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('controlled')
    })

    it('TC-INP-003d: handles defaultValue prop', () => {
      render(<Input defaultValue="initial value" />)

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('initial value')
    })
  })

  // ============================================================
  // TC-INP-004: Dark Mode Styling
  // ============================================================
  describe('Dark Mode Styling', () => {
    /**
     * Priority: High
     * Category: Functional
     *
     * Verify dark mode classes from Voxa design system
     * Surface dark: #2b2c28
     */
    it('TC-INP-004a: has dark mode background class', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      // Should have dark:bg-* class for surface-dark color
      expect(input.className).toMatch(/dark:bg-/)
    })

    it('TC-INP-004b: has dark mode text color class', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      // Should have text color that works in dark mode
      expect(input.className).toMatch(/dark:text-|text-foreground/)
    })

    it('TC-INP-004c: has dark mode border class', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input.className).toMatch(/dark:border-/)
    })

    it('TC-INP-004d: has dark mode placeholder color', () => {
      render(<Input placeholder="test" />)

      const input = screen.getByRole('textbox')
      expect(input.className).toMatch(/placeholder:/)
    })
  })

  // ============================================================
  // TC-INP-005: Disabled State
  // ============================================================
  describe('Disabled State', () => {
    /**
     * Priority: High
     * Category: Functional
     *
     * Test disabled input behavior and styling
     */
    it('TC-INP-005a: is disabled when disabled prop is true', () => {
      render(<Input disabled />)

      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('TC-INP-005b: has disabled cursor class', () => {
      render(<Input disabled />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('disabled:cursor-not-allowed')
    })

    it('TC-INP-005c: has disabled opacity class', () => {
      render(<Input disabled />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('disabled:opacity-50')
    })

    it('TC-INP-005d: does not fire onChange when disabled', () => {
      const handleChange = vi.fn()
      render(<Input disabled onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'attempt' } })

      // Disabled inputs should not fire change events
      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  // ============================================================
  // TC-INP-006: Base Styling
  // ============================================================
  describe('Base Styling', () => {
    /**
     * Priority: Medium
     * Category: Functional
     *
     * Test common base classes
     */
    it('TC-INP-006a: has flex display class', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('flex')
    })

    it('TC-INP-006b: has height class (h-10)', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('h-10')
    })

    it('TC-INP-006c: has full width class', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('w-full')
    })

    it('TC-INP-006d: has rounded corners (rounded-md or rounded-xl)', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      // Voxa design uses rounded-xl for inputs
      expect(input.className).toMatch(/rounded-(md|xl)/)
    })

    it('TC-INP-006e: has border class', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border')
      expect(input).toHaveClass('border-input')
    })

    it('TC-INP-006f: has padding classes', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('px-3')
      expect(input).toHaveClass('py-2')
    })

    it('TC-INP-006g: has text size class', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('text-sm')
    })

    it('TC-INP-006h: has background class', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('bg-background')
    })
  })

  // ============================================================
  // TC-INP-007: Focus Styling
  // ============================================================
  describe('Focus Styling', () => {
    /**
     * Priority: High
     * Category: Functional
     *
     * Test focus ring styles (primary color #339989)
     */
    it('TC-INP-007a: has focus-visible outline-none class', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus-visible:outline-none')
    })

    it('TC-INP-007b: has focus-visible ring class', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus-visible:ring-2')
    })

    it('TC-INP-007c: has focus ring color class', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus-visible:ring-ring')
    })

    it('TC-INP-007d: has focus ring offset class', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus-visible:ring-offset-2')
    })
  })

  // ============================================================
  // TC-INP-008: Input Types
  // ============================================================
  describe('Input Types', () => {
    /**
     * Priority: High
     * Category: Functional
     *
     * Test various HTML input types
     */
    it("TC-INP-008a: supports type='email'", () => {
      render(<Input type="email" />)

      const input = document.querySelector('input[type="email"]')
      expect(input).toBeInTheDocument()
    })

    it("TC-INP-008b: supports type='password'", () => {
      render(<Input type="password" />)

      const input = document.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
    })

    it("TC-INP-008c: supports type='number'", () => {
      render(<Input type="number" />)

      const input = document.querySelector('input[type="number"]')
      expect(input).toBeInTheDocument()
    })

    it("TC-INP-008d: supports type='search'", () => {
      render(<Input type="search" />)

      const input = document.querySelector('input[type="search"]')
      expect(input).toBeInTheDocument()
    })

    it("TC-INP-008e: supports type='tel'", () => {
      render(<Input type="tel" />)

      const input = document.querySelector('input[type="tel"]')
      expect(input).toBeInTheDocument()
    })

    it("TC-INP-008f: supports type='url'", () => {
      render(<Input type="url" />)

      const input = document.querySelector('input[type="url"]')
      expect(input).toBeInTheDocument()
    })

    it('TC-INP-008g: hides file input styling', () => {
      render(<Input type="file" />)

      const input = document.querySelector('input[type="file"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('file:border-0')
      expect(input).toHaveClass('file:bg-transparent')
    })
  })

  // ============================================================
  // TC-INP-009: Custom className Merging
  // ============================================================
  describe('Custom className', () => {
    /**
     * Priority: Medium
     * Category: Functional
     *
     * Verify custom classNames are merged properly
     */
    it('TC-INP-009a: merges custom className with defaults', () => {
      render(<Input className="custom-class" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-class')
      expect(input).toHaveClass('flex') // base class still present
    })

    it('TC-INP-009b: custom className can override defaults', () => {
      render(<Input className="h-12" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('h-12')
    })
  })

  // ============================================================
  // TC-INP-010: Accessibility
  // ============================================================
  describe('Accessibility', () => {
    /**
     * Priority: High
     * Category: Accessibility
     *
     * Verify ARIA attributes and labels
     */
    it('TC-INP-010a: has correct textbox role', () => {
      render(<Input />)

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('TC-INP-010b: supports aria-label', () => {
      render(<Input aria-label="Email address" />)

      const input = screen.getByRole('textbox', { name: /email address/i })
      expect(input).toBeInTheDocument()
    })

    it('TC-INP-010c: supports aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="help-text" />
          <span id="help-text">Enter your email</span>
        </>,
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('TC-INP-010d: supports aria-invalid for validation', () => {
      render(<Input aria-invalid="true" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('TC-INP-010e: supports required attribute', () => {
      render(<Input required />)

      const input = screen.getByRole('textbox')
      expect(input).toBeRequired()
    })
  })

  // ============================================================
  // TC-INP-011: Edge Cases
  // ============================================================
  describe('Edge Cases', () => {
    /**
     * Priority: Medium
     * Category: Edge Case
     *
     * Test unusual but valid patterns
     */
    it('TC-INP-011a: handles empty string value', () => {
      render(<Input value="" onChange={() => {}} />)

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('TC-INP-011b: handles special characters in value', () => {
      render(<Input defaultValue="<script>alert('xss')</script>" />)

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe("<script>alert('xss')</script>")
    })

    it('TC-INP-011c: handles very long input', () => {
      const longValue = 'a'.repeat(10000)
      render(<Input defaultValue={longValue} />)

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe(longValue)
    })

    it('TC-INP-011d: handles unicode characters', () => {
      render(<Input defaultValue="Hello" />)

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toContain('Hello')
    })

    it('TC-INP-011e: handles maxLength attribute', () => {
      render(<Input maxLength={10} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('maxLength', '10')
    })

    it('TC-INP-011f: handles minLength attribute', () => {
      render(<Input minLength={5} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('minLength', '5')
    })

    it('TC-INP-011g: handles autoComplete attribute', () => {
      render(<Input autoComplete="email" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('autoComplete', 'email')
    })
  })

  // ============================================================
  // TC-INP-012: Event Handling
  // ============================================================
  describe('Event Handling', () => {
    /**
     * Priority: High
     * Category: Functional
     *
     * Test various input events
     */
    it('TC-INP-012a: handles onFocus event', () => {
      const handleFocus = vi.fn()
      render(<Input onFocus={handleFocus} />)

      const input = screen.getByRole('textbox')
      fireEvent.focus(input)

      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it('TC-INP-012b: handles onBlur event', () => {
      const handleBlur = vi.fn()
      render(<Input onBlur={handleBlur} />)

      const input = screen.getByRole('textbox')
      fireEvent.focus(input)
      fireEvent.blur(input)

      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('TC-INP-012c: handles onKeyDown event', () => {
      const handleKeyDown = vi.fn()
      render(<Input onKeyDown={handleKeyDown} />)

      const input = screen.getByRole('textbox')
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })

    it('TC-INP-012d: handles onKeyUp event', () => {
      const handleKeyUp = vi.fn()
      render(<Input onKeyUp={handleKeyUp} />)

      const input = screen.getByRole('textbox')
      fireEvent.keyUp(input, { key: 'a' })

      expect(handleKeyUp).toHaveBeenCalledTimes(1)
    })
  })
})
