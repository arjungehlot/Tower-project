import { type ReactNode } from 'react'
import { ErrorBoundary, ToastHost } from '@/components/ui'
export function Providers({ children }: { children: ReactNode }) { return <ErrorBoundary>{children}<ToastHost /></ErrorBoundary> }
