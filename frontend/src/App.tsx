import { useEffect, useState } from 'react'
import { checkHealth } from './api/client'
import { Chat } from './components/Chat'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'

export function App() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    checkHealth()
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false))
  }, [])

  return (
    <div className="flex h-screen flex-col bg-[var(--bg-primary)]">
      <Header
        isConnected={isConnected}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <Sidebar />}

        <main className="flex flex-1 flex-col overflow-hidden">
          <Chat />
        </main>
      </div>
    </div>
  )
}
