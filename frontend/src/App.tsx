import { useState } from 'react'
import { LangProvider } from './i18n'
import { ToastProvider } from './components/Toast'
import { AppProvider } from './app-context'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { MobileNav } from './components/MobileNav'
import { Dashboard } from './pages/Dashboard'
import { MapPage } from './pages/MapPage'
import { Maintenance } from './pages/Maintenance'
import { Statistics } from './pages/Statistics'
import { Settings } from './pages/Settings'
import type { ViewId } from './lib/types'

export default function App() {
  const [view, setView] = useState<ViewId>('dashboard')

  return (
    <LangProvider>
      <ToastProvider>
        <AppProvider>
          <div className="lg:flex min-h-screen">
            <Sidebar view={view} onNav={setView} />
            <div className="flex-1 min-w-0 flex flex-col">
              <Topbar view={view} />
              <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pb-28 lg:pb-10">
                <div key={view} className="animate-in">
                  {view === 'dashboard' && <Dashboard />}
                  {view === 'map' && <MapPage />}
                  {view === 'maintenance' && <Maintenance />}
                  {view === 'stats' && <Statistics />}
                  {view === 'settings' && <Settings />}
                </div>
              </main>
            </div>
          </div>
          <MobileNav view={view} onNav={setView} />
        </AppProvider>
      </ToastProvider>
    </LangProvider>
  )
}
