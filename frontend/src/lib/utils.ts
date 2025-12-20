import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names using clsx and merges Tailwind classes intelligently.
 * This is the standard shadcn/ui utility function.
 *
 * @example
 * cn("px-2 py-1", "px-4") // => "py-1 px-4" (px-4 wins)
 * cn("bg-red-500", condition && "bg-blue-500") // conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
