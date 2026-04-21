<template>
  <form @submit.prevent="handleSubmit" class="project-form">
    <div class="form-group">
      <label for="name">Project Name</label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        placeholder="Enter project name"
        required
      />
    </div>

    <div class="form-group">
      <label for="client">Client</label>
      <input
        id="client"
        v-model="form.client"
        type="text"
        placeholder="Enter client name"
        required
      />
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="form.description"
        rows="3"
        placeholder="Enter project description"
      ></textarea>
    </div>

    <div class="form-group">
      <label for="status">Status</label>
      <select id="status" v-model="form.status">
        <option value="draft">Draft</option>
        <option value="review">Review</option>
        <option value="done">Done</option>
      </select>
    </div>

    <button type="submit" class="btn-primary" :disabled="loading">
      {{ loading ? 'Creating...' : 'Create Project' }}
    </button>

    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useGlobalToast } from '../../composables/useGlobalToast';

const emit = defineEmits<{
  created: [];
}>();

// Global toast - works across all components
const toast = useGlobalToast();

const form = reactive({
  name: '',
  client: '',
  description: '',
  status: 'draft' as 'draft' | 'review' | 'done',
});

const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  loading.value = true;
  error.value = '';

  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create project');
    }

    form.name = '';
    form.client = '';
    form.description = '';
    form.status = 'draft';
    emit('created');
    
    // Dispatch global event untuk refresh ProjectList
    window.dispatchEvent(new CustomEvent('project-created'));
    
    // Show success toast (works even before Toast component mounts)
    toast.success('Project created successfully!', 3000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.project-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

input,
select,
textarea {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9375rem;
  font-family: inherit;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: var(--color-bg);
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: var(--color-error);
  font-size: 0.875rem;
}
</style>
