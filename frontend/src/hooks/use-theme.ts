import { useCallback, useEffect, useState } from 'react'

/**
 * Theme management hook
 *
 * Handles dark/light mode toggle with localStorage persistence.
 */

export type Theme = 'dark' | 'light'

export interface UseThemeReturn {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = 'theme'
const DEFAULT_THEME: Theme = 'dark'

/**
 * Validates if a value is a valid Theme
 */
function isValidTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light'
}

/**
 * Reads theme from localStorage with error handling
 */
function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isValidTheme(stored)) {
      return stored
    }
  } catch {
    // localStorage not available or error reading
  }
  return DEFAULT_THEME
}

/**
 * Hook for managing application theme (dark/light mode)
 *
 * @returns Theme state and operations
 *
 * @example
 * ```tsx
 * const { theme, toggleTheme, setTheme } = useTheme()
 *
 * // Toggle between dark and light
 * toggleTheme()
 *
 * // Set specific theme
 * setTheme("dark")
 * ```
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)

  // Apply theme to document and persist to localStorage
  useEffect(() => {
    // Update document classes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage not available or quota exceeded
    }
  }, [theme])

  const setTheme = useCallback((newTheme: Theme): void => {
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback((): void => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return {
    theme,
    toggleTheme,
    setTheme,
  }
}
