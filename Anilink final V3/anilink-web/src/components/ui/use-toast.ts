import * as React from 'react'

type ToastData = {
  id: string
  title: string
  description?: string
  variant?: string
}

type ToastContextValue = {
  toasts: ToastData[]
  push: (toast: Omit<ToastData, 'id'>) => void
  remove: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProviderContext({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const push = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((prev) => [...prev, { id, ...toast }])
  }, [])

  const remove = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return React.createElement(
    ToastContext.Provider,
    { value: { toasts, push, remove } },
    children,
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProviderContext')
  }
  return context
}
