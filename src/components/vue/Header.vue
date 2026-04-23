<script setup lang="ts">
import { ref } from 'vue';

const isMenuOpen = ref(false);

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
    <header class="header">
        <div class="container">
            <nav class="nav">
                <div class="logo">
                    <a href="/"><span>PM-Panel</span></a>
                </div>

                <!-- Desktop Navigation -->
                <div class="nav-links desktop">
                    <a href="/#features">Features</a>
                    <a href="/#how-it-works">How It Works</a>
                    <a href="/#faq">FAQ</a>
                    <a href="/about">About</a>
                    <a href="/login" data-astro-reload>Login</a>
                    <a href="/register" data-astro-reload><button class="btn btn-primary">Get Started</button></a>
                </div>

                <!-- Hamburger Button -->
                <button class="hamburger" @click="toggleMenu" :class="{ 'active': isMenuOpen }" aria-label="Toggle menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </nav>

            <!-- Mobile Navigation Menu -->
            <div class="mobile-menu" :class="{ 'open': isMenuOpen }">
                <a href="/#features" @click="isMenuOpen = false">Features</a>
                <a href="/#how-it-works" @click="isMenuOpen = false">How It Works</a>
                <a href="/#faq" @click="isMenuOpen = false">FAQ</a>
                <a href="/about" @click="isMenuOpen = false">About</a>
                <a href="/login" data-astro-reload @click="isMenuOpen = false">Login</a>
                <a href="/register" data-astro-reload @click="isMenuOpen = false">
                    <button class="btn btn-primary">Get Started</button>
                </a>
            </div>
        </div>
    </header>
</template>

<style scoped>
.header {
    position: sticky;
    top: 0;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    z-index: 100;
    backdrop-filter: blur(8px);
}

.container {
    position: relative;
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
}

.logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    font-size: 18px;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
}

.nav-links a {
    color: var(--color-text-secondary);
    transition: color 0.2s;
    text-decoration: none;
}

.nav-links a:hover {
    color: var(--color-text);
}

.btn {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
}

.btn-primary {
    background: var(--color-primary);
    color: var(--color-bg);
}

.btn-primary:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

.hamburger {
    display: none;
    flex-direction: column;
    justify-content: space-around;
    width: 24px;
    height: 20px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
}

.hamburger span {
    width: 100%;
    height: 2px;
    background: var(--color-text);
    border-radius: 2px;
    transition: all 0.3s ease;
}

.hamburger.active span:nth-child(1) {
    transform: rotate(45deg) translate(0, 9px);
}

.hamburger.active span:nth-child(2) {
    opacity: 0;
}

.hamburger.active span:nth-child(3) {
    transform: rotate(-45deg) translate(0, -9px);
}

.mobile-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 16px;
    padding: 16px 24px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 99;
}

.mobile-menu.open {
    display: flex;
}

.mobile-menu a {
    color: var(--color-text-secondary);
    text-decoration: none;
    padding: 8px 0;
    transition: color 0.2s;
}

.mobile-menu a:hover {
    color: var(--color-text);
}

@media (max-width: 768px) {
    .nav-links.desktop {
        display: none;
    }

    .hamburger {
        display: flex;
    }
}
</style>
