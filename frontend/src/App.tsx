import { useState } from 'react'
import { ChatLayout, Sidebar } from '@/components/layout'
import { useChat } from '@/hooks/use-chat'
import { useTheme } from '@/hooks/use-theme'

export default function App() {
  const { theme } = useTheme()
  const { messages, isLoading, sendMessage } = useChat()
  const [activeNav, setActiveNav] = useState('chats')

  // Apply dark class to html element
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <div className="h-screen flex overflow-hidden antialiased selection:bg-primary selection:text-white dark">
      <Sidebar
        userName="John Smith"
        userPlan="Free Plan"
        activeItem={activeNav}
        onNavigate={setActiveNav}
      />
      <ChatLayout
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        credits={{ used: 6, total: 75 }}
      />
    </div>
  )
}
