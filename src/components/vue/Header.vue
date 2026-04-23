<template>
    <header class="header">
        <div class="container">
            <nav class="nav">
                <div class="logo">
                    <span>PM-Panel</span>
                </div>
                <div class="nav-links">
                    <a href="/">Home</a>
                    <a href="/about">About</a>
                    <a href="/login" data-astro-reload>Login</a>
                    <a href="/register" data-astro-reload><button class="btn btn-primary">Get Started</button></a>
                </div>
            </nav>
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

@media (max-width: 768px) {
    .nav-links {
        gap: 16px;
    }

    .nav-links a:not(:last-child) {
        display: none;
    }
}
</style>
