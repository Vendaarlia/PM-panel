<template>
  <div class="client-note-form">
    <!-- Client Name Input - Show only if not set -->
    <div v-if="!isSet" class="name-setup">
      <label class="label">
        <span class="label-text">Enter your name to start:</span>
        <input
          v-model="tempName"
          type="text"
          placeholder="Your name"
          class="input"
          @keyup.enter="saveName"
        />
      </label>
      <button @click="saveName" class="btn btn-primary" :disabled="!tempName.trim()">
        Start Conversation
      </button>
    </div>

    <!-- Note Form - Show when client name is set -->
    <div v-else class="note-composer">
      <div class="client-header">
        <span>Posting as: <strong>{{ clientName }}</strong></span>
        <button @click="changeName" class="btn btn-sm btn-ghost">Change</button>
      </div>

      <textarea
        v-model="noteContent"
        placeholder="Type your message..."
        class="textarea"
        rows="4"
        :disabled="isSubmitting"
      ></textarea>

      <div class="form-actions">
        <button
          @click="submitNote"
          class="btn btn-primary"
          :disabled="!noteContent.trim() || isSubmitting"
        >
          <span v-if="isSubmitting">Sending...</span>
          <span v-else>Send Message</span>
        </button>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" :class="['alert', message.type]">
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ClientNoteForm Component
 * 
 * A Vue component for clients to send notes/messages to a project.
 * 
 * Features:
 * - Stores client name in LocalStorage (no login required)
 * - Submits notes to /api/send-note endpoint
 * - Shows loading and success/error states
 * 
 * Props:
 *   - projectSlug: string (required) - The project slug for the API
 * 
 * Example:
 *   <ClientNoteForm project-slug="my-project" />
 */

import { ref, watch } from 'vue';
import { useClientStorage } from '../../composables/useClientStorage';

interface Props {
  projectSlug: string;
}

const props = defineProps<Props>();

// Use client storage composable for persistent client name
const { clientName, isSet, setClientName, isHydrated } = useClientStorage();

// Local state
const tempName = ref('');
const noteContent = ref('');
const isSubmitting = ref(false);
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null);

// Save name from temp input
function saveName() {
  const trimmed = tempName.value.trim();
  if (trimmed) {
    setClientName(trimmed);
    tempName.value = '';
  }
}

// Change existing name
function changeName() {
  tempName.value = clientName.value || '';
  setClientName('');
}

// Submit note to API
async function submitNote() {
  const content = noteContent.value.trim();
  const author = clientName.value;

  if (!content || !author) return;

  isSubmitting.value = true;
  message.value = null;

  try {
    const response = await fetch('/api/send-note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: props.projectSlug,
        content,
        authorName: author,
        authorRole: 'client',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to send note');
    }

    // Success - clear form
    noteContent.value = '';
    message.value = {
      type: 'success',
      text: 'Message sent successfully!',
    };

    // Clear success message after 3 seconds
    setTimeout(() => {
      message.value = null;
    }, 3000);

  } catch (error) {
    message.value = {
      type: 'error',
      text: error instanceof Error ? error.message : 'Failed to send message',
    };
  } finally {
    isSubmitting.value = false;
  }
}

// Watch for hydration to restore temp name if needed
watch(isHydrated, (hydrated) => {
  if (hydrated && clientName.value) {
    tempName.value = '';
  }
});
</script>

<style scoped>
.client-note-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
}

.name-setup {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label-text {
  font-weight: 500;
  color: #374151;
}

.input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;
  width: 100%;
}

.textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-ghost {
  background-color: transparent;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.btn-ghost:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.note-composer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.client-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.alert.success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.alert.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}
</style>
