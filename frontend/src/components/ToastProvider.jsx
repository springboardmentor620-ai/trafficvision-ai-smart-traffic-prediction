import { useCallback, useMemo, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import { ToastContext } from "../context/toast";
import "../styles/Toast.css";

const icons = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || FiInfo;
          return (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <Icon />
              <span>{toast.message}</span>
              <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">
                <FiX />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
