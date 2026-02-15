import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from './toast'
import { useToast } from './use-toast'

export function Toaster() {
  const { toasts, remove } = useToast()

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map((toast) => (
        <Toast key={toast.id} duration={4000} onOpenChange={(open) => !open && remove(toast.id)}>
          <div className="grid gap-1">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description ? <ToastDescription>{toast.description}</ToastDescription> : null}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
