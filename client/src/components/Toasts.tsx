import React, { useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";
import type { AlertColor } from "@mui/material";
import { ToastsContext, useToasts } from "../context/ToastsContext";
import type { ToastMessage } from "../context/ToastsContext";

export function ToastsProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, severity: AlertColor = "info", duration = 5000) => {
      const id = `${Date.now()}-${Math.random()}`;
      const toast: ToastMessage = { id, message, severity, duration };
      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastsContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastsComponent />
    </ToastsContext.Provider>
  );
}

function ToastsComponent() {
  const { toasts, removeToast } = useToasts();

  return (
    <>
      {toasts.map((toast, idx) => (
        <Snackbar
          key={toast.id}
          open
          autoHideDuration={toast.duration}
          onClose={() => removeToast(toast.id)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{ bottom: `${idx * 100 + 20}px` }}
        >
          <Alert
            onClose={() => removeToast(toast.id)}
            severity={toast.severity}
            sx={{ width: "100%" }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
