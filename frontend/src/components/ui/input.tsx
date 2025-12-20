import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Input component following Voxa design system.
 * Dark mode uses surface-dark (#2b2c28) background.
 *
 * Usage:
 * ```tsx
 * <Input type="email" placeholder="Enter email" />
 * <Input type="password" disabled />
 * <Input type="file" />
 * ```
 *
 * Features:
 * - Full width by default
 * - Dark mode support (dark:bg-surface dark:border-*)
 * - Focus ring with primary color
 * - Disabled state styling
 * - File input styling
 * - Supports all HTML input attributes
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input component with Voxa theming and dark mode support.
 *
 * @example Email input
 * <Input type="email" placeholder="you@example.com" />
 *
 * @example Password input
 * <Input type="password" required />
 *
 * @example File input
 * <Input type="file" accept="image/*" />
 *
 * @example Disabled input
 * <Input disabled value="Read only" />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', onChange, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Prevent onChange from firing when input is disabled
      // This ensures consistent behavior in testing environments (jsdom/happy-dom)
      if (disabled) return
      onChange?.(e)
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-surface dark:border-border dark:text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className,
        )}
        ref={ref}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
