interface HeaderProps {
  isConnected: boolean | null
  onToggleSidebar: () => void
}

export function Header({ isConnected, onToggleSidebar }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
          aria-label="Toggle sidebar"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            My Second Brain
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            isConnected === null
              ? 'bg-yellow-500'
              : isConnected
                ? 'bg-green-500'
                : 'bg-red-500'
          }`}
        />
        <span className="text-sm text-[var(--text-secondary)]">
          {isConnected === null
            ? 'Connecting...'
            : isConnected
              ? 'Connected'
              : 'Disconnected'}
        </span>
      </div>
    </header>
  )
}
