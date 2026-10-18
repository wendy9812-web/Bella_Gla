
// Nota: formatoPrecio() se define en productos.js (cargado antes).

// --- Referencias del DOM ---
const rejilla = document.getElementById("rejilla");
const buscador = document.getElementById("busqueda");
const limpiarBusqueda = document.getElementById("limpiarBusqueda");
const conteo = document.getElementById("conteo");
const sinResultados = document.getElementById("sinResultados");
const botonesFiltro = document.querySelectorAll(".filtro");

const overlay = document.getElementById("fichaOverlay");
const cerrarFicha = document.getElementById("fichaCerrar");

// --- Estado ---
let categoriaActual = "todas";
let textoBusqueda = "";
let productoActual = null;

// --- Renderizado de la rejilla ---
function pintarProductos(lista) {
  if (lista.length === 0) {
    rejilla.innerHTML = "";
    sinResultados.hidden = false;
    return;
  }
  sinResultados.hidden = true;

  rejilla.innerHTML = lista
    .map((p) => {
      const ahorro = p.precioAnterior - p.precio;
      return `
        <article class="producto" data-id="${p.id}" tabindex="0" role="button"
                 aria-label="Ver ficha técnica de ${p.nombre}">
          <div class="producto-img">
            <img src="${p.imagenes[0]}" alt="${p.nombre}" loading="lazy">
            ${p.precioAnterior ? `<span class="producto-oferta">-${Math.round((ahorro / p.precioAnterior) * 100)}% dto</span>` : ""}
          </div>
          <div class="producto-info">
            <span class="producto-cat">${p.categoria}</span>
            <h3>${p.nombre}</h3>
            <p class="producto-marca">${p.marca}</p>
            <div class="producto-precios">
              <span class="precio-actual">${formatoPrecio(p.precio)}</span>
              ${p.precioAnterior ? `<span class="precio-anterior">${formatoPrecio(p.precioAnterior)}</span>` : ""}
            </div>
            <span class="producto-ver">Ver ficha técnica</span>
            <button class="boton boton-agregar" type="button" data-agregar="${p.id}">
              🛒 Agregar al carrito
            </button>
          </div>
        </article>`;
    })
    .join("");

  // Activar clic y teclado en cada tarjeta
  rejilla.querySelectorAll(".producto").forEach((card) => {
    card.addEventListener("click", () => abrirFicha(Number(card.dataset.id)));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrirFicha(Number(card.dataset.id));
      }
    });
  });

  // Botones "Agregar al carrito" de cada tarjeta
  rejilla.querySelectorAll("[data-agregar]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // evita abrir la ficha técnica
      const p = PRODUCTOS.find((x) => x.id === Number(btn.dataset.agregar));
      if (!p) return;
      Carrito.agregar(p.id, null, 1);
      mostrarAviso(`${p.nombre} agregado al carrito`);
    });
  });
}

// --- Filtrado y búsqueda ---
function actualizar() {
  const t = textoBusqueda.trim().toLowerCase();

  const filtrados = PRODUCTOS.filter((p) => {
    const coincideCategoria = categoriaActual === "todas" || p.categoria === categoriaActual;
    const coincideTexto =
      t === "" ||
      p.nombre.toLowerCase().includes(t) ||
      p.marca.toLowerCase().includes(t) ||
      p.categoria.toLowerCase().includes(t) ||
      p.descripcion.toLowerCase().includes(t) ||
      p.tonos.some((tono) => tono.nombre.toLowerCase().includes(t));
    return coincideCategoria && coincideTexto;
  });

  pintarProductos(filtrados);

  if (filtrados.length === 0) {
    conteo.textContent = "Sin resultados";
  } else if (t !== "" || categoriaActual !== "todas") {
    conteo.textContent = `Mostrando ${filtrados.length} de ${PRODUCTOS.length} productos`;
  } else {
    conteo.textContent = `${PRODUCTOS.length} productos disponibles`;
  }
}

// --- Ficha técnica ---
function abrirFicha(id) {
  const p = PRODUCTOS.find((x) => x.id === id);
  if (!p) return;
  productoActual = p;

  document.getElementById("fichaNombre").textContent = p.nombre;
  document.getElementById("fichaMarca").textContent = "Marca: " + p.marca;
  document.getElementById("fichaCategoria").textContent = p.categoria;
  document.getElementById("fichaDescripcion").textContent = p.descripcion;
  document.getElementById("fichaPrecio").textContent = formatoPrecio(p.precio);

  const anterior = document.getElementById("fichaPrecioAnterior");
  const ahorro = document.getElementById("fichaAhorro");
  if (p.precioAnterior) {
    anterior.textContent = formatoPrecio(p.precioAnterior);
    anterior.hidden = false;
    ahorro.textContent = `Ahorras ${formatoPrecio(p.precioAnterior - p.precio)}`;
    ahorro.hidden = false;
  } else {
    anterior.hidden = true;
    ahorro.hidden = true;
  }

  // Lista de uso
  const listaUso = document.getElementById("fichaUso");
  listaUso.innerHTML = p.uso.map((paso) => `<li>${paso}</li>`).join("");

  // Miniaturas
  const minis = document.getElementById("fichaMiniaturas");
  minis.innerHTML = p.imagenes
    .map(
      (img, i) =>
        `<button class="miniatura ${i === 0 ? "seleccionada" : ""}" type="button" data-src="${img}" aria-label="Ver imagen ${i + 1}">
           <img src="${img}" alt="">
         </button>`
    )
    .join("");

  const imgPrincipal = document.getElementById("fichaImagen");
  imgPrincipal.src = p.imagenes[0];
  imgPrincipal.alt = p.nombre;

  minis.querySelectorAll(".miniatura").forEach((btn) => {
    btn.addEventListener("click", () => {
      imgPrincipal.src = btn.dataset.src;
      minis.querySelectorAll(".miniatura").forEach((b) => b.classList.remove("seleccionada"));
      btn.classList.add("seleccionada");
    });
  });

  // Selector de tonos
  const tonos = document.getElementById("fichaTonos");
  tonos.innerHTML = p.tonos
    .map(
      (tono, i) =>
        `<button class="tono ${i === 0 ? "seleccionado" : ""}" type="button" role="radio"
                 aria-checked="${i === 0}" data-nombre="${tono.nombre}" data-color="${tono.color}"
                 style="background:${tono.color}" title="${tono.nombre}" aria-label="${tono.nombre}"></button>`
    )
    .join("");

  document.getElementById("fichaTonoNombre").textContent = p.tonos[0].nombre;

  tonos.querySelectorAll(".tono").forEach((btn) => {
    btn.addEventListener("click", () => {
      tonos.querySelectorAll(".tono").forEach((b) => {
        b.classList.remove("seleccionado");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("seleccionado");
      btn.setAttribute("aria-checked", "true");
      document.getElementById("fichaTonoNombre").textContent = btn.dataset.nombre;
    });
  });

  // Botón de agregar al carrito (usa el tono que este seleccionado)
  document.getElementById("agregarAlCarrito").onclick = () => {
    const tonoSeleccionado = document.getElementById("fichaTonoNombre").textContent;
    Carrito.agregar(p.id, tonoSeleccionado, 1);
    mostrarAviso(`${p.nombre} agregado al carrito`);
    abrirCarrito();
  };

  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  cerrarFicha.focus();
}

function cerrar() {
  overlay.hidden = true;
  document.body.style.overflow = "";
  productoActual = null;
}

// --- Eventos ---
botonesFiltro.forEach((boton) => {
  boton.addEventListener("click", () => {
    botonesFiltro.forEach((b) => b.classList.remove("activo"));
    boton.classList.add("activo");
    categoriaActual = boton.dataset.categoria;
    actualizar();
  });
});

buscador.addEventListener("input", (e) => {
  textoBusqueda = e.target.value;
  limpiarBusqueda.hidden = textoBusqueda === "";
  actualizar();
});

limpiarBusqueda.addEventListener("click", () => {
  buscador.value = "";
  textoBusqueda = "";
  limpiarBusqueda.hidden = true;
  actualizar();
  buscador.focus();
});

document.getElementById("restablecer").addEventListener("click", () => {
  buscador.value = "";
  textoBusqueda = "";
  limpiarBusqueda.hidden = true;
  categoriaActual = "todas";
  botonesFiltro.forEach((b) => b.classList.remove("activo"));
  botonesFiltro[0].classList.add("activo");
  actualizar();
});

cerrarFicha.addEventListener("click", cerrar);

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) cerrar();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !overlay.hidden) cerrar();
});

// --- Inicio ---
// Si se llega con ?buscar=texto o ?categoria=x, se aplica el filtro correspondiente
const parametrosUrl = new URLSearchParams(location.search);

const parametroBusqueda = parametrosUrl.get("buscar");
if (parametroBusqueda) {
  buscador.value = parametroBusqueda;
  textoBusqueda = parametroBusqueda;
}

const parametroCategoria = parametrosUrl.get("categoria");
if (parametroCategoria) {
  const boton = document.querySelector('.filtro[data-categoria="' + parametroCategoria + '"]');
  if (boton) {
    botonesFiltro.forEach((b) => b.classList.remove("activo"));
    boton.classList.add("activo");
    categoriaActual = parametroCategoria;
  }
}

limpiarBusqueda.hidden = textoBusqueda === "";
actualizar();