const quickActions = [
  { icon: '🔍', label: 'Search notes', command: 'Search for notes about ' },
  { icon: '📝', label: 'Create note', command: 'Create a note called ' },
  { icon: '📋', label: 'List recent', command: 'What are my recent notes?' },
  { icon: '🔗', label: 'Find links', command: 'Find notes that link to ' },
]

interface SidebarProps {
  onAction?: (command: string) => void
}

export function Sidebar({ onAction }: SidebarProps) {
  return (
    <aside className="flex w-64 flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Quick Actions
        </h2>
        <div className="space-y-1">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => onAction?.(action.command)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-tertiary)]"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-[var(--border)] p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          About Paddy
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">
          Your AI assistant for managing your Obsidian vault. Ask me to search,
          create, or organize your notes.
        </p>
      </div>
    </aside>
  )
}
