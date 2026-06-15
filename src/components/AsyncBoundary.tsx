import React, { Component, Suspense } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center
                        justify-center p-8">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-12 h-12 bg-destructive/10 rounded-full
                            flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="font-semibold text-lg">
              حدث خطأ غير متوقع
            </h3>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || 'حاول تحديث الصفحة'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2
                         bg-primary text-primary-foreground rounded-lg
                         text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة تحميل
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function PageLoader({ text = 'جاري التحميل...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center
                    justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary
                        border-t-transparent rounded-full
                        animate-spin"/>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

export function AsyncBoundary({
  children,
  fallback = <PageLoader />,
}: Props) {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

export { PageLoader, ErrorBoundary }
