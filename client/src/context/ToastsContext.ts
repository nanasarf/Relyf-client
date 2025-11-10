import React from 'react'
import type { AlertColor } from '@mui/material'

export interface ToastMessage {
  id: string
  message: string
  severity: AlertColor
  duration?: number
}

export interface ToastsContextType {
  toasts: ToastMessage[]
  showToast: (message: string, severity?: AlertColor, duration?: number) => void
  removeToast: (id: string) => void
}

export const ToastsContext = React.createContext<ToastsContextType | undefined>(undefined)

export function useToasts() {
  const ctx = React.useContext(ToastsContext)
  if (!ctx) throw new Error('useToasts must be used within <ToastsProvider>')
  return ctx
}
