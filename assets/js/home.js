/* Sunnee — pagina Home: moodboard e quick view (letti da PRODUCTS in products.js), animazioni */

const money = (n) => `€${n.toFixed(2)}`;
const COLLECTION_LABEL = { relax: 'Relax', active: 'Active', extreme: 'Extreme' };
const productById = (id) => PRODUCTS.find(p => p.id === id);
const titleCase = (s) => s.charAt(0) + s.slice(1).toLowerCase();

document.addEventListener('DOMContentLoaded', () => {
    // ---------- Moodboard: disegnata dai prodotti con home: true ----------
    const moodGrid = document.getElementById('moodboardGrid');
    PRODUCTS.filter(p => p.home).slice(0, 4).forEach((p, i) => {
        const item = document.createElement('div');
        item.className = `mood-item item-${i + 1}`;
        item.dataset.category = p.collection;
        item.setAttribute('role', 'link');
        item.tabIndex = 0;
        item.innerHTML = `
            <div class="mood-img-wrap"><img src="${p.img}" alt="${p.alt}"></div>
            <div class="mood-details">
                <span class="item-name">${titleCase(p.title)} ${p.short}</span>
                <span class="item-price">${money(p.price)}</span>
            </div>`;
        const open = () => { window.location.href = `shop.html?p=${p.id}`; };   // apre la scheda nello shop
        item.addEventListener('click', open);
        item.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
        moodGrid.appendChild(item);
    });

    // ---------- Quick View (dai pulsanti con data-product="id") ----------
    const modal = document.getElementById('quickviewModal');
    const qvImage = document.getElementById('qvImage');
    const qvTitle = document.getElementById('qvTitle');
    const qvPrice = document.getElementById('qvPrice');
    const qvDescription = document.getElementById('qvDescription');
    const qvLink = document.getElementById('qvLink');
    let qvProduct = null;   // il prodotto mostrato nel Quick View
    const closeModal = () => modal?.classList.remove('active');

    document.querySelectorAll('.btn-quick-view').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const p = productById(button.dataset.product);
            qvProduct = p;
            qvTitle.textContent = `${titleCase(p.title)} · ${COLLECTION_LABEL[p.collection]}`;
            qvPrice.textContent = money(p.price);
            qvImage.src = p.modalImg;
            qvImage.alt = p.alt;
            qvDescription.textContent = `${p.desc}. Dalla collezione ${COLLECTION_LABEL[p.collection]}: filati ricavati da reti da pesca recuperate.`;
            if (qvLink) qvLink.href = `shop.html?c=${p.collection}`;
            modal.classList.add('active');
        });
    });
    document.getElementById('quickviewClose')?.addEventListener('click', closeModal);
    document.getElementById('quickviewOverlay')?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // Selezione taglia
    document.querySelectorAll('.size-selector .size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.parentElement.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.querySelector('.quickview-modal .btn-add-to-cart')?.addEventListener('click', () => {
        const size = document.querySelector('.size-selector .size-btn.active')?.textContent || 'S';
        window.Sunnee.addToCart(qvProduct.id, size, `${qvProduct.title} · ${qvProduct.color} / ${size}`);
        closeModal();
    });

    // ---------- Animazioni allo scroll (dopo aver creato le card della moodboard) ----------
    const revealEls = document.querySelectorAll('.arch-card, .story-step, .mood-item, .kids-teaser-banner');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    revealEls.forEach(el => { el.classList.add('reveal'); observer.observe(el); });

    // ---------- Filtro moodboard per collezione ----------
    const filterButtons = document.querySelectorAll('.mood-filters .filter-btn');
    const moodItems = document.querySelectorAll('.moodboard-grid .mood-item');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            const value = button.dataset.filter;
            moodItems.forEach(item => {
                item.classList.toggle('is-hidden', value !== 'all' && value !== item.dataset.category);
            });
        });
    });
});