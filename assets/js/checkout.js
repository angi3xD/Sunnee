/* Sunnee — Checkout (simulato: nessun pagamento reale). Il riepilogo legge la borsa salvata. */

document.addEventListener('DOMContentLoaded', () => {
    const { cart, SHIPPING, euro } = window.Sunnee;
    const form = document.getElementById('checkoutForm');
    const submitBtn = document.querySelector('.btn-complete-order');
    const summaryBox = document.querySelector('.summary-box');
    const boxes = document.querySelectorAll('.shipping-radio-box');

    const lines = cart.items()
        .map(item => ({ ...item, product: PRODUCTS.find(p => p.id === item.id) }))
        .filter(l => l.product);
    const pieces = lines.reduce((sum, l) => sum + l.qty, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);

    // l'Express e' gratis sopra la soglia; la Green Shipping e' sempre gratis
    const expressCost = subtotal >= SHIPPING.freeFrom ? 0 : SHIPPING.express;
    const shippingCost = () => document.querySelector('input[name="shippingMethod"]:checked').value === 'express' ? expressCost : 0;

    // ---------- Riepilogo laterale ----------
    summaryBox.querySelector('.summary-title').textContent = `Riepilogo Ordine (${pieces})`;
    summaryBox.querySelectorAll('.co-item').forEach(el => el.remove());
    const breakdown = summaryBox.querySelector('.summary-breakdown');

    lines.forEach(({ size, qty, product }) => {
        const row = document.createElement('div');
        row.className = 'co-item';
        row.innerHTML = `
            <img src="${product.img}" alt="${product.alt}">
            <div class="co-item-info">
                <h4>${product.title}</h4>
                <span>Taglia: ${size} / Colore: ${product.color}${qty > 1 ? ' / Qtà: ' + qty : ''}</span>
                <strong>${euro(product.price * qty)}</strong>
            </div>`;
        breakdown.before(row);

        // Scelta metodo di pagamento: con PayPal/Klarna i campi carta si nascondono
const cardFields = document.getElementById('cardFields');
const cardInputs = cardFields.querySelectorAll('input');

document.querySelectorAll('input[name="paymentType"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const useCard = radio.value === 'card' && radio.checked;
        if (!radio.checked) return;
        cardFields.style.display = useCard ? '' : 'none';
        cardInputs.forEach(input => { input.required = useCard; });
    });
});
    });

    function updateTotals() {
        const shipping = shippingCost();
        const isExpress = document.querySelector('input[name="shippingMethod"]:checked').value === 'express';
        breakdown.innerHTML = `
            <div class="row"><span>Subtotale</span><span>${euro(subtotal)}</span></div>
            <div class="row"><span>${isExpress ? 'Spedizione Express' : 'Spedizione Green'}</span><span>${shipping ? euro(shipping) : 'GRATIS'}</span></div>
            <div class="row total"><span>Totale Ordine</span><span>${euro(subtotal + shipping)}</span></div>`;
        submitBtn.textContent = `CONFERMA E PAGA ${euro(subtotal + shipping)}`;
    }

    // prezzo mostrato accanto al metodo Express
    const expressPrice = document.querySelector('input[value="express"]')?.closest('label').querySelector('.ship-price');
    if (expressPrice) expressPrice.textContent = expressCost ? euro(expressCost) : 'GRATIS';

    boxes.forEach(box => {
        box.querySelector('input').addEventListener('change', () => {
            boxes.forEach(b => b.classList.remove('active'));
            box.classList.add('active');
            updateTotals();
        });
    });
    updateTotals();

    // ---------- Borsa vuota: niente da pagare ----------
    if (lines.length === 0) {
        summaryBox.insertBefore(Object.assign(document.createElement('div'), {
            className: 'bag-empty',
            innerHTML: '<p>La tua borsa è vuota.</p><a href="shop.html" class="bag-empty-link">Scopri le collezioni &rarr;</a>',
        }), breakdown);
        submitBtn.disabled = true;
    }

    // ---------- Invio ordine ----------
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (lines.length === 0) return;
        const orderNumber = 'SN-2026-' + String(Math.floor(1000 + Math.random() * 9000));
        document.querySelector('#successOverlay strong').textContent = '#' + orderNumber;
        document.getElementById('successOverlay').classList.add('active');
        cart.clear();   // ordine completato: la borsa si svuota
    });

    // ---------- Formattazione leggera dei campi carta ----------
    const cardNum = document.getElementById('cardNum');
    cardNum?.addEventListener('input', () => {
        const digits = cardNum.value.replace(/\D/g, '').slice(0, 16);
        cardNum.value = digits.replace(/(.{4})/g, '$1 ').trim();
    });
    const cardExp = document.getElementById('cardExp');
    cardExp?.addEventListener('input', () => {
        const d = cardExp.value.replace(/\D/g, '').slice(0, 4);
        cardExp.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
    });
});