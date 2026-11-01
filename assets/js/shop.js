/* Sunnee — pagina Shop: catalogo da PRODUCTS (products.js), scheda prodotto, filtri per collezione */

const formatPrice = (n) => `€${n.toFixed(2)}`;

// Testo che compare sotto i filtri (stesso tono delle card della Home)
const COLLECTION_INTRO = {
    all:     'Tre collezioni, per lei e per lui. Presto anche la linea Kids (2027).',
    relax:   'Relax — Comfort e vestibilità essenziale per il mare di tutti i giorni.',
    active:  'Active — Sostegno e libertà di movimento per gli sport acquatici.',
    extreme: 'Extreme — Progettato per atleti e surfisti professionisti.',
};

// ---------- Scheda prodotto (modale) ----------
let selectedProduct = null;
let selectedSize = null;

function renderSizes(product) {
    const box = document.getElementById('modal-sizes');
    box.innerHTML = '';
    // taglia di partenza: la S se esiste, altrimenti la prima
    selectedSize = product.sizes.includes('S') ? 'S' : product.sizes[0];
    product.sizes.forEach(size => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'size-btn' + (size === selectedSize ? ' active' : '');
        btn.textContent = size;
        btn.addEventListener('click', () => {
            selectedSize = size;
            box.querySelectorAll('.size-btn').forEach(b => b.classList.toggle('active', b === btn));
        });
        box.appendChild(btn);
    });
}

function openProductModal(product) {
    const modal = document.getElementById('product-modal');
    const loader = document.getElementById('modal-loader');

    modal.classList.add('active');
    loader.classList.add('active');
    document.body.style.overflow = 'hidden';

    selectedProduct = product;
    document.getElementById('modal-title').textContent = product.title;
    document.getElementById('modal-desc').textContent = product.desc;
    document.getElementById('modal-price').textContent = formatPrice(product.price);
    document.getElementById('modal-color').textContent = product.color;
    document.getElementById('modal-featuring').textContent = product.featuring;
    document.getElementById('modal-material').textContent = product.material;
    document.getElementById('modal-care').textContent = product.care;
    const img = document.getElementById('modal-img');
    img.src = product.modalImg;
    img.alt = product.title;
    renderSizes(product);

    // Simula il tempo di caricamento
    setTimeout(() => loader.classList.remove('active'), 650);
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
    document.getElementById('modal-loader').classList.remove('active');
    document.body.style.overflow = '';
}

// ---------- Catalogo ----------
const grid = () => document.getElementById('product-grid');
let currentCollection = 'all';

const isVisible = (product) => currentCollection === 'all' || currentCollection === product.collection;

function badgeFor(product) {
    if (product.gender !== 'donna') return product.gender.toUpperCase();   // UOMO / UNISEX
    return product.badge;                                                   // es. NEW
}

function createCard(product) {
    const card = document.createElement('div');
    card.className = 'cb-product-card';
    card.dataset.collection = product.collection;
    const badge = badgeFor(product);
    card.innerHTML = `
        <div class="cb-img-wrap">
            <img src="${product.img}" alt="${product.alt}" class="img-main">
            <img src="${product.imgHover}" alt="${product.alt} indossato" class="img-hover">
        </div>
        <div class="cb-product-details">
            <h3 class="cb-prod-title">${product.title}</h3>
            <p class="cb-prod-desc">${product.desc}</p>
            <div class="cb-prod-price-row">
                <span class="cb-price">${formatPrice(product.price)}</span>
                ${badge ? `<span class="cb-badge">${badge}</span>` : ''}
            </div>
        </div>`;
    card.addEventListener('click', () => openProductModal(product));
    card.style.display = isVisible(product) ? '' : 'none';
    return card;
}

const renderProducts = (list) => list.forEach(p => grid().appendChild(createCard(p)));

function setCollection(collection, links) {
    currentCollection = COLLECTION_INTRO[collection] ? collection : 'all';
    links.forEach(l => l.classList.toggle('active', l.dataset.cat === currentCollection));
    document.getElementById('collectionIntro').textContent = COLLECTION_INTRO[currentCollection];
    document.querySelectorAll('.cb-product-card').forEach(card => {
        card.style.display = (currentCollection === 'all' || currentCollection === card.dataset.collection) ? '' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const firstBatch = PRODUCTS.filter(p => !p.extra);
    const secondBatch = PRODUCTS.filter(p => p.extra);

    // Filtro dalla barra, oppure dall'indirizzo: shop.html?c=relax (usato dai link del footer)
    const catLinks = document.querySelectorAll('.cb-categories-bar .cat-link');
    const fromUrl = new URLSearchParams(location.search).get('c');
    currentCollection = COLLECTION_INTRO[fromUrl] ? fromUrl : 'all';

    renderProducts(firstBatch);
    setCollection(currentCollection, catLinks);

    catLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            setCollection(link.dataset.cat, catLinks);
        });
    });

    // "Mostra altri capi": compare solo se esistono capi extra
    const loadMoreWrap = document.querySelector('.load-more-wrap');
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (secondBatch.length === 0) {
        loadMoreWrap.style.display = 'none';
    } else {
        document.querySelector('.load-more-count').textContent = `Mostrando ${firstBatch.length} di ${PRODUCTS.length} Capi`;
        loadMoreBtn.addEventListener('click', () => {
            renderProducts(secondBatch);
            loadMoreWrap.style.display = 'none';
        });
    }

    // Link dalla Home: shop.html?p=palmera apre direttamente la scheda del prodotto
    const wanted = PRODUCTS.find(p => p.id === new URLSearchParams(location.search).get('p'));
    if (wanted) {
        if (wanted.extra) renderProducts(secondBatch);   // se il capo è tra gli "extra", lo mostriamo
        setCollection(wanted.collection, catLinks);
        openProductModal(wanted);
    }

    // Modale: aggiungi alla borsa, chiudi
    document.getElementById('btnAddToCartModal')?.addEventListener('click', () => {
        window.Sunnee.addToCart(selectedProduct.id, selectedSize, `${selectedProduct.title} · ${selectedProduct.color} / ${selectedSize}`);
        closeProductModal();
    });
    document.getElementById('modal-close')?.addEventListener('click', closeProductModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProductModal(); });
});