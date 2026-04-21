import type { ToastType } from '../components/vue/Toast.vue';

// Global toast event system - works across all components
export function useGlobalToast() {
  const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message, type, duration }
    }));
  };

  return {
    success: (msg: string, duration?: number) => showToast(msg, 'success', duration),
    error: (msg: string, duration?: number) => showToast(msg, 'error', duration),
    warning: (msg: string, duration?: number) => showToast(msg, 'warning', duration),
    info: (msg: string, duration?: number) => showToast(msg, 'info', duration),
    show: showToast,
  };
}

// Type for the event detail
export interface ToastEventDetail {
  message: string;
  type: ToastType;
  duration: number;
}
