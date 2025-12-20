/**
 * Sidebar - Navigation and chat history component
 *
 * Design Reference:
 * - Background: bg-white dark:bg-[#0c0d0d]
 * - Width: w-72
 * - Border: border-r border-gray-200 dark:border-gray-800/50
 */

import {
  ChevronDown,
  FolderOpen,
  Grid3X3,
  MessageCircle,
  MessageSquare,
  PenSquare,
  Search,
  Settings,
  SquareStack,
  Users,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { SidebarProps } from './types'

const navItems = [
  { id: 'projects', label: 'My projects', icon: FolderOpen },
  { id: 'chats', label: 'Chats', icon: MessageCircle },
  { id: 'templates', label: 'Templates', icon: Grid3X3 },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'teams', label: 'Teams', icon: Users },
]

export function Sidebar({
  userName = 'John Smith',
  userPlan = 'Free Plan',
  activeItem = 'chats',
  onNavigate,
  chatHistory = [],
  onSelectChat,
}: SidebarProps) {
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <aside className="w-72 bg-white dark:bg-sidebar-dark flex flex-col border-r border-gray-200 dark:border-gray-800/50 flex-shrink-0 z-20">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-widest uppercase font-mono">
            Voxa
          </h1>
        </div>
        <div className="flex gap-3 text-gray-500 dark:text-gray-400">
          <button
            type="button"
            className="hover:text-primary transition-colors"
            aria-label="new chat"
          >
            <PenSquare className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="hover:text-primary transition-colors"
            aria-label="dashboard"
          >
            <SquareStack className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-6">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-primary" />
          <Input
            type="text"
            placeholder="Search"
            className="pl-10 rounded-xl bg-gray-100 dark:bg-surface-dark/50 border-none"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate?.(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-colors group ${
                isActive
                  ? 'bg-gray-200 dark:bg-surface-dark text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-dark'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? 'text-primary' : 'group-hover:text-primary'}`}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Chat History */}
      <div className="mt-8 px-3 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Chats
        </div>
        <div className="space-y-1">
          {chatHistory.length > 0 ? (
            chatHistory.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => onSelectChat?.(chat.id)}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors group"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm truncate">{chat.title}</span>
              </button>
            ))
          ) : (
            <>
              <button
                type="button"
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm truncate">Startup Name Generator</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm truncate">Weekend Project Ideas</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm truncate">Future of Tech</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800/50">
        <button
          type="button"
          className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs text-white font-bold">
            {initials}
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium dark:text-white">
              {userName}
            </div>
            <div className="text-xs text-gray-500">{userPlan}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </aside>
  )
}
