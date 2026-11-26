import { type ReactNode } from 'react'
import { ConfirmHost, ErrorBoundary, ToastHost } from '@/components/ui'
export function Providers({ children }: { children: ReactNode }) { return <ErrorBoundary>{children}<ToastHost /><ConfirmHost /></ErrorBoundary> }
