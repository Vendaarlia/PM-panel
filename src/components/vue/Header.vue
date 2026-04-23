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
                    <a class="btn" href="/#features">Features</a>
                    <a class="btn" href="/#how-it-works">How It Works</a>
                    <a class="btn" href="/#faq">FAQ</a>
                    <a class="btn" href="/about">About</a>
                    <a class="btn" href="/login" data-astro-reload>Login</a>
                    <a class="btn-primary" href="/register" data-astro-reload>Get Started</a>
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
                <a class="btn" href="/#features" @click="isMenuOpen = false">Features</a>
                <a class="btn" href="/#how-it-works" @click="isMenuOpen = false">How It Works</a>
                <a class="btn" href="/#faq" @click="isMenuOpen = false">FAQ</a>
                <a class="btn" href="/about" @click="isMenuOpen = false">About</a>
                <a class="btn" href="/login" data-astro-reload @click="isMenuOpen = false">Login</a>
                <a class="btn-primary" href="/register" data-astro-reload @click="isMenuOpen = false">Get Started</a>
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

.logo a,
a {
    text-decoration: none;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
}

.nav-links .btn {
    color: var(--color-text-secondary);
    transition: color 0.2s;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid transparent;
}

.nav-links .btn:hover {
    background-color: var(--purple-dim);
    color: var(--color-text);
    border: 1px solid var(--purple-glow);
}

.btn-primary {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
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
    text-decoration: none;
    transition: color 0.2s;
    padding: auto;
}

.mobile-menu .btn-primary {
    text-align: center;
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
