var URL_SCRIPT_GOOGLE = "https://script.google.com/macros/s/AKfycbxnI1j_S3HkdMXDXuNz_v_bHB3AzY40dXVaGOJsQKcB99zi_br4Li52JCCUuD-5suG1/exec";


var yk_cart = JSON.parse(localStorage.getItem('ykshopCart')) || {};

const GOAL_SHIPPING = 645;

function getProduct(id) {

return (window.yk_products && window.yk_products[id]) ? window.yk_products[id] : null;

}

function updateCartUI() {

let sub = 0; let count = 0;

Object.keys(yk_cart).forEach(id => {

let p = getProduct(id);

if(p) { sub += p.price * yk_cart[id]; count += yk_cart[id]; }

});

const btn = document.getElementById('yk-cart-btn-flotante');

if(btn) btn.innerText = `🛒 (${count}) $${sub.toFixed(2)} MXN`;

}

function renderCartList() {

const list = document.getElementById('yk-cart-summary');

list.innerHTML = ""; let sub = 0;

Object.keys(yk_cart).forEach(id => {

let p = getProduct(id);

if(p) {

let itemTotal = p.price * yk_cart[id];

sub += itemTotal;

list.innerHTML += `
<li class="yk-cart-item">

<img
src="${p.thumb || ''}"
loading="lazy"
style="
width: 70px;
height: auto;
max-height: 80px;
object-fit: contain;
border-radius: 8px;
flex-shrink: 0;
"
>

<div style="flex:1; text-align:left;">

<div style="font-size:0.95rem; margin-bottom:4px;">
${p.name}
</div>

<div style="opacity:0.6; font-size:0.8rem;">
$${p.price.toFixed(2)} MXN
</div>

</div>

<div style="display:flex; align-items:center; gap:4px;">
<button type="button" class="qty-btn" onclick="changeQty('${id}', -1)">−</button>
<span style="font-weight:bold; min-width:20px; text-align:center;">${yk_cart[id]}</span>
<button type="button" class="qty-btn" onclick="changeQty('${id}', 1)">+</button>
</div>

<div class="yk-item-price">
$${itemTotal.toFixed(2)}
</div>

</li>`;

}

});

document.getElementById('yk-cart-subtotal').innerText = `Subtotal: $${sub.toFixed(2)} MXN`;

const esGratis = sub >= GOAL_SHIPPING;

const goalText = document.getElementById('yk-goal-text');

const goalBar = document.getElementById('yk-goal-bar');

if (esGratis) {

goalText.innerHTML = "✨ Envío gratis desbloqueado";

goalBar.style.width = "100%";
goalBar.style.boxShadow = "0 0 18px rgba(194,166,134,0.6)";

} else {

let faltante = GOAL_SHIPPING - sub;

let porcentaje = (sub / GOAL_SHIPPING) * 100;

goalText.innerHTML = `✨ Estás a <strong>$${faltante.toFixed(2)}</strong> de desbloquear envío gratis`;

goalBar.style.width = `${porcentaje}%`;
goalBar.style.opacity = "1";

}

const envs = { p: 180, c: 80, m: 30, e: 0 };

Object.keys(envs).forEach(k => {

const el = document.getElementById('lbl-' + k);

if (el) {

if (esGratis) {

el.innerHTML = `<span class="strike-price">$${envs[k].toFixed(2)} MXN</span> <span class="free-badge">GRATIS</span>`;

} else {

el.innerHTML = `<strong>Costo: $${envs[k].toFixed(2)} MXN</strong>`;

}

}

});

const envSel = document.querySelector('input[name="yk-shipping"]:checked');

const total = sub + (esGratis ? 0 : (envSel ? parseFloat(envSel.value) : 0));

document.getElementById('yk-cart-total').innerText = `Total: $${total.toFixed(2)} MXN`;

}

function changeQty(id, delta) {

if (!yk_cart[id]) return;

yk_cart[id] += delta;

if (yk_cart[id] <= 0) delete yk_cart[id];

localStorage.setItem('ykshopCart', JSON.stringify(yk_cart));

updateCartUI();

renderCartList();

if (Object.keys(yk_cart).length === 0) closeCartModal();

}

function addToCart(productId, buttonElement) {

yk_cart[productId] = (yk_cart[productId] || 0) + 1;

localStorage.setItem('ykshopCart', JSON.stringify(yk_cart));

updateCartUI();

if (buttonElement) {

let original = buttonElement.innerHTML;

buttonElement.innerHTML = "¡Agregado! ✔";

buttonElement.disabled = true;

setTimeout(() => { buttonElement.innerHTML = original; buttonElement.disabled = false; }, 1500);

}

}

function openCartModal() {

if (Object.keys(yk_cart).length === 0) return alert("Tu carrito está vacío.");

document.getElementById('yk-modal-checkout').classList.add('visible');

loadDraft();

renderCartList();

}

function closeCartModal() { document.getElementById('yk-modal-checkout').classList.remove('visible'); }

function handleOutsideClick(e) { if (e.target.id === 'yk-modal-checkout') closeCartModal(); }

function toggleCampos(esEnvio) {

const address = document.getElementById('yk-address-section');
const form = document.getElementById('yk-order-form');

// Mostrar/ocultar dirección
if (esEnvio) {
  address.style.display = 'block';
} else {
  address.style.display = 'none';
}

// Cambiar label de nombre
document.getElementById('label-nombre').innerText =
  esEnvio ? "Nombre Completo *" : "Nombre o Nickname *";

// 🔥 FORZAR aparición del formulario (la clave del bug)
form.style.display = 'block';
form.style.opacity = '0';

// pequeño reset para asegurar animación
setTimeout(() => {
  form.style.opacity = '1';
}, 50);

renderCartList();

}
function selectModo(modo) {
// ocultar formulario al cambiar de modo
// resetear selección de envío
document.querySelectorAll('input[name="yk-shipping"]').forEach(r => r.checked = false);

// ocultar formulario al cambiar modo
const form = document.getElementById('yk-order-form');
form.style.display = 'none';
form.style.opacity = '0';

const tabEnvio = document.getElementById('tab-envio');
const tabEntrega = document.getElementById('tab-entrega');

document.getElementById('sub-envio').style.display = modo === 'envio' ? 'block' : 'none';
document.getElementById('sub-entrega').style.display = modo === 'entrega' ? 'block' : 'none';

if (modo === 'envio') {

tabEnvio.classList.add('active');
tabEntrega.classList.remove('active');

tabEnvio.style.background = 'rgba(194,166,134,0.15)';
tabEnvio.style.borderColor = 'rgba(194,166,134,0.6)';
tabEnvio.style.color = '#C2A686';

tabEntrega.style.background = 'rgba(255,255,255,0.05)';
tabEntrega.style.borderColor = 'rgba(255,255,255,0.25)';
tabEntrega.style.color = '#fff';


} else {

tabEntrega.classList.add('active');
tabEnvio.classList.remove('active');

tabEntrega.style.background = 'rgba(194,166,134,0.15)';
tabEntrega.style.borderColor = 'rgba(194,166,134,0.6)';
tabEntrega.style.color = '#C2A686';

tabEnvio.style.background = 'rgba(255,255,255,0.05)';
tabEnvio.style.borderColor = 'rgba(255,255,255,0.25)';
tabEnvio.style.color = '#fff';


}

renderCartList();

}

function saveDraft() {

const d = {

n: document.getElementById('yk-nombre').value,

e: document.getElementById('yk-email').value,

t: document.getElementById('yk-telefono').value,

c: document.getElementById('yk-calle').value,

cp: document.getElementById('yk-cp').value,

ci: document.getElementById('yk-ciudad').value,

r: document.getElementById('yk-referencia').value,

nt: document.getElementById('yk-notas').value

};

localStorage.setItem('yk_order_draft', JSON.stringify(d));

}

function loadDraft() {

const d = JSON.parse(localStorage.getItem('yk_order_draft'));

if(d) {

document.getElementById('yk-nombre').value = d.n || "";

document.getElementById('yk-email').value = d.e || "";

document.getElementById('yk-telefono').value = d.t || "";

document.getElementById('yk-calle').value = d.c || "";

document.getElementById('yk-cp').value = d.cp || "";

document.getElementById('yk-ciudad').value = d.ci || "";

document.getElementById('yk-referencia').value = d.r || "";

document.getElementById('yk-notas').value = d.nt || "";

}

}

function enviarPedido() {

const n = document.getElementById('yk-nombre').value;

const e = document.getElementById('yk-email').value;

const t = document.getElementById('yk-telefono').value;

if(!n || !e || !t) return alert("Por favor llena los campos obligatorios.");

const btn = document.getElementById('btn-email-submit');

btn.innerHTML = "PROCESANDO..."; btn.disabled = true;

let res = ""; let sub = 0;

Object.keys(yk_cart).forEach(id => {

let p = getProduct(id);

if(p) { res += `▪️ ${yk_cart[id]}x ${p.name}\n`; sub += p.price * yk_cart[id]; }

});

const env = document.querySelector('input[name="yk-shipping"]:checked');

const esG = sub >= GOAL_SHIPPING;

const tot = (sub + (esG ? 0 : parseFloat(env.value))).toFixed(2);


let dir = "";

if (env.id === 'env-m') {

dir = 'Entrega Presencial (Metro CDMX)';

} else if (env.id === 'env-e') {

dir = 'Entrega en Evento (Projet Daze)';

} else {

dir = `${document.getElementById('yk-calle').value}, CP ${document.getElementById('yk-cp').value}, ${document.getElementById('yk-ciudad').value}`;

}

const fd = new URLSearchParams();

fd.append("nombre", n);

fd.append("email", e);

fd.append("telefono", t);

fd.append("direccion", dir);

fd.append("resumen", res);

fd.append("total", `$${tot} MXN`);

fd.append("metodoEnvio", esG ? env.id + "_GRATIS" : env.id);

fd.append("notas", document.getElementById('yk-notas').value);

fetch(URL_SCRIPT_GOOGLE, { method: 'POST', body: fd, mode: 'no-cors' })

.then(() => {

const btn = document.getElementById('btn-email-submit');
btn.innerHTML = "ORDEN REGISTRADA ✔ (toca para cerrar)";
btn.disabled = false;
btn.style.opacity = "0.8";

btn.onclick = () => {
  closeCartModal();
};


const msg = document.getElementById("yk-confirmation-msg");
msg.innerHTML = `
<strong>¡Orden registrada con éxito! 🕯️</strong><br><br>
En cinco minutos te llegará un e-mail<br>
con todos los detalles de tu compra.<br>
Revisa también tu carpeta de SPAM 👁️<br><br>
🌙 Puedes cerrar esta ventana con calma 🌙
`;
msg.style.display = "block";

yk_cart = {};
localStorage.removeItem('ykshopCart');
localStorage.removeItem('yk_order_draft');

})

.catch(() => {

alert("Error de conexión. Intenta de nuevo.");

btn.innerHTML = "Confirmar Compra 🔮"; btn.disabled = false;

});

}

let checkLoad = setInterval(() => {

if(window.yk_products) { updateCartUI(); clearInterval(checkLoad); }

}, 500);

window.onload = updateCartUI;
