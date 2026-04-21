import { shallowRef } from 'vue';
import type { ToastType } from '../components/vue/Toast.vue';

// Toast interface
interface ToastMethods {
  success: (msg: string, duration?: number) => number;
  error: (msg: string, duration?: number) => number;
  warning: (msg: string, duration?: number) => number;
  info: (msg: string, duration?: number) => number;
  add: (msg: string, type: ToastType, duration?: number) => number;
  remove: (id: number) => void;
}

// Global toast controller
const toastRef = shallowRef<ToastMethods | null>(null);

export function useToast() {
  const setToastRef = (ref: unknown) => {
    toastRef.value = ref as ToastMethods;
  };

  const toast = {
    success: (message: string, duration?: number) => {
      return toastRef.value?.success(message, duration) ?? 0;
    },
    error: (message: string, duration?: number) => {
      return toastRef.value?.error(message, duration) ?? 0;
    },
    warning: (message: string, duration?: number) => {
      return toastRef.value?.warning(message, duration) ?? 0;
    },
    info: (message: string, duration?: number) => {
      return toastRef.value?.info(message, duration) ?? 0;
    },
    show: (message: string, type: ToastType = 'info', duration?: number) => {
      return toastRef.value?.add(message, type, duration) ?? 0;
    },
    remove: (id: number) => {
      toastRef.value?.remove(id);
    },
  };

  return {
    setToastRef,
    toast,
  };
}

// Singleton instance for global access
let globalToast: ReturnType<typeof useToast> | null = null;

export function provideToast() {
  globalToast = useToast();
  return globalToast;
}

export function getToast() {
  if (!globalToast) {
    throw new Error('Toast not initialized. Call provideToast() first or use useToast() in component setup.');
  }
  return globalToast.toast;
}
