import { ref } from 'vue';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
  isOpen: boolean;
}

const state = ref<ConfirmState | null>(null);

export function useConfirm() {
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      state.value = {
        ...options,
        title: options.title || 'Confirm',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'info',
        resolve,
        isOpen: true,
      };
    });
  };

  const handleConfirm = () => {
    if (state.value) {
      state.value.resolve(true);
      state.value.isOpen = false;
      setTimeout(() => {
        state.value = null;
      }, 200);
    }
  };

  const handleCancel = () => {
    if (state.value) {
      state.value.resolve(false);
      state.value.isOpen = false;
      setTimeout(() => {
        state.value = null;
      }, 200);
    }
  };

  return {
    state,
    confirm,
    handleConfirm,
    handleCancel,
  };
}
