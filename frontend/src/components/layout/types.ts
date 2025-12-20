/**
 * Layout component types
 */

import type { ChatMessage } from '@/hooks/use-chat'

export interface SidebarProps {
  /** Current user name */
  userName?: string
  /** User plan type */
  userPlan?: string
  /** Active navigation item */
  activeItem?: string
  /** Callback when navigation item is clicked */
  onNavigate?: (item: string) => void
  /** Chat history items */
  chatHistory?: { id: string; title: string }[]
  /** Callback when chat is selected */
  onSelectChat?: (id: string) => void
}

export interface ChatLayoutProps {
  /** Messages to display */
  messages: ChatMessage[]
  /** Whether the assistant is loading/thinking */
  isLoading?: boolean
  /** Callback when message is sent */
  onSendMessage: (content: string) => void
  /** Usage credits (used/total) */
  credits?: { used: number; total: number }
  /** User avatar URL */
  userAvatarUrl?: string
}

export interface UserProfileProps {
  /** User name */
  name: string
  /** User plan */
  plan: string
  /** User initials for avatar */
  initials?: string
}
