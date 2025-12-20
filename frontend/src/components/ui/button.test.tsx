import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'

/**
 * Button Component Test Suite
 *
 * Tests for the shadcn/ui-style Button component with Voxa theming.
 * These tests verify variants, sizes, click handling, and composition.
 *
 * Design tokens (Voxa):
 * - Primary: #339989
 * - Secondary: #7de2d1
 * - Surface dark: #2b2c28
 * - Text dark: #fffafb
 */
describe('Button', () => {
  // ============================================================
  // TC-BTN-001: Basic Rendering
  // ============================================================
  describe('Basic Rendering', () => {
    it('TC-BTN-001a: renders a button element', () => {
      render(<Button>Click me</Button>)

      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
    })

    it('TC-BTN-001b: renders children correctly', () => {
      render(<Button>Submit Form</Button>)

      expect(screen.getByText('Submit Form')).toBeInTheDocument()
    })

    it('TC-BTN-001c: forwards ref to button element', () => {
      const ref = { current: null as HTMLButtonElement | null }
      render(<Button ref={ref}>With Ref</Button>)

      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  // ============================================================
  // TC-BTN-002: Variant Tests - Default/Primary
  // ============================================================
  describe('Variant: default (primary)', () => {
    /**
     * Priority: Critical
     * Category: Functional
     *
     * Preconditions: Button component is rendered without variant prop
     * Expected Result: Button has primary background color classes
     */
    it('TC-BTN-002a: renders with primary background color class', () => {
      render(<Button>Primary Button</Button>)

      const button = screen.getByRole('button')
      // Default variant should have primary background
      expect(button).toHaveClass('bg-primary')
    })

    it('TC-BTN-002b: renders with primary foreground text color', () => {
      render(<Button>Primary Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-primary-foreground')
    })

    it('TC-BTN-002c: has hover state classes', () => {
      render(<Button>Hoverable</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-primary/90')
    })
  })

  // ============================================================
  // TC-BTN-003: Variant Tests - Secondary
  // ============================================================
  describe('Variant: secondary', () => {
    /**
     * Priority: High
     * Category: Functional
     *
     * Preconditions: Button rendered with variant="secondary"
     * Expected Result: Button has secondary background (#7de2d1)
     */
    it('TC-BTN-003a: renders with secondary background color class', () => {
      render(<Button variant="secondary">Secondary Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary')
    })

    it('TC-BTN-003b: renders with secondary foreground text color', () => {
      render(<Button variant="secondary">Secondary Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-secondary-foreground')
    })

    it('TC-BTN-003c: has correct hover state', () => {
      render(<Button variant="secondary">Secondary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-secondary/80')
    })
  })

  // ============================================================
  // TC-BTN-004: Variant Tests - Ghost
  // ============================================================
  describe('Variant: ghost', () => {
    /**
     * Priority: High
     * Category: Functional
     *
     * Preconditions: Button rendered with variant="ghost"
     * Expected Result: Button has transparent background initially
     */
    it('TC-BTN-004a: does not have solid background class', () => {
      render(<Button variant="ghost">Ghost Button</Button>)

      const button = screen.getByRole('button')
      // Ghost buttons should NOT have bg-primary or bg-secondary
      expect(button).not.toHaveClass('bg-primary')
      expect(button).not.toHaveClass('bg-secondary')
    })

    it('TC-BTN-004b: has hover background accent class', () => {
      render(<Button variant="ghost">Ghost Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent')
    })

    it('TC-BTN-004c: has hover text accent foreground class', () => {
      render(<Button variant="ghost">Ghost Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:text-accent-foreground')
    })
  })

  // ============================================================
  // TC-BTN-005: Variant Tests - Destructive
  // ============================================================
  describe('Variant: destructive', () => {
    /**
     * Priority: High
     * Category: Functional
     *
     * Preconditions: Button rendered with variant="destructive"
     * Expected Result: Button has red/destructive background
     */
    it('TC-BTN-005a: renders with destructive background class', () => {
      render(<Button variant="destructive">Delete</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive')
    })

    it('TC-BTN-005b: renders with destructive foreground text', () => {
      render(<Button variant="destructive">Delete</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-destructive-foreground')
    })

    it('TC-BTN-005c: has hover state for destructive', () => {
      render(<Button variant="destructive">Delete</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-destructive/90')
    })
  })

  // ============================================================
  // TC-BTN-006: Variant Tests - Outline
  // ============================================================
  describe('Variant: outline', () => {
    it('TC-BTN-006a: renders with border class', () => {
      render(<Button variant="outline">Outline</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('border')
      expect(button).toHaveClass('border-input')
    })

    it('TC-BTN-006b: renders with transparent/background base', () => {
      render(<Button variant="outline">Outline</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-background')
    })

    it('TC-BTN-006c: has hover accent background', () => {
      render(<Button variant="outline">Outline</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent')
    })
  })

  // ============================================================
  // TC-BTN-007: Size Tests
  // ============================================================
  describe('Size variants', () => {
    /**
     * Priority: High
     * Category: Functional
     *
     * Tests button sizing: sm, default, lg, icon
     */
    it('TC-BTN-007a: renders with default size classes (h-10 px-4 py-2)', () => {
      render(<Button size="default">Default Size</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
      expect(button).toHaveClass('px-4')
      expect(button).toHaveClass('py-2')
    })

    it('TC-BTN-007b: renders with small size classes (h-9 px-3)', () => {
      render(<Button size="sm">Small</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9')
      expect(button).toHaveClass('px-3')
    })

    it('TC-BTN-007c: renders with large size classes (h-11 px-8)', () => {
      render(<Button size="lg">Large</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11')
      expect(button).toHaveClass('px-8')
    })

    it('TC-BTN-007d: renders with icon size classes (h-10 w-10)', () => {
      render(<Button size="icon">X</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
      expect(button).toHaveClass('w-10')
    })
  })

  // ============================================================
  // TC-BTN-008: Interaction Tests
  // ============================================================
  describe('Interactions', () => {
    /**
     * Priority: Critical
     * Category: Functional
     *
     * Test click handling and event propagation
     */
    it('TC-BTN-008a: handles onClick events', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click Me</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('TC-BTN-008b: does not fire onClick when disabled', () => {
      const handleClick = vi.fn()
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('TC-BTN-008c: has disabled styling when disabled', () => {
      render(<Button disabled>Disabled</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none')
      expect(button).toHaveClass('disabled:opacity-50')
    })
  })

  // ============================================================
  // TC-BTN-009: asChild Composition
  // ============================================================
  describe('asChild prop (Slot composition)', () => {
    /**
     * Priority: High
     * Category: Integration
     *
     * Test that asChild allows rendering as a different element (e.g., anchor)
     */
    it('TC-BTN-009a: renders child element when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>,
      )

      const link = screen.getByRole('link', { name: /link button/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    it('TC-BTN-009b: applies button classes to child element', () => {
      render(
        <Button asChild variant="secondary">
          <a href="/test">Styled Link</a>
        </Button>,
      )

      const link = screen.getByRole('link')
      expect(link).toHaveClass('bg-secondary')
    })

    it('TC-BTN-009c: does not render button element when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link</a>
        </Button>,
      )

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  // ============================================================
  // TC-BTN-010: Base Styling
  // ============================================================
  describe('Base styling', () => {
    /**
     * Priority: Medium
     * Category: Functional
     *
     * Test common base classes applied to all buttons
     */
    it('TC-BTN-010a: has inline-flex and centered content', () => {
      render(<Button>Centered</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('inline-flex')
      expect(button).toHaveClass('items-center')
      expect(button).toHaveClass('justify-center')
    })

    it('TC-BTN-010b: has whitespace-nowrap class', () => {
      render(<Button>No Wrap</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('whitespace-nowrap')
    })

    it('TC-BTN-010c: has rounded corners (rounded-md or rounded-xl)', () => {
      render(<Button>Rounded</Button>)

      const button = screen.getByRole('button')
      // Voxa uses rounded-xl for buttons per design system
      expect(button.className).toMatch(/rounded-(md|xl)/)
    })

    it('TC-BTN-010d: has focus-visible ring styles', () => {
      render(<Button>Focusable</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus-visible:outline-none')
      expect(button).toHaveClass('focus-visible:ring-2')
      expect(button).toHaveClass('focus-visible:ring-ring')
    })

    it('TC-BTN-010e: has transition classes for smooth interactions', () => {
      render(<Button>Animated</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toMatch(/transition/)
    })

    it('TC-BTN-010f: has appropriate font weight', () => {
      render(<Button>Bold Text</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('font-medium')
    })

    it('TC-BTN-010g: has text size class', () => {
      render(<Button>Sized Text</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-sm')
    })
  })

  // ============================================================
  // TC-BTN-011: Custom className Merging
  // ============================================================
  describe('Custom className', () => {
    /**
     * Priority: Medium
     * Category: Functional
     *
     * Verify that custom classNames are merged properly
     */
    it('TC-BTN-011a: merges custom className with defaults', () => {
      render(<Button className="custom-class">Custom</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('inline-flex') // base class still present
    })

    it('TC-BTN-011b: custom className can override defaults via tailwind-merge', () => {
      render(<Button className="px-8">Override Padding</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-8')
    })
  })

  // ============================================================
  // TC-BTN-012: Accessibility
  // ============================================================
  describe('Accessibility', () => {
    /**
     * Priority: High
     * Category: Accessibility
     *
     * Verify ARIA attributes and keyboard accessibility
     */
    it('TC-BTN-012a: has correct button role', () => {
      render(<Button>Accessible</Button>)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('TC-BTN-012b: supports aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>)

      const button = screen.getByRole('button', { name: /close dialog/i })
      expect(button).toBeInTheDocument()
    })

    it('TC-BTN-012c: supports type attribute', () => {
      render(<Button type="submit">Submit</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  // ============================================================
  // TC-BTN-013: Edge Cases
  // ============================================================
  describe('Edge Cases', () => {
    /**
     * Priority: Medium
     * Category: Edge Case
     *
     * Test unusual but valid usage patterns
     */
    it('TC-BTN-013a: renders with empty children', () => {
      render(<Button></Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('TC-BTN-013b: renders with complex children (icons + text)', () => {
      render(
        <Button>
          <span data-testid="icon">*</span>
          <span>With Icon</span>
        </Button>,
      )

      expect(screen.getByTestId('icon')).toBeInTheDocument()
      expect(screen.getByText('With Icon')).toBeInTheDocument()
    })

    it('TC-BTN-013c: handles multiple click events', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Multi Click</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(3)
    })
  })
})
