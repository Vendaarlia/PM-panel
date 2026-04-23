<template>
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="logo">
                        <span>PM-Panel</span>
                    </div>
                    <p class="footer-tagline">Client project management, simplified.</p>
                </div>
                <div class="footer-links">
                    <div class="footer-column">
                        <h4>Product</h4>
                        <a href="/#features">Features</a>
                        <a href="/#how-it-works">How It Works</a>
                        <a href="/#faq">FAQ</a>
                    </div>
                    <div class="footer-column">
                        <h4>Company</h4>
                        <a href="/about">About</a>
                        <a href="/privacy">Privacy</a>
                        <a href="/terms">Terms</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 PM-Panel. 
                    <a href="https://vendaar.top" target="_blank" class="contact-link">
                        <i class="fa-solid fa-user"></i>
                        Dev by Vendaar
                    </a></p>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.footer {
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    padding: 48px 0 24px;
}

.footer-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    margin-bottom: 32px;
}

.footer-brand .logo {
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 12px;
}

.footer-tagline {
    color: var(--color-text-secondary);
}

.footer-links {
    display: flex;
    gap: 64px;
    justify-content: flex-end;
}

.footer-column h4 {
    margin-bottom: 16px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--color-text-muted);
}

.footer-column a {
    display: block;
    padding: 6px 0;
    color: var(--color-text-secondary);
    transition: color 0.2s;
    text-decoration: none;
}

.footer-column a:hover {
    color: var(--color-text);
}

.footer-bottom {
    padding-top: 24px;
    border-top: 1px solid var(--color-border);
    text-align: center;
    color: var(--color-text-muted);
    font-size: 14px;
}

@media (max-width: 768px) {
    .footer-content {
        grid-template-columns: 1fr;
    }

    .footer-links {
        justify-content: flex-start;
    }
}
</style>
