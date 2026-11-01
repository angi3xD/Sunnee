/* Sunnee — pagina Account (login/registrazione simulati) */

function switchTab(tabName) {
    document.getElementById('tabLoginBtn').classList.toggle('active', tabName === 'login');
    document.getElementById('tabRegisterBtn').classList.toggle('active', tabName === 'register');
    document.getElementById('loginForm').classList.toggle('active', tabName === 'login');
    document.getElementById('registerForm').classList.toggle('active', tabName === 'register');
}

function handleAuthSim(event, type) {
    event.preventDefault();
    if (type === 'register') {
        const name = document.getElementById('regFirstName').value;
        if (name) document.getElementById('userNameDisplay').textContent = name;
    }
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
}

function handleLogout() {
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('authSection').style.display = 'block';
}

// "event" ora e' passato esplicitamente (prima si usava la variabile globale window.event)
function switchDashTab(tabName, btn) {
    document.querySelectorAll('.dash-nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('paneOrders').style.display = tabName === 'orders' ? 'block' : 'none';
    document.getElementById('paneAddresses').style.display = tabName === 'addresses' ? 'block' : 'none';
    document.getElementById('paneDetails').style.display = tabName === 'details' ? 'block' : 'none';
}

/* POPUP DI SIMULAZIONE */
const simModal = document.getElementById('simModal');

function openSim(title, html) {
    document.getElementById('simTitle').textContent = title;
    document.getElementById('simBody').innerHTML = html;
    simModal.classList.add('is-open');
    simModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeSim() {
    simModal.classList.remove('is-open');
    simModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// Ordini di esempio (per aggiungerne uno basta una nuova voce)
const ORDERS = {
    'SN-2026-8891': {
        date: '12 Ottobre 2026',
        status: 'Consegnato',
        tracking: 'SN8891IT',
        items: [
            { name: 'Palmera Bikini', meta: 'Terraccotta / S', price: 72 },
            { name: 'Sol  Set', meta: 'Terracotta / M', price: 65 },
        ],
        shipping: 0,
    },
};

function showOrderDetails(orderId) {
    const o = ORDERS[orderId];
    const subtotal = o.items.reduce((sum, i) => sum + i.price, 0);
    const rows = o.items.map(i =>
        `<div class="sim-row"><span>${i.name}<small>${i.meta}</small></span><span>€${i.price.toFixed(2)}</span></div>`
    ).join('');
    openSim(`Ordine #${orderId}`, `
        <p class="sim-meta">${o.date} · <strong>${o.status}</strong></p>
        ${rows}
        <div class="sim-row"><span>Spedizione</span><span>${o.shipping ? '€' + o.shipping.toFixed(2) : 'GRATIS'}</span></div>
        <div class="sim-row sim-total"><span>Totale</span><span>€${(subtotal + o.shipping).toFixed(2)}</span></div>
        <p class="sim-meta">Codice di tracciamento: <strong>${o.tracking}</strong></p>
    `);
}

function showForgotPassword() {
    openSim('Recupera la password', `
        <p>Inserisci la tua email: ti invieremo un link per scegliere una nuova password.</p>
        <form id="forgotForm">
            <div class="input-group">
                <label for="forgotEmail">Email Address *</label>
                <input type="email" id="forgotEmail" required placeholder="name@example.com">
            </div>
            <button type="submit" class="btn-account-submit">INVIA IL LINK</button>
        </form>
    `);
    // se l'utente aveva già scritto l'email nel login, la ricopiamo
    document.getElementById('forgotEmail').value = document.getElementById('loginEmail').value;
    document.getElementById('forgotEmail').focus();

    document.getElementById('forgotForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;
        document.getElementById('simBody').innerHTML = `
            <p>Se esiste un account per <strong id="sentTo"></strong>, tra pochi minuti riceverai un'email con le istruzioni.</p>
            <p class="sim-meta">Sito dimostrativo: nessuna email viene davvero inviata.</p>
            <button type="button" class="btn-account-submit" onclick="closeSim()">CHIUDI</button>`;
        document.getElementById('sentTo').textContent = email;   // textContent: l'email non viene letta come HTML
    });
}

// Un solo "ascoltatore" per tutta la pagina
document.addEventListener('click', (e) => {
    if (e.target.closest('#forgotPassLink')) { e.preventDefault(); showForgotPassword(); }
    const orderBtn = e.target.closest('.btn-order-details');
    if (orderBtn) { e.preventDefault(); showOrderDetails(orderBtn.dataset.order); }
    if (e.target.closest('#simClose') || e.target === simModal) closeSim();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSim(); });

/* MODIFICA INDIRIZZO */
// I dati dell'indirizzo stanno qui: la card nella pagina viene disegnata da questi valori
const address = {
    name: 'Elena Rossi',
    street: 'Via della Spiga, 12',
    zip: '20121',
    city: 'Milano (MI)',
    phone: '+39 340 123 4567',
};

function renderAddress() {
    document.getElementById('addrName').textContent = address.name;
    document.getElementById('addrLines').innerHTML = '';
    document.getElementById('addrLines').append(
        address.street, document.createElement('br'), `${address.zip} ${address.city}, Italia`
    );
    document.getElementById('addrPhone').textContent = `Tel: ${address.phone}`;
}
renderAddress();

function showEditAddress() {
    openSim('Modifica indirizzo', `
        <form id="addressForm">
            <div class="input-group">
                <label for="adName">Nome e Cognome *</label>
                <input type="text" id="adName" required>
            </div>
            <div class="input-group">
                <label for="adStreet">Indirizzo e Numero Civico *</label>
                <input type="text" id="adStreet" required>
            </div>
            <div class="form-row-2col">
                <div class="input-group">
                    <label for="adZip">CAP *</label>
                    <input type="text" id="adZip" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" title="5 cifre" required>
                </div>
                <div class="input-group">
                    <label for="adCity">Città *</label>
                    <input type="text" id="adCity" required>
                </div>
            </div>
            <div class="input-group">
                <label for="adPhone">Telefono *</label>
                <input type="tel" id="adPhone" required>
            </div>
            <button type="submit" class="btn-account-submit">SALVA INDIRIZZO</button>
        </form>
    `);
    // value si imposta da JavaScript (non dentro l'HTML), così anche i caratteri speciali restano al sicuro
    document.getElementById('adName').value = address.name;
    document.getElementById('adStreet').value = address.street;
    document.getElementById('adZip').value = address.zip;
    document.getElementById('adCity').value = address.city;
    document.getElementById('adPhone').value = address.phone;

    document.getElementById('addressForm').addEventListener('submit', (e) => {
        e.preventDefault();
        address.name = document.getElementById('adName').value.trim();
        address.street = document.getElementById('adStreet').value.trim();
        address.zip = document.getElementById('adZip').value;
        address.city = document.getElementById('adCity').value.trim();
        address.phone = document.getElementById('adPhone').value.trim();
        renderAddress();
        closeSim();
    });
}

document.getElementById('editAddressBtn').addEventListener('click', showEditAddress);

/* SALVA DETTAGLI PROFILO */
document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();   // il browser ha già controllato i campi obbligatori e l'email
    const first = document.getElementById('profileFirst').value.trim();
    document.getElementById('userNameDisplay').textContent = first;   // aggiorna "Benvenuta, ..."

    const msg = document.getElementById('profileSaved');
    msg.textContent = '✓ Modifiche salvate';
    msg.classList.add('is-visible');
    setTimeout(() => msg.classList.remove('is-visible'), 3000);
});