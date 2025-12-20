/**
 * MessageList - Scrollable message container
 *
 * Features:
 * - Renders list of ChatMessage components
 * - Shows empty state when no messages
 * - Auto-scrolls to bottom on new message
 */

import { useEffect, useRef } from 'react'
import { ChatMessage } from './chat-message'
import type { MessageListProps } from './types'

export function MessageList({
  messages,
  emptyStateMessage = 'No messages yet. Start a conversation!',
}: MessageListProps) {
  const scrollAnchorRef = useRef<HTMLDivElement>(null)
  const prevMessagesLengthRef = useRef(messages.length)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessagesLengthRef.current = messages.length
  }, [messages.length])

  // Initial scroll on mount if there are messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollAnchorRef.current?.scrollIntoView()
    }
  }, [messages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  if (messages.length === 0) {
    return (
      <div
        data-testid="empty-state"
        role="status"
        className="flex items-center justify-center h-full text-gray-500"
      >
        {emptyStateMessage}
      </div>
    )
  }

  return (
    <div
      role="list"
      aria-live="polite"
      className="flex flex-col gap-4 overflow-y-auto p-4"
    >
      {messages.map((message) => (
        <div key={message.id} role="listitem">
          <ChatMessage message={message} />
        </div>
      ))}
      <div ref={scrollAnchorRef} data-testid="scroll-anchor" />
    </div>
  )
}
