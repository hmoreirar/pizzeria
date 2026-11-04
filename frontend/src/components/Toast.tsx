import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ToastContext } from './toast-context'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((next: string) => {
    setMessage(next)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(null), 2200)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4"
      >
        {message && (
          <div
            role="status"
            className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
          >
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}
