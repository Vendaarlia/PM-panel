<template>
  <div class="project-list">
    <div v-if="loading" class="loading">Loading projects...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="projects.length === 0" class="empty">
      No projects yet. Create one to get started.
    </div>
    <div v-else class="projects">
      <div
        v-for="project in projects"
        :key="project.id"
        class="project-card"
      >
        <div class="project-header">
          <div class="project-header-left">
            <div class="project-title-row">
              <h3>{{ project.name }}</h3>
              <span v-if="project.hasUnread" class="unread-badge" title="New messages from client">
                <i class="fa-solid fa-circle"></i>
              </span>
            </div>
            <time :datetime="project.lastActivityAt" :title="'Last activity: ' + formatDate(project.lastActivityAt)">
              {{ formatDate(project.lastActivityAt) }}
            </time>
          </div>
          <span :class="['status', project.status]">{{ project.status }}</span>
        </div>
        <p v-if="project.description" class="description">{{ project.description }}</p>
        <div class="project-footer">
          <p class="client">Client: {{ project.client }}</p>
          <div class="actions">
            <a :href="`/project/${project.id}`" class="btn-link">View</a>
            <button @click="deleteProject(project.id, project.name)" class="btn-delete">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useGlobalToast } from '../../composables/useGlobalToast';
import { useConfirm } from '../../composables/useConfirm';

interface Project {
  id: number;
  name: string;
  slug: string;
  client: string;
  description?: string;
  status: 'draft' | 'review' | 'done';
  hasUnread: boolean;
  lastActivityAt: string;
  createdAt: string;
}

const projects = ref<Project[]>([]);
const loading = ref(true);
const error = ref('');

const toast = useGlobalToast();
const { confirm } = useConfirm();

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

async function fetchProjects() {
  loading.value = true;
  error.value = '';

  try {
    const response = await fetch('/api/projects');
    if (!response.ok) throw new Error('Failed to fetch projects');
    projects.value = await response.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    loading.value = false;
  }
}

async function deleteProject(id: number, projectName: string) {
  const confirmed = await confirm({
    title: 'Delete Project',
    message: `Are you sure you want to delete "${projectName}" & all chat history?<br><br>This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger',
  });

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/projects?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete project');
    
    await fetchProjects();
    toast.success('Project deleted successfully', 2000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
    toast.error('Failed to delete project. Please try again.', 3000);
  }
}

onMounted(() => {
  fetchProjects();
  
  // Listen for project creation event from ProjectForm
  window.addEventListener('project-created', fetchProjects);
});

onUnmounted(() => {
  window.removeEventListener('project-created', fetchProjects);
});

defineExpose({ refresh: fetchProjects });
</script>

<style scoped>
.project-list {
  width: 100%;
}

.loading,
.error,
.empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.error {
  color: var(--color-error);
}

.projects {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-card {
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-surface);
  transition: border-color 0.2s;
}

.project-card:hover {
  border-color: var(--color-border-hover);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.project-header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.project-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unread-badge {
  color: var(--color-error);
  font-size: 0.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.project-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  text-transform: capitalize;
}

time {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status.draft {
  background: var(--color-status-draft-bg);
  color: var(--color-status-draft-text);
}

.status.review {
  background: var(--color-status-review-bg);
  color: var(--color-status-review-text);
}

.status.done {
  background: var(--color-status-done-bg);
  color: var(--color-status-done-text);
}

.client {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 0.5rem;
}

.description {
  width: 70%;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.btn-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.btn-link:hover {
  text-decoration: underline;
}

.btn-delete {
  color: var(--color-error);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-delete:hover {
  text-decoration: underline;
}
</style>
