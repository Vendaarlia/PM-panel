<template>
  <div class="toast-wrapper" v-bind="$attrs">
    <Teleport to="body">
      <div class="toast-container" :class="position">
        <TransitionGroup name="toast">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            :class="['toast', toast.type]"
            @mouseenter="pauseToast(toast.id)"
            @mouseleave="resumeToast(toast.id)"
          >
            <div class="toast-content">
              <i :class="getIcon(toast.type)"></i>
              <span class="toast-message">{{ toast.message }}</span>
            </div>
            <button class="toast-close" @click="removeToast(toast.id)">
              <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="toast-progress" :style="{ animationDuration: toast.duration + 'ms' }"></div>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { ToastEventDetail } from '../../composables/useGlobalToast';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
  timeoutId?: ReturnType<typeof setTimeout>;
}

const props = defineProps<{
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}>();

const position = props.position || 'top-right';
const toasts = ref<Toast[]>([]);
let nextId = 1;

function getIcon(type: ToastType): string {
  const icons: Record<ToastType, string> = {
    success: 'fa-solid fa-check-circle',
    error: 'fa-solid fa-circle-exclamation',
    warning: 'fa-solid fa-triangle-exclamation',
    info: 'fa-solid fa-circle-info',
  };
  return icons[type];
}

function addToast(message: string, type: ToastType = 'info', duration: number = 3000) {
  const id = nextId++;
  const toast: Toast = {
    id,
    message,
    type,
    duration,
    timeoutId: setTimeout(() => removeToast(id), duration),
  };
  toasts.value.push(toast);
  return id;
}

function removeToast(id: number) {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) {
    const toast = toasts.value[index];
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    toasts.value.splice(index, 1);
  }
}

function pauseToast(id: number) {
  const toast = toasts.value.find(t => t.id === id);
  if (toast?.timeoutId) {
    clearTimeout(toast.timeoutId);
    toast.timeoutId = undefined;
  }
}

function resumeToast(id: number) {
  const toast = toasts.value.find(t => t.id === id);
  if (toast && !toast.timeoutId) {
    toast.timeoutId = setTimeout(() => removeToast(id), 1000); // Resume with 1s grace
  }
}

// Expose methods for external use
defineExpose({
  success: (msg: string, duration?: number) => addToast(msg, 'success', duration),
  error: (msg: string, duration?: number) => addToast(msg, 'error', duration),
  warning: (msg: string, duration?: number) => addToast(msg, 'warning', duration),
  info: (msg: string, duration?: number) => addToast(msg, 'info', duration),
  add: addToast,
  remove: removeToast,
});

onMounted(() => {
  // Listen for global toast events
  window.addEventListener('show-toast', ((e: CustomEvent<ToastEventDetail>) => {
    const { message, type, duration } = e.detail;
    addToast(message, type, duration);
  }) as EventListener);
});

onUnmounted(() => {
  toasts.value.forEach(t => {
    if (t.timeoutId) clearTimeout(t.timeoutId);
  });
});
</script>

<style scoped>
/* Wrapper untuk attribute inheritance target */
.toast-wrapper {
  display: contents;
}

.toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  pointer-events: none;
}

.toast-container.top-right {
  top: 0;
  right: 0;
}

.toast-container.top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.toast-container.bottom-right {
  bottom: 0;
  right: 0;
  flex-direction: column-reverse;
}

.toast-container.bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: column-reverse;
}

.toast {
  position: relative;
  min-width: 300px;
  max-width: 400px;
  padding: 1rem 1.25rem;
  background: var(--color-surface);
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  pointer-events: auto;
  overflow: hidden;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.toast-content i {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.toast-message {
  font-size: 0.9375rem;
  color: var(--color-text);
  line-height: 1.5;
}

.toast-close {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.toast-close:hover {
  color: var(--color-text);
  background: var(--color-bg);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: currentColor;
  opacity: 0.3;
  animation: progress linear forwards;
}

/* Toast Types - use opacity for background so text remains readable */
.toast.success {
  border-color: var(--color-success);
  background: color-mix(in srgb, var(--color-success-bg) 20%, var(--color-surface));
}

.toast.success .toast-content i {
  color: var(--color-success);
}

.toast.error {
  border-color: var(--color-error);
  background: color-mix(in srgb, var(--color-error-bg) 20%, var(--color-surface));
}

.toast.error .toast-content i {
  color: var(--color-error);
}

.toast.warning {
  border-color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning-bg) 20%, var(--color-surface));
}

.toast.warning .toast-content i {
  color: var(--color-warning);
}

.toast.info {
  border-color: var(--color-info);
  background: color-mix(in srgb, var(--color-info-bg) 20%, var(--color-surface));
}

.toast.info .toast-content i {
  color: var(--color-info);
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-container.top-center .toast-enter-from,
.toast-container.bottom-center .toast-enter-from {
  transform: translateY(-100%);
}

.toast-container.top-center .toast-leave-to,
.toast-container.bottom-center .toast-leave-to {
  transform: translateY(100%);
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Pause animation on hover */
.toast:hover .toast-progress {
  animation-play-state: paused;
}
</style>
