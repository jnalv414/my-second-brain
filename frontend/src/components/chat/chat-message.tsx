/**
 * ChatMessage - Message bubble component
 *
 * Displays user or AI messages with appropriate styling:
 * - User: right-aligned, rounded bubble
 * - AI: left-aligned with gradient avatar, action buttons
 */

import { ActionButtons } from './action-buttons'
import type { ChatMessageProps } from './types'

export function ChatMessage({
  message,
  showActions = false,
  actionButtonsProps,
}: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <article
      aria-label={`${message.role} message`}
      data-message-id={message.id}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}
    >
      {isAssistant && (
        <div
          data-testid="ai-avatar"
          className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0"
        />
      )}

      <div className="flex flex-col gap-2">
        <div
          className={
            isUser
              ? 'max-w-2xl bg-gray-200 dark:bg-surface-dark px-6 py-4 rounded-3xl rounded-tr-md'
              : 'max-w-2xl px-6 py-4'
          }
        >
          {message.content}
        </div>

        {isAssistant && showActions && (
          <ActionButtons {...actionButtonsProps} />
        )}
      </div>
    </article>
  )
}
