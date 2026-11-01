/* Sunnee — FAQ a fisarmonica */
function toggleFaq(btn, forceOpen) {
    const item = btn.parentElement;
    const open = forceOpen ?? !item.classList.contains('active');
    item.classList.toggle('active', open);
    btn.setAttribute('aria-expanded', open);
    btn.querySelector('.faq-icon').textContent = open ? '−' : '+';
}

// Link tipo faq.html#returns: apre direttamente la domanda giusta
document.addEventListener('DOMContentLoaded', () => {
    const target = document.getElementById(location.hash.slice(1));
    const btn = target?.querySelector('.faq-question');
    if (btn) { toggleFaq(btn, true); target.scrollIntoView({ block: 'center' }); }
});
