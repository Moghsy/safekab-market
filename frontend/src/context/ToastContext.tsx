import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast } from "@/components/ui/toast";

interface ToastMessage {
  id: string;
  message: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

interface ToastContextType {
  showToast: (
    message: string,
    variant?: "default" | "destructive" | "success",
    duration?: number
  ) => void;
  showError: (message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      variant: "default" | "destructive" | "success" = "default",
      duration = 5000
    ) => {
      const id = Date.now().toString();
      const toast: ToastMessage = { id, message, variant, duration };

      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const showError = useCallback(
    (message: string, duration = 5000) => {
      showToast(message, "destructive", duration);
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string, duration = 5000) => {
      showToast(message, "success", duration);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 space-y-2 p-4">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            onClose={() => removeToast(toast.id)}
          >
            {toast.message}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
