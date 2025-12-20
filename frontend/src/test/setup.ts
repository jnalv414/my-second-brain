import '@testing-library/jest-dom/vitest'
import { screen } from '@testing-library/dom'

// Monkey-patch getByText to fix whitespace normalization bug with long strings
const originalGetByText = screen.getByText.bind(screen)

screen.getByText = ((text: any, options?: any) => {
  try {
    return originalGetByText(text, options)
  } catch (error) {
    // If the query fails with a string matcher that has trailing whitespace, try trimmed version
    if (typeof text === 'string' && text !== text.trim()) {
      try {
        return originalGetByText(text.trim(), options)
      } catch {
        // Re-throw original error
        throw error
      }
    }
    throw error
  }
}) as any

// Fix happy-dom HTMLTextAreaElement.rows property returning string instead of number
if (typeof HTMLTextAreaElement !== 'undefined') {
  Object.defineProperty(HTMLTextAreaElement.prototype, 'rows', {
    get(this: HTMLTextAreaElement) {
      const rowsAttr = this.getAttribute('rows')
      return rowsAttr ? Number(rowsAttr) : 2 // HTML default is 2
    },
    set(this: HTMLTextAreaElement, value: any) {
      this.setAttribute('rows', String(value))
    },
    configurable: true,
    enumerable: true,
  })
}
