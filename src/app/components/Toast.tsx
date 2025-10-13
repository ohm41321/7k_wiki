"use client";
import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  duration?: number;
}

// Toast Manager for global usage
let toastQueue: Array<ToastProps & { id: string }> = [];
let listeners: Array<(toasts: Array<ToastProps & { id: string }>) => void> = [];

const addToast = (toast: ToastProps) => {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast = { ...toast, id };
  toastQueue.push(newToast);
  listeners.forEach(listener => listener([...toastQueue]));

  // Auto remove after duration
  setTimeout(() => {
    removeToast(id);
  }, toast.duration || 4000);
};

const removeToast = (id: string) => {
  toastQueue = toastQueue.filter(t => t.id !== id);
  listeners.forEach(listener => listener([...toastQueue]));
};

export { addToast, removeToast };

// Toast Container Component
export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  useEffect(() => {
    const handleToastsChange = (newToasts: Array<ToastProps & { id: string }>) => {
      setToasts(newToasts);
    };

    listeners.push(handleToastsChange);
    setToasts([...toastQueue]);

    return () => {
      listeners = listeners.filter(listener => listener !== handleToastsChange);
    };
  }, []);

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 space-y-3">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="transform transition-all duration-500 ease-out"
          style={{
            transform: `translateY(${index * 10}px)`,
            animationDelay: `${index * 100}ms`
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

export default function Toast({ message, type = 'success', onClose, duration = 4000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 500);

    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      container: 'bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 border-green-300',
      icon: '✓',
      accent: 'from-green-300 to-emerald-400'
    },
    error: {
      container: 'bg-gradient-to-br from-red-400 via-red-500 to-rose-600 border-red-300',
      icon: '✕',
      accent: 'from-red-300 to-rose-400'
    },
    warning: {
      container: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-600 border-orange-300',
      icon: '⚠',
      accent: 'from-yellow-300 to-orange-400'
    },
    info: {
      container: 'bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 border-cyan-300',
      icon: 'ℹ',
      accent: 'from-blue-300 to-cyan-400'
    }
  };

  const style = typeStyles[type];

  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transform transition-all duration-500 ease-out ${
      isExiting ? 'translate-y-[-100px] opacity-0' : 'translate-y-0 opacity-100'
    }`}>
      <div className={`${style.container} text-white px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-sm relative overflow-hidden min-w-[300px]`}>
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${style.accent} opacity-20 animate-pulse`}></div>

        {/* Content */}
        <div className="relative flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
              {style.icon}
            </div>
          </div>

          {/* Message */}
          <div className="flex-grow">
            <div className="font-bold text-sm mb-1">สำเร็จ!</div>
            <div className="text-sm opacity-90 leading-relaxed">{message}</div>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(() => {
                setIsVisible(false);
                onClose && onClose();
              }, 300);
            }}
            className="flex-shrink-0 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl overflow-hidden">
          <div
            className={`h-full bg-white/60 transition-all ease-linear`}
            style={{
              width: '100%',
              animation: `toast-progress ${duration}ms linear`
            }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
