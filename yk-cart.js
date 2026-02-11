var URL_SCRIPT_GOOGLE = "https://script.google.com/macros/s/AKfycbzSYTfKTivJipQctzkWsZ7yGdZjDDLcF2FmtbxVBqOOE-DH4iVlVka4mNAa8uX1MC-J/exec";


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
<li style="
display:flex;
align-items:center;
gap:10px;
margin-bottom:8px;
border-bottom: 1px solid rgba(255,255,255,0.1);
padding-bottom:5px;
">

<img
src="${p.thumb || ''}"
loading="lazy"
style="
width: 64px;
height: auto;
max-height: 80px;
object-fit: contain;
border-radius: 4px;
background: transparent;
flex-shrink: 0;
"
>

<span style="flex:1; text-align:left;">
${p.name}
</span>

<div style="display:flex; align-items:center;">
<button type="button" class="qty-btn" onclick="changeQty('${id}', -1)">-</button>
<span style="font-weight:bold; min-width:20px; text-align:center;">${yk_cart[id]}</span>
<button type="button" class="qty-btn" onclick="changeQty('${id}', 1)">+</button>
</div>

<span style="min-width:80px; text-align:right;">
$${itemTotal.toFixed(2)}
</span>

</li>`;

}

});

document.getElementById('yk-cart-subtotal').innerText = `Subtotal: $${sub.toFixed(2)} MXN`;

const esGratis = sub >= GOAL_SHIPPING;

const goalText = document.getElementById('yk-goal-text');

const goalBar = document.getElementById('yk-goal-bar');

if (esGratis) {

goalText.innerHTML = "✨ ¡Felicidades! Tienes <strong>Envío Gratis</strong> ✨";

goalBar.style.width = "100%";

} else {

let faltante = GOAL_SHIPPING - sub;

let porcentaje = (sub / GOAL_SHIPPING) * 100;

goalText.innerHTML = `Agrega <strong>$${faltante.toFixed(2)}</strong> más y no pagues envío. 🚚`;

goalBar.style.width = `${porcentaje}%`;

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

document.getElementById('yk-address-section').style.display = esEnvio ? 'block' : 'none';

document.getElementById('label-nombre').innerText = esEnvio ? "Nombre Completo *" : "Nombre o Nickname *";

renderCartList();

}
function selectModo(modo) {

const tabEnvio = document.getElementById('tab-envio');
const tabEntrega = document.getElementById('tab-entrega');

document.getElementById('sub-envio').style.display = modo === 'envio' ? 'block' : 'none';
document.getElementById('sub-entrega').style.display = modo === 'entrega' ? 'block' : 'none';

if (modo === 'envio') {

tabEnvio.style.background = 'rgba(194,166,134,0.15)';
tabEnvio.style.borderColor = 'rgba(194,166,134,0.6)';
tabEnvio.style.color = '#C2A686';

tabEntrega.style.background = 'rgba(255,255,255,0.05)';
tabEntrega.style.borderColor = 'rgba(255,255,255,0.25)';
tabEntrega.style.color = '#fff';

document.getElementById('env-p').checked = true;
toggleCampos(true);

} else {

tabEntrega.style.background = 'rgba(194,166,134,0.15)';
tabEntrega.style.borderColor = 'rgba(194,166,134,0.6)';
tabEntrega.style.color = '#C2A686';

tabEnvio.style.background = 'rgba(255,255,255,0.05)';
tabEnvio.style.borderColor = 'rgba(255,255,255,0.25)';
tabEnvio.style.color = '#fff';

document.getElementById('env-m').checked = true;
toggleCampos(false);

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
