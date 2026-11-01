/* Sunnee — script condiviso da tutte le pagine: borsa (carrello), menu, ricerca, toast */
(() => {
    'use strict';

    // =====================================================
    // BORSA — salvata nel browser (localStorage), cosi' resta tra una pagina e l'altra.
    // Ogni riga e' { id, size, qty }: l'id e' quello di products.js, il resto (nome, prezzo,
    // foto, colore) si legge da li' quando serve.
    // =====================================================
    const CART_KEY = 'sunnee_cart';
    const MAX_QTY = 10;
    let memory = [];   // se il browser non permette localStorage, la borsa vive finche' la pagina e' aperta

    const read = () => {
        try {
            const data = JSON.parse(localStorage.getItem(CART_KEY));
            if (Array.isArray(data)) {
                return data.filter(i => i && typeof i.id === 'string' && typeof i.size === 'string'
                                        && Number.isInteger(i.qty) && i.qty > 0);
            }
            return [];
        } catch { return memory; }
    };
    const renderCount = () => {
        const n = read().reduce((sum, i) => sum + i.qty, 0);
        document.querySelectorAll('.bag-num').forEach(el => { el.textContent = n; });
    };
    const write = (items) => {
        memory = items;
        try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* storage non disponibile */ }
        renderCount();
    };
    const sameLine = (item, id, size) => item.id === id && item.size === size;

    const cart = {
        items: read,
        count: () => read().reduce((sum, i) => sum + i.qty, 0),
        add(id, size, qty = 1) {
            const items = read();
            const line = items.find(i => sameLine(i, id, size));
            if (line) line.qty = Math.min(MAX_QTY, line.qty + qty);
            else items.push({ id, size, qty: Math.min(MAX_QTY, qty) });
            write(items);
        },
        setQty(id, size, qty) {
            const q = Math.max(1, Math.min(MAX_QTY, qty));
            write(read().map(i => sameLine(i, id, size) ? { ...i, qty: q } : i));
        },
        remove: (id, size) => write(read().filter(i => !sameLine(i, id, size))),
        clear: () => write([]),
    };

    const showToast = (text) => {
        const toast = document.getElementById('cartToast');
        if (!toast) return;
        const label = document.getElementById('toastItemName');
        if (label) label.textContent = text || 'Capo Sunnee';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    // Aggiunge un capo alla borsa, fa "pulsare" l'icona e mostra il messaggio
    const addToCart = (id, size, label) => {
        cart.add(id, size);
        document.querySelectorAll('.bag-icon').forEach(icon => {
            icon.classList.add('pulse');
            setTimeout(() => icon.classList.remove('pulse'), 500);
        });
        showToast(label);
    };

    // Utile alle pagine Borsa e Checkout
    const SHIPPING = { freeFrom: 150, express: 8 };
    const euro = (n) => '€' + n.toFixed(2);

    window.Sunnee = { cart, addToCart, SHIPPING, euro };

    // se la borsa cambia in un'altra scheda del browser, il contatore si aggiorna
    window.addEventListener('storage', renderCount);

    document.addEventListener('DOMContentLoaded', () => {
        renderCount();

        // --- Drawer mobile / menu ---
        const hamburger = document.getElementById('hamburgerBtn');
        const drawer = document.getElementById('mobileDrawer');
        const drawerOverlay = document.getElementById('mobileDrawerOverlay');
        const drawerClose = document.getElementById('drawerCloseBtn');
        const menuTrigger = document.getElementById('menuTriggerBtn');

        const openDrawer = () => {
            drawer?.classList.add('is-open');
            drawerOverlay?.classList.add('is-open');
            drawer?.setAttribute('aria-hidden', 'false');
            hamburger?.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        };
        const closeDrawer = () => {
            drawer?.classList.remove('is-open');
            drawerOverlay?.classList.remove('is-open');
            drawer?.setAttribute('aria-hidden', 'true');
            hamburger?.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        };
        hamburger?.addEventListener('click', () =>
            drawer?.classList.contains('is-open') ? closeDrawer() : openDrawer());
        menuTrigger?.addEventListener('click', (e) => { e.preventDefault(); openDrawer(); });
        drawerClose?.addEventListener('click', closeDrawer);
        drawerOverlay?.addEventListener('click', closeDrawer);
        document.querySelectorAll('.drawer-link').forEach(l => l.addEventListener('click', closeDrawer));

        // --- Overlay di ricerca ---
        const searchOverlay = document.getElementById('searchOverlay');
        const searchInput = document.getElementById('searchInput');
        const openSearch = (e) => {
            e?.preventDefault();
            searchOverlay?.classList.add('is-open');
            searchOverlay?.setAttribute('aria-hidden', 'false');
            setTimeout(() => searchInput?.focus(), 100);
        };
        const closeSearch = () => {
            searchOverlay?.classList.remove('is-open');
            searchOverlay?.setAttribute('aria-hidden', 'true');
        };
        document.getElementById('searchTriggerBtn')?.addEventListener('click', openSearch);
        document.querySelectorAll('.search-trigger-mobile').forEach(b => b.addEventListener('click', openSearch));
        document.getElementById('searchCloseBtn')?.addEventListener('click', closeSearch);

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            closeSearch();
            closeDrawer();
        });
    });
})();