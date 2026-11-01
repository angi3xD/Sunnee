/* Sunnee — pagina Borsa: legge la borsa salvata (main.js) e i prodotti (products.js) */
document.addEventListener('DOMContentLoaded', () => {
    const { cart, SHIPPING, euro } = window.Sunnee;
    const list = document.querySelector('.bag-items-list');
    const progressWrap = document.querySelector('.free-shipping-progress');
    const checkoutBtn = document.querySelector('.btn-checkout');

    const findProduct = (id) => PRODUCTS.find(p => p.id === id);
    // "78% recycled polyamide, 22% elastane." -> "78% recycled polyamide"
    const mainMaterial = (p) => p.material.split(/[,.]/)[0];

    function render() {
        // le righe con un id che non esiste piu' nel catalogo vengono ignorate
        const lines = cart.items()
            .map(item => ({ ...item, product: findProduct(item.id) }))
            .filter(l => l.product);

        list.innerHTML = '';
        lines.forEach(({ id, size, qty, product }) => {
            const card = document.createElement('div');
            card.className = 'bag-item-card';
            card.dataset.id = id;
            card.dataset.size = size;
            card.innerHTML = `
                <div class="item-img-wrap"><img src="${product.img}" alt="${product.alt}"></div>
                <div class="item-details">
                    <div class="item-header-row">
                        <h3 class="item-name">${product.title}</h3>
                        <span class="item-price">${euro(product.price * qty)}</span>
                    </div>
                    <span class="item-meta">Color: ${product.color} / Size: ${size}</span>
                    <span class="item-sustainability">${mainMaterial(product)}</span>
                    <div class="item-actions-row">
                        <div class="qty-selector">
                            <button type="button" class="qty-btn minus" aria-label="Diminuisci quantità">-</button>
                            <span class="qty-value">${qty}</span>
                            <button type="button" class="qty-btn plus" aria-label="Aumenta quantità">+</button>
                        </div>
                        <button type="button" class="btn-remove-item">Remove</button>
                    </div>
                </div>`;
            list.appendChild(card);
        });

        const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
        const shipping = (subtotal === 0 || subtotal >= SHIPPING.freeFrom) ? 0 : SHIPPING.express;

        const vals = document.querySelectorAll('.summary-card .summary-val');
        vals[0].textContent = euro(subtotal);
        vals[1].textContent = subtotal === 0 ? '—' : (shipping ? euro(shipping) : 'FREE');
        document.querySelector('.total-val').textContent = euro(subtotal + shipping);

        // barra della spedizione gratuita
        const missing = Math.max(0, SHIPPING.freeFrom - subtotal);
        progressWrap.style.display = subtotal === 0 ? 'none' : '';
        progressWrap.querySelector('.progress-bar-fill').style.width = Math.min(100, (subtotal / SHIPPING.freeFrom) * 100) + '%';
        progressWrap.querySelector('.progress-text').innerHTML = missing > 0
            ? `Ti mancano <strong>${euro(missing)}</strong> per la <strong>Spedizione Gratuita Express</strong>`
            : 'Hai ottenuto la <strong>Spedizione Gratuita Express</strong>!';

        // borsa vuota
        const empty = lines.length === 0;
        if (empty) {
            list.innerHTML = `
                <div class="bag-empty">
                    <p>La tua borsa è vuota.</p>
                    <a href="shop.html" class="bag-empty-link">Scopri le collezioni &rarr;</a>
                </div>`;
        }
        checkoutBtn.classList.toggle('is-disabled', empty);
        checkoutBtn.setAttribute('aria-disabled', String(empty));
    }

    // un solo ascoltatore per tutta la lista (funziona anche per le card appena disegnate)
    list.addEventListener('click', (e) => {
        const card = e.target.closest('.bag-item-card');
        if (!card) return;
        const { id, size } = card.dataset;
        const qty = parseInt(card.querySelector('.qty-value').textContent, 10);

        if (e.target.closest('.qty-btn.plus')) cart.setQty(id, size, qty + 1);
        else if (e.target.closest('.qty-btn.minus')) cart.setQty(id, size, qty - 1);
        else if (e.target.closest('.btn-remove-item')) cart.remove(id, size);
        else return;
        render();
    });

    // con la borsa vuota il pulsante non porta al checkout
    checkoutBtn.addEventListener('click', (e) => {
        if (checkoutBtn.classList.contains('is-disabled')) e.preventDefault();
    });

    // codice promo: simulato
    document.querySelector('.btn-apply-promo')?.addEventListener('click', () => {
        const input = document.querySelector('.promo-input');
        input.value = '';
        input.placeholder = 'Codice non valido (demo)';
    });

    render();
});