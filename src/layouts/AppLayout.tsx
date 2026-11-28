import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { ResolvedTicketPrompt } from '@/components/business/ResolvedTicketPrompt'
import { DemoPanel } from '@/components/layout/DemoPanel'
import { ErrorBoundary, LoadingState } from '@/components/ui'
import { storage } from '@/services/storageService'

/** Shell used by admin, supervisor, office and staff roles — navigation differs per role. */
export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(storage.get<boolean>('collapsed') ?? false), [mobile, setMobile] = useState(false), [palette, setPalette] = useState(false)
  const loc = useLocation()
  useEffect(() => { storage.set('collapsed', collapsed) }, [collapsed])
  useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p) } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [])
  return (
    <div className="fixed inset-0 flex overflow-clip">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-2">Skip to content</a>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobile} closeMobile={() => setMobile(false)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar openMenu={() => setMobile(true)} openSearch={() => setPalette(true)} />
        <main id="main" className="min-h-0 flex-1 overflow-y-auto p-3 md:px-5 md:py-4">
          <ErrorBoundary><Suspense fallback={<LoadingState />}><motion.div key={loc.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}><Outlet /></motion.div></Suspense></ErrorBoundary>
        </main>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      <ResolvedTicketPrompt />
      <DemoPanel />
    </div>
  )
}
