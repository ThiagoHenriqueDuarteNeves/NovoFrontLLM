/**
 * App principal - Layout e estrutura da aplicação
 */

import { SettingsProvider, useSettings } from './store/settings'
import { Header } from './components/Header'
import { ModelSelect } from './components/ModelSelect'
import { Chat } from './components/Chat'
import { ServerSetup } from './components/ServerSetup'
import './App.css'

function AppContent() {
  const { settings } = useSettings()

  // Mostra o setup do servidor se não estiver configurado
  if (!settings.serverConfigured) {
    return <ServerSetup />
  }

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <ModelSelect />
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
