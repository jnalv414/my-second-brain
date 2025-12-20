/**
 * ChatLayout - Main chat area component
 *
 * Design Reference:
 * - Background: bg-gray-50 dark:bg-background-dark
 * - Gradient overlay at top right
 * - Credits badge in header
 */

import { Diamond } from 'lucide-react'
import { ChatInput } from '@/components/chat/chat-input'
import { MessageList } from '@/components/chat/message-list'
import type { ChatLayoutProps } from './types'

export function ChatLayout({
  messages,
  isLoading = false,
  onSendMessage,
  credits = { used: 6, total: 75 },
  userAvatarUrl,
}: ChatLayoutProps) {
  return (
    <main className="flex-1 flex flex-col relative bg-gray-50 dark:bg-background-dark">
      {/* Gradient overlay */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-[#1c383d] via-transparent to-transparent opacity-60 pointer-events-none" />

      {/* Header */}
      <header className="absolute top-6 right-8 flex items-center gap-6 z-10">
        {/* Credits badge */}
        <div className="flex items-center gap-2 bg-white dark:bg-surface-dark/80 backdrop-blur px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
          <Diamond className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium font-mono text-gray-600 dark:text-gray-300">
            {credits.used}/{credits.total}
          </span>
        </div>

        {/* User avatar */}
        <button type="button" className="relative">
          {userAvatarUrl ? (
            <img
              src={userAvatarUrl}
              alt="User Avatar"
              className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-sm bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
              U
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
        </button>
      </header>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-6 py-10 md:px-20 lg:px-32 scroll-smooth">
        <div className="max-w-4xl mx-auto mt-12 pb-24">
          <MessageList
            messages={messages}
            emptyStateMessage="How can I help you today?"
          />
          {isLoading && (
            <div className="flex gap-4 items-start mt-6 animate-fade-in-up">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="flex-1">
                <div className="text-gray-500 text-sm">Thinking...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="p-6 md:px-20 lg:px-32 bg-gradient-to-t from-white via-white to-transparent dark:from-background-dark dark:via-background-dark dark:to-transparent pt-10 pb-8">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSend={onSendMessage} disabled={isLoading} />
          <div className="text-center mt-3">
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Voxa may produce inaccurate information about people, places, or
              facts.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
