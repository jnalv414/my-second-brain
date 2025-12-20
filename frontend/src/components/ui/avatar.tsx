import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Avatar components following Voxa design system.
 * Uses gradient from primary (#339989) to secondary (#7de2d1).
 *
 * Usage:
 * ```tsx
 * <Avatar size="lg">
 *   <AvatarImage src="/avatar.jpg" alt="User" />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 * ```
 *
 * Components:
 * - Avatar: Root container (span) with sizing and shape
 * - AvatarImage: Image element for profile picture
 * - AvatarFallback: Fallback with gradient background for initials
 */

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'default' | 'lg'
}

/**
 * Avatar root component - circular container with size variants.
 *
 * @example Default size
 * <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
 *
 * @example Large avatar with image
 * <Avatar size="lg">
 *   <AvatarImage src="/profile.jpg" alt="John Doe" />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 */
const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-6 w-6',
      default: 'h-8 w-8',
      lg: 'h-12 w-12',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full items-center justify-center',
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Avatar.displayName = 'Avatar'

export interface AvatarImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {}

/**
 * Avatar image component - displays profile picture.
 *
 * @example
 * <AvatarImage src="/avatar.jpg" alt="Profile picture" />
 */
const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt = '', ...props }, ref) => {
    return (
      <img
        ref={ref}
        alt={alt}
        className={cn('aspect-square h-full w-full', className)}
        {...props}
      />
    )
  },
)
AvatarImage.displayName = 'AvatarImage'

export interface AvatarFallbackProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * Avatar fallback component - shows initials with gradient background.
 * Uses Voxa gradient: primary to secondary.
 *
 * @example Two letter initials
 * <AvatarFallback>JD</AvatarFallback>
 *
 * @example Single letter
 * <AvatarFallback>J</AvatarFallback>
 *
 * @example Icon fallback
 * <AvatarFallback><UserIcon /></AvatarFallback>
 */
const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xs font-semibold',
          className,
        )}
        {...props}
      />
    )
  },
)
AvatarFallback.displayName = 'AvatarFallback'

export { Avatar, AvatarImage, AvatarFallback }
