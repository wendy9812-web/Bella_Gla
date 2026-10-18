// Carrito de compras de Bella Glam
// Guarda los productos en localStorage para que persistan al cambiar de pagina.

const CLAVE_CARRITO = "bellaGlamCarrito";

const Carrito = {
  obtener() {
    try {
      const datos = localStorage.getItem(CLAVE_CARRITO);
      return datos ? JSON.parse(datos) : [];
    } catch (e) {
      return [];
    }
  },

  guardar(items) {
    try {
      localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
    } catch (e) {
      /* el navegador puede bloquear el almacenamiento */
    }
    Carrito.actualizarContador();
  },

  agregar(idProducto, tono = null, cantidad = 1) {
    const items = Carrito.obtener();
    // Si el mismo producto con el mismo tono ya existe, se suma la cantidad
    const existente = items.find(
      (i) => i.id === idProducto && (i.tono || "") === (tono || "")
    );

    if (existente) {
      existente.cantidad += cantidad;
    } else {
      items.push({ id: idProducto, tono: tono, cantidad: cantidad });
    }

    Carrito.guardar(items);
    return items;
  },

  cambiarCantidad(indice, delta) {
    const items = Carrito.obtener();
    if (!items[indice]) return;
    items[indice].cantidad += delta;
    if (items[indice].cantidad <= 0) {
      items.splice(indice, 1);
    }
    Carrito.guardar(items);
  },

  eliminar(indice) {
    const items = Carrito.obtener();
    items.splice(indice, 1);
    Carrito.guardar(items);
  },

  vaciar() {
    Carrito.guardar([]);
  },

  cantidadTotal() {
    return Carrito.obtener().reduce((suma, i) => suma + i.cantidad, 0);
  },

  totalDinero() {
    return Carrito.obtener().reduce((suma, i) => {
      const p = PRODUCTOS.find((x) => x.id === i.id);
      return suma + (p ? p.precio * i.cantidad : 0);
    }, 0);
  },

  actualizarContador() {
    const total = Carrito.cantidadTotal();
    document.querySelectorAll("[data-contador-carrito]").forEach((el) => {
      el.textContent = total;
      el.hidden = total === 0;
    });
  },
};

// --- Panel lateral del carrito ---
function crearPanelCarrito() {
  if (document.getElementById("carritoOverlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "carrito-overlay";
  overlay.id = "carritoOverlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <aside class="carrito-panel" role="dialog" aria-modal="true" aria-labelledby="carritoTitulo">
      <header class="carrito-cabecera">
        <h2 id="carritoTitulo">Tu carrito</h2>
        <button class="carrito-cerrar" id="carritoCerrar" type="button" aria-label="Cerrar carrito">✕</button>
      </header>
      <div class="carrito-cuerpo" id="carritoCuerpo"></div>
      <footer class="carrito-pie">
        <div class="carrito-total">
          <span>Total</span>
          <strong id="carritoTotal">$0</strong>
        </div>
        <a class="boton" id="carritoPedir" href="pedido.html">Finalizar pedido</a>
        <button class="carrito-vaciar" id="carritoVaciar" type="button">Vaciar carrito</button>
      </footer>
    </aside>`;

  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) cerrarCarrito();
  });
  document.getElementById("carritoCerrar").addEventListener("click", cerrarCarrito);
  document.getElementById("carritoVaciar").addEventListener("click", () => {
    Carrito.vaciar();
    pintarCarrito();
    mostrarAviso("Carrito vaciado");
  });
}

function pintarCarrito() {
  const cuerpo = document.getElementById("carritoCuerpo");
  if (!cuerpo) return;

  const items = Carrito.obtener();

  if (items.length === 0) {
    cuerpo.innerHTML = `
      <div class="carrito-vacio">
        <p class="carrito-vacio-icono">🛍️</p>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos desde el catálogo para empezar tu pedido.</p>
        <a class="boton" href="catalogo.html">Ir al catálogo</a>
      </div>`;
    document.getElementById("carritoTotal").textContent = formatoPrecio(0);
    return;
  }

  cuerpo.innerHTML = items
    .map((item, indice) => {
      const p = PRODUCTOS.find((x) => x.id === item.id);
      if (!p) return "";
      return `
        <div class="carrito-item">
          <img src="${p.imagenes[0]}" alt="${p.nombre}">
          <div class="carrito-item-info">
            <h3>${p.nombre}</h3>
            ${item.tono ? `<p class="carrito-item-tono">Tono: ${item.tono}</p>` : ""}
            <span class="carrito-item-precio">${formatoPrecio(p.precio)}</span>
            <div class="carrito-item-controles">
              <button type="button" data-accion="menos" data-indice="${indice}" aria-label="Quitar una unidad">−</button>
              <span>${item.cantidad}</span>
              <button type="button" data-accion="mas" data-indice="${indice}" aria-label="Agregar una unidad">+</button>
              <button class="carrito-item-quitar" type="button" data-accion="quitar" data-indice="${indice}">Quitar</button>
            </div>
          </div>
        </div>`;
    })
    .join("");

  cuerpo.querySelectorAll("button[data-accion]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const indice = Number(btn.dataset.indice);
      if (btn.dataset.accion === "mas") Carrito.cambiarCantidad(indice, 1);
      if (btn.dataset.accion === "menos") Carrito.cambiarCantidad(indice, -1);
      if (btn.dataset.accion === "quitar") Carrito.eliminar(indice);
      pintarCarrito();
    });
  });

  document.getElementById("carritoTotal").textContent = formatoPrecio(
    Carrito.totalDinero()
  );
}

function abrirCarrito() {
  const overlay = document.getElementById("carritoOverlay");
  if (!overlay) return;
  pintarCarrito();
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function cerrarCarrito() {
  const overlay = document.getElementById("carritoOverlay");
  if (!overlay) return;
  overlay.hidden = true;
  document.body.style.overflow = "";
}

// --- Aviso flotante al agregar ---
function mostrarAviso(mensaje) {
  let aviso = document.getElementById("avisoCarrito");
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.id = "avisoCarrito";
    aviso.className = "aviso-carrito";
    document.body.appendChild(aviso);
  }
  aviso.textContent = mensaje;
  aviso.classList.add("visible");
  clearTimeout(aviso.dataset.timer);
  aviso.dataset.timer = setTimeout(() => aviso.classList.remove("visible"), 2200);
}

// --- Inicializacion global ---
document.addEventListener("DOMContentLoaded", () => {
  crearPanelCarrito();
  pintarCarrito();
  Carrito.actualizarContador();

  document.querySelectorAll("[data-abrir-carrito]").forEach((btn) => {
    btn.addEventListener("click", abrirCarrito);
  });

  document.addEventListener("keydown", (e) => {
    const overlay = document.getElementById("carritoOverlay");
    if (e.key === "Escape" && overlay && !overlay.hidden) cerrarCarrito();
  });
});

// Sincroniza el carrito si abro o regreso a la pagina en otra pestaña
window.addEventListener("storage", (e) => {
  if (e.key === CLAVE_CARRITO) {
    Carrito.actualizarContador();
    if (document.getElementById("carritoOverlay") && !document.getElementById("carritoOverlay").hidden) {
      pintarCarrito();
    }
  }
});