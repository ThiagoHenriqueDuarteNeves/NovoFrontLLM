/**
 * App principal - Layout e estrutura da aplicação
 */

import { SettingsProvider } from './store/settings'
import { Header } from './components/Header'
import { ModelSelect } from './components/ModelSelect'
import { Chat } from './components/Chat'
import './App.css'

function App() {
  return (
    <SettingsProvider>
      <div className="app">
        <Header />
        <div className="app-body">
          <ModelSelect />
          <Chat />
        </div>
      </div>
    </SettingsProvider>
  )
}

export default App
