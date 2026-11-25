import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'
export class ErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null }
  static getDerivedStateFromError(err: Error) { return { err } }
  render() {
    if (!this.state.err) return this.props.children
    return <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center"><AlertTriangle className="text-bad" /><p className="font-semibold">Something went wrong</p><p className="max-w-sm text-xs text-muted">{this.state.err.message}</p><Button variant="primary" onClick={() => { this.setState({ err: null }); location.href = '/' }}>Back to home</Button></div>
  }
}
