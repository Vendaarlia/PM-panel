<template>
  <div class="admin-notes">
    <div class="notes-header">
      <h3>Project Discussion</h3>
      <div class="header-actions">
        <span class="admin-badge">{{ currentUser?.name || 'Admin' }}</span>
        <button 
          @click="markAsRead" 
          :class="['btn-mark-read', { 'success': markReadSuccess }]" 
          :title="markReadSuccess ? 'Marked as read!' : 'Mark all messages as read'"
          :disabled="markReadSuccess"
        >
          <i :class="markReadSuccess ? 'fa-solid fa-check' : 'fa-solid fa-check-double'"></i>
          <span class="btn-text">{{ markReadSuccess ? 'Marked!' : 'Mark as Read' }}</span>
        </button>
      </div>
    </div>

    <div class="chat-container" ref="chatContainer">
      <div v-if="notesLoading" class="loading">Loading messages...</div>
      <div v-else-if="sortedNotes.length === 0" class="empty">
        No messages yet. Start the conversation!
      </div>
      <div v-else class="messages">
        <div
          v-for="note in sortedNotes"
          :key="note.id"
          :class="['message', note.authorRole === 'admin' ? 'admin' : 'client']"
        >
          <div class="message-bubble">
            <div class="message-header">
              <span class="author">{{ note.authorName || (note.authorRole === 'admin' ? 'Admin' : 'Client') }}</span>
            </div>
            <p class="content" v-html="linkifyText(note.content)"></p>
            <div v-if="note.attachmentUrl" class="attachment">
              <div v-if="note.attachmentType?.startsWith('image/')" class="attachment-image-wrapper">
                <img :src="note.attachmentUrl" :alt="note.attachmentName" class="attachment-image" @click="openLightbox(note.attachmentUrl)" />
                <a :href="note.attachmentUrl" download class="btn-download">
                  <i class="fa-solid fa-download"></i>
                </a>
              </div>
              <a v-else :href="note.attachmentUrl" download class="attachment-file">
                <i class="fa-solid fa-paperclip"></i>
                {{ note.attachmentName }}
              </a>
            </div>
            <time class="timestamp">{{ formatTime(note.createdAt) }}</time>
            <button 
              v-if="note.authorRole === 'admin'" 
              @click="deleteNote(note.id)" 
              class="btn-delete" 
              title="Delete"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div v-if="lightboxOpen" class="lightbox-overlay" @click.self="closeLightbox">
      <div class="lightbox-content">
        <button class="btn-close-lightbox" @click="closeLightbox">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <img :src="lightboxImage" alt="Full size" />
      </div>
    </div>

    <form @submit.prevent="addNote" class="message-form">
      <div class="input-wrapper">
        <textarea
          v-model="newNote"
          placeholder="Type your message..."
          rows="2"
          @keydown.enter.prevent="addNote"
        ></textarea>
        <input
          type="file"
          ref="fileInput"
          @change="handleFileSelect"
          accept="image/*,.pdf,.txt,.zip"
          class="file-input"
        />
        <button type="button" @click="fileInput?.click()" class="btn-attach" :disabled="uploading">
          <i class="fa-solid fa-paperclip"></i>
        </button>
        <button type="submit" :disabled="(!newNote.trim() && !selectedFile) || loading || uploading" class="btn-send">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </div>
      <div v-if="selectedFile" class="file-preview">
        <span class="file-name">{{ selectedFile.name }}</span>
        <button type="button" @click="clearFile" class="btn-clear-file">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useGlobalToast } from '../../composables/useGlobalToast';

interface Note {
  id: number;
  content: string;
  authorRole: 'admin' | 'client';
  authorName: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  createdAt: string;
}

const props = defineProps<{
  projectId: number;
  slug: string;
}>();

const notes = ref<Note[]>([]);
const newNote = ref('');
const loading = ref(false);
const notesLoading = ref(true);
const chatContainer = ref<HTMLElement>();
const currentUser = ref<{ id: number; name: string; email: string } | null>(null);
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const lightboxOpen = ref(false);
const lightboxImage = ref('');
const fileInput = ref<HTMLInputElement>();
const markReadSuccess = ref(false);

const toast = useGlobalToast();

const sortedNotes = computed(() => {
  return [...notes.value].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
});

function linkifyText(text: string): string {
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="message-link">${url}</a>`);
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  });
}

async function fetchUser() {
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      const data = await response.json();
      currentUser.value = data.user;
    }
  } catch (err) {
    console.error('Failed to fetch user:', err);
  }
}

async function fetchNotes() {
  notesLoading.value = true;
  try {
    const response = await fetch(`/api/notes?slug=${props.slug}`);
    if (!response.ok) throw new Error('Failed to fetch notes');
    notes.value = await response.json();
  } catch (err) {
    console.error('Failed to fetch notes:', err);
  } finally {
    notesLoading.value = false;
  }
}

async function uploadFile(): Promise<{ url: string; type: string; name: string } | null> {
  if (!selectedFile.value) return null;
  
  uploading.value = true;
  const formData = new FormData();
  formData.append('file', selectedFile.value);
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Failed to upload file');
    
    const data = await response.json();
    return { url: data.url, type: data.type, name: data.name };
  } catch (err) {
    console.error('Failed to upload file:', err);
    return null;
  } finally {
    uploading.value = false;
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
}

function clearFile() {
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
}

async function addNote() {
  if (!newNote.value.trim() && !selectedFile.value) return;

  const userName = currentUser.value?.name || 'Admin';
  loading.value = true;
  
  try {
    let attachment = null;
    if (selectedFile.value) {
      attachment = await uploadFile();
    }
    
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: props.slug,
        content: newNote.value.trim() || (attachment ? `[File: ${attachment.name}]` : ''),
        authorRole: 'admin',
        authorName: userName,
        attachment,
      }),
    });

    if (!response.ok) throw new Error('Failed to add note');

    newNote.value = '';
    clearFile();
    await fetchNotes();
    scrollToBottom();
  } catch (err) {
    console.error('Failed to add note:', err);
  } finally {
    loading.value = false;
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}

function openLightbox(url: string) {
  lightboxImage.value = url;
  lightboxOpen.value = true;
}

function closeLightbox() {
  lightboxOpen.value = false;
  lightboxImage.value = '';
}

async function deleteNote(id: number) {
  if (!confirm('Delete this note?')) return;

  try {
    const response = await fetch(`/api/notes?id=${id}&slug=${props.slug}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete note');
    await fetchNotes();
  } catch (err) {
    console.error('Failed to delete note:', err);
  }
}

async function markAsRead() {
  try {
    const response = await fetch(`/api/projects/${props.projectId}/mark-read`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to mark as read');
    
    // Show success toast
    toast.success('Marked as read!', 2000);
    
    // Emit event ke parent (optional, untuk refresh ProjectList)
    // window.dispatchEvent(new CustomEvent('project-marked-read', { 
    //   detail: { projectId: props.projectId } 
    // }));
    
    // Reset visual setelah 2 detik
    setTimeout(() => {
      markReadSuccess.value = false;
    }, 2000);
    
  } catch (err) {
    console.error('Failed to mark as read:', err);
    toast.error('Failed to mark as read. Please try again.', 3000);
  }
}

onMounted(() => {
  fetchUser();
  fetchNotes();
});
</script>

<style scoped>
.client-notes {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 600px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--color-surface);
  padding: 2rem;
  border-radius: 1rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal h3 {
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.modal p {
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary);
}

.modal form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 1rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: var(--color-bg);
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-mark-read {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-surface);
  color: var(--color-text);
  border: 2px solid var(--color-border);
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-mark-read:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-bg);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-mark-read:active {
  transform: translateY(1px);
  box-shadow: none;
}

.btn-mark-read i {
  font-size: 1rem;
}

.btn-mark-read.success {
  background: var(--color-success-bg, #dcfce7);
  border-color: var(--color-success, #22c55e);
  color: var(--color-success, #22c55e);
  cursor: default;
}

.btn-mark-read:disabled {
  opacity: 0.8;
}

.notes-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}

.admin-badge {
  padding: 0.25rem 0.75rem;
  background: var(--color-status-review-bg);
  color: var(--color-status-review-text);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  min-height: 300px;
  max-height: 600px;
}

.loading,
.empty {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  max-width: 80%;
}

.message.admin {
  align-self: flex-end;
  margin-left: auto;
}

.message.client {
  align-self: flex-start;
}

.message-bubble {
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  position: relative;
}

.message.admin .message-bubble {
  border-bottom-right-radius: 0.25rem;
  background: var(--color-status-review-bg);
  border-color: var(--color-status-review-text);
}

.message.client .message-bubble {
  border-bottom-left-radius: 0.25rem;
}

.btn-delete {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  color: var(--color-error);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-bubble:hover .btn-delete {
  opacity: 0.6;
}

.btn-delete:hover {
  opacity: 1 !important;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
}

.author {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--color-text);
}

.role-badge {
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.admin {
  background: var(--color-primary);
  color: var(--color-bg);
}

.role-badge.client {
  background: var(--color-status-review-bg);
  color: var(--color-status-review-text);
}

.content {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--color-text);
  white-space: pre-wrap;
  word-break: break-word;
}

.content :deep(.message-link) {
  color: var(--color-primary);
  text-decoration: underline;
  word-break: break-all;
}

.content :deep(.message-link:hover) {
  opacity: 0.8;
}

.timestamp {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.5rem;
}

.message-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.message-form textarea {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9375rem;
  resize: none;
  font-family: inherit;
}

.message-form textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.file-input {
  display: none;
}

.btn-attach {
  width: 60px;
  height: 60px;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-attach:hover:not(:disabled) {
  border-color: var(--color-primary);
}

.btn-attach:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-send {
  width: 60px;
  height: 60px;
  background: var(--color-primary);
  color: var(--color-bg);
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.btn-send:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-send i {
  font-size: 1.125rem;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.file-name {
  color: var(--color-text);
  flex: 1;
}

.btn-clear-file {
  padding: 0.25rem;
  background: none;
  border: none;
  color: var(--color-error);
  cursor: pointer;
}

.attachment {
  margin: 0.5rem 0;
}

.attachment-image-wrapper {
  position: relative;
  display: inline-block;
}

.attachment-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-download {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  padding: 0.375rem 0.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.75rem;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.btn-download:hover {
  opacity: 1;
  border-color: var(--color-primary);
}

.attachment-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.875rem;
}

.attachment-file:hover {
  border-color: var(--color-primary);
}

.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 0.5rem;
}

.btn-close-lightbox {
  position: absolute;
  top: -2rem;
  right: 0;
  padding: 0.5rem;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.btn-close-lightbox:hover {
  color: var(--color-error);
}
</style>
