var URL_SCRIPT_GOOGLE = "https://script.google.com/macros/s/AKfycbzSYTfKTivJipQctzkWsZ7yGdZjDDLcF2FmtbxVBqOOE-DH4iVlVka4mNAa8uX1MC-J/exec";

// =========================
// REGIÓN Y MONEDA
// =========================

let YK_REGION = localStorage.getItem('yk_region') || 'mx';

const USD_RATE = 20;
const PAYPAL_FEE = 1.045;

function convertToUSD(mxn) {
  return ((mxn / USD_RATE) * PAYPAL_FEE);
}

function formatPrice(value) {
  return YK_REGION === 'mx'
    ? `$${value.toFixed(2)} MXN`
    : `$${value.toFixed(2)} USD`;
}

function setRegion(region) {
  YK_REGION = region;
  localStorage.setItem('yk_region', region);

  document.getElementById('yk-btn-mx').style.opacity = region === 'mx' ? '1' : '0.6';
  document.getElementById('yk-btn-int').style.opacity = region === 'int' ? '1' : '0.6';

  document.getElementById('yk-region-warning').style.display =
    region === 'int' ? 'block' : 'none';

  // 🔽 LIMPIEZA AL CAMBIAR DE REGIÓN (PASO 5)
  document
    .querySelectorAll('input[name="yk-shipping"]')
    .forEach(r => r.checked = false);

  document.getElementById('sub-envio').style.display = 'none';
  document.getElementById('sub-entrega').style.display = 'none';
  // 🔼 FIN DE LIMPIEZA

  renderCartList();

  // 🌍 AJUSTES VISUALES POR REGIÓN
  if (region === 'int') {
    document.getElementById('tab-entrega').style.display = 'none';

    const envInt = document.getElementById('env-int');
    if (envInt) envInt.style.display = 'block';

    document.getElementById('sub-envio').style.display = 'block';

  } else {
    document.getElementById('tab-entrega').style.display = 'flex';

    const envInt = document.getElementById('env-int');
    if (envInt) envInt.style.display = 'none';
  }
}


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

list.innerHTML = "";
let sub = 0;
let subFinal = 0;

Object.keys(yk_cart).forEach(id => {

let p = getProduct(id);

if(p) {

let baseTotal = p.price * yk_cart[id];

let itemTotal = YK_REGION === 'int'
  ? convertToUSD(baseTotal)
  : baseTotal;

sub += baseTotal;

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
${formatPrice(itemTotal)}
</span>

</li>`;

}

});
 
if (YK_REGION === 'int') {
  subFinal = convertToUSD(sub);
} else {
  subFinal = sub;
}

document.getElementById('yk-cart-subtotal').innerText =
  `Subtotal: ${formatPrice(subFinal)}`;

const goalText = document.getElementById('yk-goal-text');
const goalBar = document.getElementById('yk-goal-bar');
const goalContainer = document.querySelector('.yk-shipping-goal-container');

if (YK_REGION === 'mx') {

  // 👇 TODO este bloque solo vive en México
  goalContainer.style.display = 'block';

  if (sub >= GOAL_SHIPPING) {

    goalText.innerHTML =
      "✨ ¡Felicidades! Tienes <strong>Envío Gratis</strong> ✨";
    goalBar.style.width = "100%";

  } else {

    let faltante = GOAL_SHIPPING - sub;
    let porcentaje = (sub / GOAL_SHIPPING) * 100;

    goalText.innerHTML =
      `Agrega <strong>$${faltante.toFixed(2)}</strong> más y no pagues envío. 🚚`;
    goalBar.style.width = `${porcentaje}%`;

  }

} else {

  // 🌍 Internacional: NO hay metas de envío
  goalContainer.style.display = 'none';

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

let totalBase = sub + (esGratis ? 0 : (envSel ? parseFloat(envSel.value) : 0));

let totalFinal = YK_REGION === 'int'
  ? convertToUSD(totalBase)
  : totalBase;

document.getElementById('yk-cart-total').innerText =
`Total: ${formatPrice(totalFinal)}`;


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

applyInternationalForm();

goStep(1);

// 🔽 AQUÍ EMPIEZA LO NUEVO (reset visual)
  document.getElementById('sub-envio').style.display = 'none';
  document.getElementById('sub-entrega').style.display = 'none';

  document
    .querySelectorAll('input[name="yk-shipping"]')
    .forEach(r => r.checked = false);
  // 🔼 AQUÍ TERMINA LO NUEVO

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

toggleCampos(true);

} else {

tabEntrega.style.background = 'rgba(194,166,134,0.15)';
tabEntrega.style.borderColor = 'rgba(194,166,134,0.6)';
tabEntrega.style.color = '#C2A686';

tabEnvio.style.background = 'rgba(255,255,255,0.05)';
tabEnvio.style.borderColor = 'rgba(255,255,255,0.25)';
tabEnvio.style.color = '#fff';

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

if (YK_REGION === 'int') {
  alert("Próximamente pagos internacionales vía PayPal ✨");
  return;
}

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

function applyInternationalForm() {
  if (YK_REGION !== 'int') return;

  document.getElementById('yk-address-section').innerHTML = `
    <div class="yk-form-group">
      <label>Nombre Completo</label>
      <input placeholder="Tal cual aparece en su identificación oficial">
    </div>

    <div class="yk-form-group">
      <label>País</label>
      <input>
    </div>

    <div class="yk-form-group">
      <label>Código Postal</label>
      <input>
    </div>
  `;
}
function validateStep1() {

  // INTERNACIONAL: no necesita método de envío
  if (YK_REGION === 'int') {
    goStep(2);
    return;
  }

  // MÉXICO: sí debe elegir
  const selected = document.querySelector('input[name="yk-shipping"]:checked');

  if (!selected) {
    alert("Por favor elige cómo quieres recibir tu pedido 📦🤝");
    return;
  }

  goStep(2);
}
