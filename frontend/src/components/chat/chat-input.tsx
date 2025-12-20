/**
 * ChatInput - Message input area component
 *
 * Features:
 * - Textarea with placeholder
 * - Action buttons (add, image, mic)
 * - Send button with primary color
 * - Auto-expanding textarea
 */

import { Image, Mic, Plus, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ChatInputProps } from './types'

export function ChatInput({
  onSend,
  placeholder = 'Send a message...',
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-expand textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      // Reset height to recalculate
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [])

  const handleSend = () => {
    const trimmedValue = value.trim()
    if (!trimmedValue || disabled) return

    onSend(trimmedValue)
    setValue('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-[#1e2020] p-3 flex gap-3 items-end">
      <div className="flex gap-2 items-center">
        <button
          type="button"
          aria-label="add attachment"
          className="p-2 text-gray-500 hover:text-primary transition-colors"
          disabled={disabled}
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          type="button"
          aria-label="upload image"
          className="p-2 text-gray-500 hover:text-primary transition-colors"
          disabled={disabled}
        >
          <Image className="w-5 h-5" />
        </button>

        <button
          type="button"
          aria-label="voice input"
          className="p-2 text-gray-500 hover:text-primary transition-colors"
          disabled={disabled}
        >
          <Mic className="w-5 h-5" />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label="message input"
        className="flex-1 resize-none bg-transparent outline-none disabled:opacity-50"
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={disabled}
        aria-label="send"
        className="p-2 bg-primary hover:bg-opacity-90 text-white rounded-xl transition-colors disabled:opacity-50"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  )
}
