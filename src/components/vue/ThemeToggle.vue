<template>
  <button @click="toggleTheme" class="theme-toggle" :title="currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
    <i v-if="currentTheme === 'dark'" class="fa-solid fa-sun icon"></i>
    <i v-else class="fa-solid fa-moon icon"></i>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const currentTheme = ref<'light' | 'dark'>('light');

function getTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
  currentTheme.value = theme;
}

function toggleTheme() {
  const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
}

onMounted(() => {
  applyTheme(getTheme());
});
</script>

<style scoped>
.theme-toggle {
  width: 30px;
  height: 30px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  cursor: pointer;
  color: var(--color-text);
  line-height: 1;
  transition: all 0.2s;
}

.theme-toggle:hover {
  border-color: var(--color-border-hover);
  background: var(--color-bg);
}
</style>
