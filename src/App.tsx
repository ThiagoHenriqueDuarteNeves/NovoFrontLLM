/**
 * App principal - Layout e estrutura da aplicação
 * Sidebar de modelos oculta por padrão
 */

import { useState } from 'react'
import { SettingsProvider, useSettings } from './store/settings'
import { Header } from './components/Header'
import { ModelSelect } from './components/ModelSelect'
import { Chat } from './components/Chat'
import { ServerSetup } from './components/ServerSetup'
import './App.css'

function AppContent() {
  const { settings } = useSettings()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Mostra o setup do servidor se não estiver configurado
  if (!settings.serverConfigured) {
    return <ServerSetup />
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="app">
      <Header onMenuClick={toggleSidebar} />
      <div className="app-body">
        {/* Overlay para fechar sidebar clicando fora */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar} />
        )}
        <ModelSelect 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar}
        />
        <Chat />
      </div>
    </div>
  )
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  )
}

export default App
