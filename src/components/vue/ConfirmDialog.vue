<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div v-if="state?.isOpen" class="confirm-overlay" @click="handleCancel">
        <div class="confirm-dialog" :class="state?.type" @click.stop>
          <div class="confirm-header">
            <i :class="getIcon(state?.type)"></i>
            <h3>{{ state?.title }}</h3>
          </div>
          <p class="confirm-message" v-html="state?.message"></p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="handleCancel">
              {{ state?.cancelText }}
            </button>
            <button class="btn-confirm" :class="state?.type" @click="handleConfirm">
              {{ state?.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useConfirm } from '../../composables/useConfirm';

const { state, handleConfirm, handleCancel } = useConfirm();

function getIcon(type?: string) {
  switch (type) {
    case 'danger': return 'fa-solid fa-circle-exclamation';
    case 'warning': return 'fa-solid fa-triangle-exclamation';
    default: return 'fa-solid fa-circle-info';
  }
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.confirm-dialog {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--color-border);
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.confirm-header i {
  font-size: 1.5rem;
}

.confirm-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}

.confirm-message {
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 0.625rem 1rem;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: var(--color-bg);
}

.btn-confirm {
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-confirm.danger {
  background: var(--color-error);
  color: white;
}

.btn-confirm.danger:hover {
  filter: brightness(1.1);
}

.btn-confirm.warning {
  background: var(--color-warning);
  color: white;
}

.btn-confirm.info {
  background: var(--color-primary);
  color: white;
}

/* Icon colors by type */
.confirm-dialog.danger .confirm-header i {
  color: var(--color-error);
}

.confirm-dialog.warning .confirm-header i {
  color: var(--color-warning);
}

.confirm-dialog.info .confirm-header i {
  color: var(--color-primary);
}

/* Transitions */
.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-enter-active .confirm-dialog,
.confirm-leave-active .confirm-dialog {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}

.confirm-enter-from .confirm-dialog,
.confirm-leave-to .confirm-dialog {
  opacity: 0;
  transform: scale(0.95);
}
</style>
