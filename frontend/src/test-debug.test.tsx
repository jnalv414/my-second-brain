import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Debug character codes', () => {
  it('checks exact character codes', () => {
    const longContent =
      'This is a very long message that should not be truncated. '.repeat(10)

    render(<div>{longContent}</div>)

    const div = document.querySelector('div')
    const textContent = div?.textContent || ''

    console.log('longContent length:', longContent.length)
    console.log('textContent length:', textContent.length)
    console.log('Are they equal?', longContent === textContent)
    console.log(
      'longContent last 5 chars:',
      Array.from(longContent.slice(-5)).map((c) => c.charCodeAt(0)),
    )
    console.log(
      'textContent last 5 chars:',
      Array.from(textContent.slice(-5)).map((c) => c.charCodeAt(0)),
    )

    // Try finding with substring
    const found = screen.queryByText((content, element) => {
      return (
        element?.tagName === 'DIV' && content.startsWith('This is a very long')
      )
    })
    expect(found).toBeInTheDocument()
  })
})
