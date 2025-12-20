/**
 * Shared types for chat components
 */

export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp?: Date
}

export interface ActionButtonsProps {
  onCopy?: () => void
  onThumbsUp?: () => void
  onThumbsDown?: () => void
  onSpeak?: () => void
  onRegenerate?: () => void
}

export interface ChatMessageProps {
  message: Message
  showActions?: boolean
  actionButtonsProps?: ActionButtonsProps
}

export interface ChatInputProps {
  onSend: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

export interface MessageListProps {
  messages: Message[]
  emptyStateMessage?: string
}
