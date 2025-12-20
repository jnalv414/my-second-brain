import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

/**
 * Avatar Component Test Suite
 *
 * Tests for the Avatar compound component with Voxa theming.
 * Components: Avatar (root), AvatarImage, AvatarFallback
 *
 * Design tokens (Voxa):
 * - Primary: #339989 (gradient start)
 * - Secondary: #7de2d1 (gradient end)
 * - Gradient: from-primary to-secondary
 */
describe('Avatar', () => {
  // ============================================================
  // TC-AVT-001: Avatar Root Rendering
  // ============================================================
  describe('Avatar Root Component', () => {
    /**
     * Priority: Critical
     * Category: Functional
     *
     * Preconditions: Avatar component is rendered
     * Expected Result: A span element with avatar classes is rendered
     */
    it('TC-AVT-001a: renders an avatar container', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toBeInTheDocument()
    })

    it('TC-AVT-001b: has relative positioning for overlay elements', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('relative')
    })

    it('TC-AVT-001c: has flex centering classes', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('flex')
      expect(avatar).toHaveClass('items-center')
      expect(avatar).toHaveClass('justify-center')
    })

    it('TC-AVT-001d: has shrink-0 to prevent flex shrinking', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('shrink-0')
    })

    it('TC-AVT-001e: has overflow-hidden to clip image', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('overflow-hidden')
    })

    it('TC-AVT-001f: has rounded-full for circular shape', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('rounded-full')
    })

    it('TC-AVT-001g: forwards ref to span element', () => {
      const ref = { current: null as HTMLSpanElement | null }
      render(
        <Avatar ref={ref}>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })
  })

  // ============================================================
  // TC-AVT-002: Avatar Size Variants
  // ============================================================
  describe('Avatar Sizes', () => {
    /**
     * Priority: High
     * Category: Functional
     *
     * Test size variants: sm, default, lg
     */
    it('TC-AVT-002a: renders with default size (h-10 w-10 / h-8 w-8)', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('avatar')
      // Default size is typically h-10 w-10 or h-8 w-8
      expect(avatar.className).toMatch(/h-(8|10)/)
      expect(avatar.className).toMatch(/w-(8|10)/)
    })

    it('TC-AVT-002b: renders with small size (h-6 w-6 or h-8 w-8)', () => {
      render(
        <Avatar data-testid="avatar" size="sm">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar.className).toMatch(/h-(6|8)/)
      expect(avatar.className).toMatch(/w-(6|8)/)
    })

    it('TC-AVT-002c: renders with large size (h-12 w-12 or h-16 w-16)', () => {
      render(
        <Avatar data-testid="avatar" size="lg">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar.className).toMatch(/h-(12|14|16)/)
      expect(avatar.className).toMatch(/w-(12|14|16)/)
    })
  })

  // ============================================================
  // TC-AVT-003: AvatarImage Component
  // ============================================================
  describe('AvatarImage Component', () => {
    /**
     * Priority: Critical
     * Category: Functional
     *
     * Test image rendering when src is provided
     */
    it('TC-AVT-003a: renders an img element when src is provided', () => {
      render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="User avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const img = screen.getByRole('img', { name: /user avatar/i })
      expect(img).toBeInTheDocument()
    })

    it('TC-AVT-003b: has correct src attribute', () => {
      render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', '/avatar.jpg')
    })

    it('TC-AVT-003c: has alt attribute for accessibility', () => {
      render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="John Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'John Doe')
    })

    it('TC-AVT-003d: has aspect-square class', () => {
      render(
        <Avatar>
          <AvatarImage
            src="/avatar.jpg"
            alt="User"
            data-testid="avatar-image"
          />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const img = screen.getByTestId('avatar-image')
      expect(img).toHaveClass('aspect-square')
    })

    it('TC-AVT-003e: has h-full w-full to fill container', () => {
      render(
        <Avatar>
          <AvatarImage
            src="/avatar.jpg"
            alt="User"
            data-testid="avatar-image"
          />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const img = screen.getByTestId('avatar-image')
      expect(img).toHaveClass('h-full')
      expect(img).toHaveClass('w-full')
    })

    it('TC-AVT-003f: forwards ref to img element', () => {
      const ref = { current: null as HTMLImageElement | null }
      render(
        <Avatar>
          <AvatarImage ref={ref} src="/avatar.jpg" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      expect(ref.current).toBeInstanceOf(HTMLImageElement)
    })
  })

  // ============================================================
  // TC-AVT-004: AvatarFallback Component
  // ============================================================
  describe('AvatarFallback Component', () => {
    /**
     * Priority: Critical
     * Category: Functional
     *
     * Test fallback rendering when no image
     */
    it('TC-AVT-004a: renders fallback text/initials', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('TC-AVT-004b: has gradient background classes', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('fallback')
      // Voxa uses gradient from primary to secondary
      expect(fallback).toHaveClass('bg-gradient-to-br')
      expect(fallback).toHaveClass('from-primary')
      expect(fallback).toHaveClass('to-secondary')
    })

    it('TC-AVT-004c: has h-full w-full to fill container', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('fallback')
      expect(fallback).toHaveClass('h-full')
      expect(fallback).toHaveClass('w-full')
    })

    it('TC-AVT-004d: has flex centering for initials', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('fallback')
      expect(fallback).toHaveClass('flex')
      expect(fallback).toHaveClass('items-center')
      expect(fallback).toHaveClass('justify-center')
    })

    it('TC-AVT-004e: has rounded-full to match avatar shape', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('fallback')
      expect(fallback).toHaveClass('rounded-full')
    })

    it('TC-AVT-004f: has white text color for contrast', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('fallback')
      expect(fallback).toHaveClass('text-white')
    })

    it('TC-AVT-004g: has appropriate font styling', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('fallback')
      // Per Voxa design: text-xs or text-sm with font-bold
      expect(fallback.className).toMatch(/text-(xs|sm)/)
      expect(fallback.className).toMatch(/font-(medium|semibold|bold)/)
    })

    it('TC-AVT-004h: forwards ref to span element', () => {
      const ref = { current: null as HTMLSpanElement | null }
      render(
        <Avatar>
          <AvatarFallback ref={ref}>JD</AvatarFallback>
        </Avatar>,
      )

      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })
  })

  // ============================================================
  // TC-AVT-005: Image/Fallback Behavior
  // ============================================================
  describe('Image/Fallback Behavior', () => {
    /**
     * Priority: Critical
     * Category: Integration
     *
     * Test that fallback shows when image fails or not provided
     */
    it('TC-AVT-005a: shows fallback when no AvatarImage provided', () => {
      render(
        <Avatar>
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>,
      )

      expect(screen.getByText('FB')).toBeInTheDocument()
    })

    it('TC-AVT-005b: shows image when src is valid', () => {
      render(
        <Avatar>
          <AvatarImage src="/valid-image.jpg" alt="Valid" />
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>,
      )

      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('TC-AVT-005c: both image and fallback can be present in DOM', () => {
      // Note: The actual show/hide logic may be handled by radix-ui
      // This test verifies the structure is correct
      render(
        <Avatar>
          <AvatarImage src="/image.jpg" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      expect(screen.getByRole('img')).toBeInTheDocument()
      // Fallback might be hidden but should exist in structure
      expect(screen.getByText('JD')).toBeInTheDocument()
    })
  })

  // ============================================================
  // TC-AVT-006: Custom className Merging
  // ============================================================
  describe('Custom className', () => {
    /**
     * Priority: Medium
     * Category: Functional
     *
     * Verify custom classNames are merged properly
     */
    it('TC-AVT-006a: Avatar merges custom className', () => {
      render(
        <Avatar className="custom-avatar" data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('custom-avatar')
      expect(avatar).toHaveClass('relative') // base class still present
    })

    it('TC-AVT-006b: AvatarImage merges custom className', () => {
      render(
        <Avatar>
          <AvatarImage
            src="/img.jpg"
            alt="User"
            className="custom-image"
            data-testid="image"
          />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const image = screen.getByTestId('image')
      expect(image).toHaveClass('custom-image')
    })

    it('TC-AVT-006c: AvatarFallback merges custom className', () => {
      render(
        <Avatar>
          <AvatarFallback className="custom-fallback" data-testid="fallback">
            JD
          </AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('fallback')
      expect(fallback).toHaveClass('custom-fallback')
      expect(fallback).toHaveClass('flex') // base class still present
    })
  })

  // ============================================================
  // TC-AVT-007: Accessibility
  // ============================================================
  describe('Accessibility', () => {
    /**
     * Priority: High
     * Category: Accessibility
     *
     * Verify ARIA attributes and screen reader support
     */
    it('TC-AVT-007a: AvatarImage has alt attribute', () => {
      render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="Profile picture of John Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const img = screen.getByRole('img')
      expect(img).toHaveAccessibleName('Profile picture of John Doe')
    })

    it('TC-AVT-007b: Fallback text is readable by screen readers', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      // The initials should be visible/accessible
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('TC-AVT-007c: supports aria-label on Avatar root', () => {
      render(
        <Avatar aria-label="User profile picture" data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>,
      )

      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveAttribute('aria-label', 'User profile picture')
    })
  })

  // ============================================================
  // TC-AVT-008: Edge Cases
  // ============================================================
  describe('Edge Cases', () => {
    /**
     * Priority: Medium
     * Category: Edge Case
     *
     * Test unusual but valid patterns
     */
    it('TC-AVT-008a: handles single character fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>J</AvatarFallback>
        </Avatar>,
      )

      expect(screen.getByText('J')).toBeInTheDocument()
    })

    it('TC-AVT-008b: handles empty fallback gracefully', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback data-testid="fallback"></AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('fallback')
      expect(fallback).toBeInTheDocument()
    })

    it('TC-AVT-008c: handles long initials (truncation not guaranteed)', () => {
      render(
        <Avatar>
          <AvatarFallback>ABCD</AvatarFallback>
        </Avatar>,
      )

      expect(screen.getByText('ABCD')).toBeInTheDocument()
    })

    it('TC-AVT-008d: handles special characters in fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>*</AvatarFallback>
        </Avatar>,
      )

      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('TC-AVT-008e: handles emoji fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>:)</AvatarFallback>
        </Avatar>,
      )

      expect(screen.getByText(':)')).toBeInTheDocument()
    })

    it('TC-AVT-008f: Avatar without children renders', () => {
      render(<Avatar data-testid="empty-avatar" />)

      const avatar = screen.getByTestId('empty-avatar')
      expect(avatar).toBeInTheDocument()
    })

    it('TC-AVT-008g: handles JSX children in fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>
            <span data-testid="icon">+</span>
          </AvatarFallback>
        </Avatar>,
      )

      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })
  })

  // ============================================================
  // TC-AVT-009: Gradient Styling (Voxa Theme)
  // ============================================================
  describe('Gradient Styling (Voxa Theme)', () => {
    /**
     * Priority: High
     * Category: Functional
     *
     * Verify gradient uses Voxa colors: primary (#339989) to secondary (#7de2d1)
     */
    it('TC-AVT-009a: fallback has gradient direction class', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('fallback')
      // Voxa uses bg-gradient-to-br (bottom-right) or bg-gradient-to-tr (top-right)
      expect(fallback.className).toMatch(/bg-gradient-to-(br|tr)/)
    })

    it('TC-AVT-009b: fallback has from-primary gradient start', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('fallback')
      expect(fallback).toHaveClass('from-primary')
    })

    it('TC-AVT-009c: fallback has to-secondary gradient end', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>,
      )

      const fallback = screen.getByTestId('fallback')
      expect(fallback).toHaveClass('to-secondary')
    })
  })

  // ============================================================
  // TC-AVT-010: Composition Patterns
  // ============================================================
  describe('Composition Patterns', () => {
    /**
     * Priority: Medium
     * Category: Integration
     *
     * Test common usage patterns
     */
    it('TC-AVT-010a: works in a list of avatars', () => {
      render(
        <div>
          <Avatar data-testid="avatar-1">
            <AvatarFallback>A1</AvatarFallback>
          </Avatar>
          <Avatar data-testid="avatar-2">
            <AvatarFallback>A2</AvatarFallback>
          </Avatar>
          <Avatar data-testid="avatar-3">
            <AvatarFallback>A3</AvatarFallback>
          </Avatar>
        </div>,
      )

      expect(screen.getByTestId('avatar-1')).toBeInTheDocument()
      expect(screen.getByTestId('avatar-2')).toBeInTheDocument()
      expect(screen.getByTestId('avatar-3')).toBeInTheDocument()
    })

    it('TC-AVT-010b: works within a flex container', () => {
      render(
        <div className="flex items-center gap-2">
          <Avatar data-testid="avatar">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <span>John Doe</span>
        </div>,
      )

      expect(screen.getByTestId('avatar')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('TC-AVT-010c: different sizes in same context', () => {
      render(
        <div>
          <Avatar size="sm" data-testid="small">
            <AvatarFallback>SM</AvatarFallback>
          </Avatar>
          <Avatar size="default" data-testid="default">
            <AvatarFallback>MD</AvatarFallback>
          </Avatar>
          <Avatar size="lg" data-testid="large">
            <AvatarFallback>LG</AvatarFallback>
          </Avatar>
        </div>,
      )

      expect(screen.getByTestId('small')).toBeInTheDocument()
      expect(screen.getByTestId('default')).toBeInTheDocument()
      expect(screen.getByTestId('large')).toBeInTheDocument()
    })
  })
})
