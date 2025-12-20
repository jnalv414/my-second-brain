import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Theme } from './use-theme'
import { useTheme } from './use-theme'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
})()

describe('useTheme', () => {
  beforeEach(() => {
    // Reset localStorage mock before each test
    localStorageMock.clear()
    vi.stubGlobal('localStorage', localStorageMock)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // ============================================================
  // TC-THEME-001: Default Theme
  // ============================================================
  describe('default theme', () => {
    it('should default to dark theme when no stored preference', () => {
      // Arrange & Act
      const { result } = renderHook(() => useTheme())

      // Assert
      expect(result.current.theme).toBe('dark')
    })

    it('should provide toggleTheme function', () => {
      // Arrange & Act
      const { result } = renderHook(() => useTheme())

      // Assert
      expect(typeof result.current.toggleTheme).toBe('function')
    })

    it('should provide setTheme function', () => {
      // Arrange & Act
      const { result } = renderHook(() => useTheme())

      // Assert
      expect(typeof result.current.setTheme).toBe('function')
    })
  })

  // ============================================================
  // TC-THEME-002: toggleTheme
  // ============================================================
  describe('toggleTheme', () => {
    it('should toggle from dark to light', () => {
      // Arrange
      const { result } = renderHook(() => useTheme())
      expect(result.current.theme).toBe('dark')

      // Act
      act(() => {
        result.current.toggleTheme()
      })

      // Assert
      expect(result.current.theme).toBe('light')
    })

    it('should toggle from light to dark', () => {
      // Arrange
      const { result } = renderHook(() => useTheme())

      // Get to light mode first
      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('light')

      // Act
      act(() => {
        result.current.toggleTheme()
      })

      // Assert
      expect(result.current.theme).toBe('dark')
    })

    it('should toggle multiple times correctly', () => {
      // Arrange
      const { result } = renderHook(() => useTheme())

      // Act & Assert - toggle through full cycle
      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('light')

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('dark')

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.theme).toBe('light')
    })

    it('should persist toggled theme to localStorage', () => {
      // Arrange
      const { result } = renderHook(() => useTheme())

      // Act
      act(() => {
        result.current.toggleTheme()
      })

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
    })
  })

  // ============================================================
  // TC-THEME-003: setTheme
  // ============================================================
  describe('setTheme', () => {
    it('should set theme to dark', () => {
      // Arrange
      const { result } = renderHook(() => useTheme())

      // Act
      act(() => {
        result.current.setTheme('dark')
      })

      // Assert
      expect(result.current.theme).toBe('dark')
    })

    it('should set theme to light', () => {
      // Arrange
      const { result } = renderHook(() => useTheme())

      // Act
      act(() => {
        result.current.setTheme('light')
      })

      // Assert
      expect(result.current.theme).toBe('light')
    })

    it('should persist set theme to localStorage', () => {
      // Arrange
      const { result } = renderHook(() => useTheme())

      // Act
      act(() => {
        result.current.setTheme('light')
      })

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
    })

    it('should overwrite previously set theme', () => {
      // Arrange
      const { result } = renderHook(() => useTheme())

      // Act
      act(() => {
        result.current.setTheme('light')
      })
      act(() => {
        result.current.setTheme('dark')
      })

      // Assert
      expect(result.current.theme).toBe('dark')
      expect(localStorageMock.setItem).toHaveBeenLastCalledWith('theme', 'dark')
    })

    it('should handle setting the same theme twice', () => {
      // Arrange
      const { result } = renderHook(() => useTheme())

      // Act
      act(() => {
        result.current.setTheme('dark')
      })
      act(() => {
        result.current.setTheme('dark')
      })

      // Assert
      expect(result.current.theme).toBe('dark')
    })
  })

  // ============================================================
  // TC-THEME-004: localStorage Persistence
  // ============================================================
  describe('localStorage persistence', () => {
    it('should read stored theme on initialization', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValueOnce('light')

      // Act
      const { result } = renderHook(() => useTheme())

      // Assert
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme')
      expect(result.current.theme).toBe('light')
    })

    it('should use dark as fallback when localStorage has invalid value', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValueOnce('invalid-theme')

      // Act
      const { result } = renderHook(() => useTheme())

      // Assert
      expect(result.current.theme).toBe('dark')
    })

    it('should use dark as fallback when localStorage is empty', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValueOnce(null)

      // Act
      const { result } = renderHook(() => useTheme())

      // Assert
      expect(result.current.theme).toBe('dark')
    })

    it('should persist theme changes immediately', () => {
      // Arrange
      const { result } = renderHook(() => useTheme())

      // Act
      act(() => {
        result.current.setTheme('light')
      })

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
    })

    it("should use localStorage key 'theme'", () => {
      // Arrange
      const { result } = renderHook(() => useTheme())

      // Act
      act(() => {
        result.current.toggleTheme()
      })

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'theme',
        expect.any(String),
      )
    })
  })

  // ============================================================
  // TC-THEME-005: Hook Stability
  // ============================================================
  describe('hook stability', () => {
    it('should maintain stable function references across rerenders', () => {
      // Arrange
      const { result, rerender } = renderHook(() => useTheme())
      const initialToggleTheme = result.current.toggleTheme
      const initialSetTheme = result.current.setTheme

      // Act
      rerender()

      // Assert - functions should be stable (memoized)
      expect(result.current.toggleTheme).toBe(initialToggleTheme)
      expect(result.current.setTheme).toBe(initialSetTheme)
    })

    it('should maintain theme value across rerenders without state change', () => {
      // Arrange
      const { result, rerender } = renderHook(() => useTheme())

      act(() => {
        result.current.setTheme('light')
      })

      // Act
      rerender()
      rerender()
      rerender()

      // Assert
      expect(result.current.theme).toBe('light')
    })
  })

  // ============================================================
  // TC-THEME-006: Document Class Manipulation (Optional Enhancement)
  // ============================================================
  describe('document class manipulation', () => {
    it('should add dark class to document when theme is dark', () => {
      // Arrange
      const documentClassListMock = {
        add: vi.fn(),
        remove: vi.fn(),
        toggle: vi.fn(),
        contains: vi.fn(),
      }
      vi.spyOn(document.documentElement.classList, 'add').mockImplementation(
        documentClassListMock.add,
      )
      vi.spyOn(document.documentElement.classList, 'remove').mockImplementation(
        documentClassListMock.remove,
      )

      // Act
      const { result } = renderHook(() => useTheme())

      // Assert
      expect(documentClassListMock.add).toHaveBeenCalledWith('dark')
    })

    it('should remove dark class and add light when switching to light', () => {
      // Arrange
      const addMock = vi.fn()
      const removeMock = vi.fn()
      vi.spyOn(document.documentElement.classList, 'add').mockImplementation(
        addMock,
      )
      vi.spyOn(document.documentElement.classList, 'remove').mockImplementation(
        removeMock,
      )

      const { result } = renderHook(() => useTheme())

      // Act
      act(() => {
        result.current.setTheme('light')
      })

      // Assert
      expect(removeMock).toHaveBeenCalledWith('dark')
    })
  })

  // ============================================================
  // TC-THEME-007: Edge Cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle localStorage throwing an error gracefully', () => {
      // Arrange
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage is not available')
      })

      // Act & Assert - should not throw
      expect(() => {
        renderHook(() => useTheme())
      }).not.toThrow()
    })

    it('should handle localStorage setItem throwing an error gracefully', () => {
      // Arrange
      const { result } = renderHook(() => useTheme())
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage quota exceeded')
      })

      // Act & Assert - should not throw
      expect(() => {
        act(() => {
          result.current.toggleTheme()
        })
      }).not.toThrow()

      // Theme should still change in memory
      expect(result.current.theme).toBe('light')
    })
  })

  // ============================================================
  // TC-THEME-008: Type Safety
  // ============================================================
  describe('type safety', () => {
    it('should only accept valid Theme values', () => {
      // Arrange
      const { result } = renderHook(() => useTheme())

      // Act
      act(() => {
        result.current.setTheme('dark')
      })

      // Assert
      const theme: Theme = result.current.theme
      expect(['dark', 'light']).toContain(theme)
    })
  })
})
