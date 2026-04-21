/**
 * Client Storage Composable
 * 
 * Manages client name in LocalStorage for the Client Handoff Dashboard.
 * Clients don't need to login - they just enter their name once.
 * 
 * Features:
 * - Stores client_name in LocalStorage
 * - Persists across page reloads
 * - Reactive Vue ref for use in components
 * - SSR-safe (only accesses LocalStorage on client-side)
 * 
 * @example
 * const { clientName, setClientName, clearClientName, isSet } = useClientStorage();
 * 
 * // In template
 * <input v-if="!isSet" v-model="name" @blur="setClientName(name)" />
 * <span v-else>Welcome, {{ clientName }}</span>
 */

import { ref, computed, onMounted, watch } from 'vue';

const STORAGE_KEY = 'client_handoff_client_name';

export function useClientStorage() {
  // Internal state - starts null until mounted
  const storedName = ref<string | null>(null);
  const isHydrated = ref(false);

  // Computed properties
  const clientName = computed(() => storedName.value);
  const isSet = computed(() => isHydrated.value && storedName.value !== null && storedName.value.length > 0);

  // Load from LocalStorage (client-side only)
  function loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      storedName.value = saved;
    } catch (error) {
      console.error('Failed to load client name from LocalStorage:', error);
      storedName.value = null;
    }
    
    isHydrated.value = true;
  }

  // Save to LocalStorage
  function saveToStorage(name: string | null): void {
    if (typeof window === 'undefined') return;
    
    try {
      if (name === null || name.trim().length === 0) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, name.trim());
      }
    } catch (error) {
      console.error('Failed to save client name to LocalStorage:', error);
    }
  }

  // Set client name
  function setClientName(name: string): void {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      storedName.value = null;
      saveToStorage(null);
      return;
    }
    
    storedName.value = trimmed;
    saveToStorage(trimmed);
  }

  // Clear client name
  function clearClientName(): void {
    storedName.value = null;
    saveToStorage(null);
  }

  // Initialize on mount
  onMounted(() => {
    loadFromStorage();
  });

  // Watch for external LocalStorage changes
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY) {
        storedName.value = event.newValue;
      }
    });
  }

  return {
    // State
    clientName,
    isSet,
    isHydrated: computed(() => isHydrated.value),
    
    // Actions
    setClientName,
    clearClientName,
    reload: loadFromStorage,
  };
}

/**
 * Simple version - just returns the client name or null
 * Use this when you don't need reactivity (e.g., in API calls)
 */
export function getClientName(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Simple version - set client name
 */
export function setClientNameStatic(name: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore errors
  }
}

export default useClientStorage;
