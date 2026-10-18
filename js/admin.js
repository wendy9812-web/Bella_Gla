// Panel de administracion de Bella Glam (admin.html).
// ---------------------------------------------------------------------------
// Los pedidos viven en Supabase (tabla `pedidos`).
// Solo se pueden LEER con una sesion iniciada Y cuyo correo este autorizado
// en la tabla `admins`. Esa comprobacion la hace la base de datos (RLS),
// no este archivo: aunque alguien vea este codigo, no puede leer nada.
//
// Ya NO hay ninguna contraseña escrita aqui: la valida Supabase Auth.

let pedidos = [];
let filtroEstado = "todos";

// Texto que se muestra para cada estado (los mismos que acepta la base de datos)
const ETIQUETAS_ESTADO = {
  pendiente: "⏳ Pendiente",
  en_preparacion: "🎀 En preparación",
  enviado: "📦 Enviado",
  entregado: "✅ Entregado",
  cancelado: "❌ Cancelado",
};

// --- Aviso flotante (reutiliza los estilos del carrito) ---
function avisoAdmin(mensaje) {
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

// --- Fecha legible ---
function formatoFecha(iso) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// --- Evita que un texto escrito por un cliente se ejecute como HTML ---
function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto == null ? "" : String(texto);
  return div.innerHTML;
}

// --- Convierte una fila de Supabase al formato que usa este panel ---
function deFilaAPedido(fila) {
  return {
    id: fila.codigo,
    fecha: fila.creado_en,
    estado: fila.estado,
    total: Number(fila.total),
    items: Array.isArray(fila.items) ? fila.items : [],
    cliente: {
      nombre: fila.nombre_cliente,
      telefono: fila.telefono,
      correo: fila.correo,
      ciudad: fila.ciudad,
      direccion: fila.direccion,
      pago: fila.pago,
      notas: fila.notas,
    },
  };
}

// --- Estadisticas del panel ---
function pintarEstadisticas() {
  const pendientes = pedidos.filter((p) => p.estado === "pendiente");
  const enviados = pedidos.filter((p) => p.estado === "enviado");
  const porCobrar = pedidos
    .filter((p) => p.estado !== "entregado" && p.estado !== "cancelado")
    .reduce((suma, p) => suma + p.total, 0);

  document.getElementById("adminStats").innerHTML = `
    <div class="stat">
      <span class="stat-numero">${pendientes.length}</span>
      <span class="stat-texto">⏳ Pedidos pendientes</span>
    </div>
    <div class="stat">
      <span class="stat-numero">${enviados.length}</span>
      <span class="stat-texto">📦 Pedidos enviados</span>
    </div>
    <div class="stat">
      <span class="stat-numero">${formatoPrecio(porCobrar)}</span>
      <span class="stat-texto">💰 Por cobrar / enviar</span>
    </div>`;
}

// --- Lista de pedidos ---
function pintarPedidos() {
  const lista = document.getElementById("listaPedidos");
  const vacio = document.getElementById("adminVacio");

  pintarEstadisticas();

  const visibles = pedidos.filter(
    (p) => filtroEstado === "todos" || p.estado === filtroEstado
  );

  if (visibles.length === 0) {
    lista.innerHTML = "";
    vacio.hidden = false;
    return;
  }
  vacio.hidden = true;

  lista.innerHTML = visibles
    .map((p) => {
      return `
      <article class="pedido-card ${p.estado}">
        <header class="pedido-cabecera">
          <div>
            <strong class="pedido-id">${escapeHtml(p.id)}</strong>
            <span class="pedido-fecha">${formatoFecha(p.fecha)}</span>
          </div>
          <span class="estado-badge ${p.estado}">${ETIQUETAS_ESTADO[p.estado] || p.estado}</span>
        </header>

        <div class="pedido-columnas">
          <div class="pedido-envio">
            <h3>📍 Enviar a:</h3>
            <p><strong>${escapeHtml(p.cliente.nombre)}</strong></p>
            <p>${escapeHtml(p.cliente.direccion)}, ${escapeHtml(p.cliente.ciudad)}</p>
            <p>📞 ${escapeHtml(p.cliente.telefono)}</p>
            ${p.cliente.correo ? `<p>✉️ ${escapeHtml(p.cliente.correo)}</p>` : ""}
            <p>💳 ${escapeHtml(p.cliente.pago)}</p>
            ${p.cliente.notas ? `<p class="pedido-notas">📝 ${escapeHtml(p.cliente.notas)}</p>` : ""}
            <button class="boton-mini" type="button" data-copiar="${escapeHtml(p.id)}">📋 Copiar datos de envío</button>
          </div>

          <div class="pedido-detalle">
            <h3>🛍️ Productos:</h3>
            <ul class="pedido-items">
              ${p.items
                .map(
                  (item) => `
                <li>
                  <span>${escapeHtml(item.cantidad)} × ${escapeHtml(item.nombre)}${item.tono ? ` (Tono: ${escapeHtml(item.tono)})` : ""}</span>
                  <span>${formatoPrecio(item.precio * item.cantidad)}</span>
                </li>`
                )
                .join("")}
            </ul>
            <div class="pedido-total">
              <span>Total</span>
              <strong>${formatoPrecio(p.total)}</strong>
            </div>
          </div>
        </div>

        <footer class="pedido-acciones">
          <label class="campo-estado">
            Estado:
            <select class="selector-estado" data-estado-select="${escapeHtml(p.id)}">
              ${Object.keys(ETIQUETAS_ESTADO)
                .map(
                  (clave) =>
                    `<option value="${clave}"${clave === p.estado ? " selected" : ""}>${ETIQUETAS_ESTADO[clave]}</option>`
                )
                .join("")}
            </select>
          </label>
          <button class="boton-mini boton-peligro" type="button" data-eliminar="${escapeHtml(p.id)}">🗑️ Eliminar</button>
        </footer>
      </article>`;
    })
    .join("");

  // --- Acciones de cada tarjeta ---

  // Cambiar el estado con el desplegable
  lista.querySelectorAll("[data-estado-select]").forEach((selector) => {
    selector.addEventListener("change", () => {
      cambiarEstado(selector.dataset.estadoSelect, selector.value, selector);
    });
  });

  // Eliminar un pedido
  lista.querySelectorAll("[data-eliminar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      eliminarPedido(btn.dataset.eliminar, btn);
    });
  });

  // Copiar los datos de envio
  lista.querySelectorAll("[data-copiar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = pedidos.find((x) => x.id === btn.dataset.copiar);
      if (!p) return;
      const texto =
        `Pedido ${p.id}\n` +
        `Nombre: ${p.cliente.nombre}\n` +
        `Dirección: ${p.cliente.direccion}, ${p.cliente.ciudad}\n` +
        `Teléfono: ${p.cliente.telefono}\n` +
        `Pago: ${p.cliente.pago}\n` +
        `Productos: ${p.items.map((i) => `${i.cantidad}x ${i.nombre}${i.tono ? " (" + i.tono + ")" : ""}`).join(", ")}\n` +
        `Total: ${formatoPrecio(p.total)}`;
      copiarTexto(texto);
    });
  });
}

// --- Guardar un cambio de estado en Supabase ---
async function cambiarEstado(codigo, nuevoEstado, selector) {
  selector.disabled = true;

  const { error } = await supabaseClient
    .from("pedidos")
    .update({ estado: nuevoEstado, actualizado_en: new Date().toISOString() })
    .eq("codigo", codigo);

  selector.disabled = false;

  if (error) {
    console.error("No se pudo cambiar el estado:", error.message);
    avisoAdmin("No se pudo guardar el cambio 😕");
    return;
  }

  const pedido = pedidos.find((p) => p.id === codigo);
  if (pedido) pedido.estado = nuevoEstado;

  pintarPedidos();
  avisoAdmin("Estado actualizado ✅");
}

// --- Borrar un pedido de Supabase ---
async function eliminarPedido(codigo, btn) {
  if (!confirm("¿Seguro que quieres eliminar este pedido? Esta acción no se puede deshacer.")) {
    return;
  }

  btn.disabled = true;

  const { error } = await supabaseClient.from("pedidos").delete().eq("codigo", codigo);

  if (error) {
    btn.disabled = false;
    console.error("No se pudo eliminar el pedido:", error.message);
    avisoAdmin("No se pudo eliminar 😕");
    return;
  }

  pedidos = pedidos.filter((p) => p.id !== codigo);
  pintarPedidos();
  avisoAdmin("Pedido eliminado 🗑️");
}

// --- Traer los pedidos desde Supabase ---
async function cargarPedidos() {
  const { data, error } = await supabaseClient
    .from("pedidos")
    .select("*")
    .order("creado_en", { ascending: false });

  if (error) {
    console.error("No se pudieron leer los pedidos:", error.message);
    avisoAdmin("No se pudieron cargar los pedidos 😕");
    return;
  }

  pedidos = (data || []).map(deFilaAPedido);
  pintarPedidos();
}

// Copia al portapapeles con un metodo alternativo por si el navegador lo bloquea
function copiarTexto(texto) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(texto)
      .then(() => avisoAdmin("Datos copiados al portapapeles 📋"))
      .catch(() => copiarTextoAlternativo(texto));
  } else {
    copiarTextoAlternativo(texto);
  }
}

function copiarTextoAlternativo(texto) {
  const area = document.createElement("textarea");
  area.value = texto;
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand("copy");
    avisoAdmin("Datos copiados al portapapeles 📋");
  } catch (e) {
    avisoAdmin("No se pudo copiar 😕");
  }
  document.body.removeChild(area);
}

// --- Sesion y acceso ---
async function mostrarPanel(sesion) {
  document.getElementById("adminLogin").hidden = true;
  document.getElementById("adminPanel").hidden = false;

  if (sesion && sesion.user) {
    document.getElementById("adminCorreo").textContent = sesion.user.email;
  }

  // Le preguntamos a la base de datos: ¿este correo es administradora?
  const { data: soyAdmin, error: errorAdmin } = await supabaseClient.rpc("es_admin");

  if (errorAdmin) {
    console.error("No se pudo comprobar el permiso:", errorAdmin.message);
  } else if (!soyAdmin) {
    document.getElementById("adminAviso").hidden = false;
  }

  await cargarPedidos();
}

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formAdmin");
  const error = document.getElementById("adminError");
  const btnEntrar = document.getElementById("btnEntrar");

  // Si Supabase recuerda una sesion abierta, entramos directo
  const { data: sesionGuardada } = await supabaseClient.auth.getSession();
  if (sesionGuardada && sesionGuardada.session) {
    mostrarPanel(sesionGuardada.session);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correoAdmin").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    error.hidden = true;
    btnEntrar.disabled = true;
    btnEntrar.textContent = "Entrando...";

    const { data, error: errorLogin } = await supabaseClient.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });

    btnEntrar.disabled = false;
    btnEntrar.textContent = "Entrar";

    if (errorLogin) {
      console.error("No se pudo iniciar sesión:", errorLogin.message);
      error.hidden = false;
      form.reset();
      return;
    }

    form.reset();
    mostrarPanel(data.session);
  });

  document.getElementById("adminSalir").addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    location.reload();
  });

  document.getElementById("btnActualizar").addEventListener("click", () => {
    avisoAdmin("Actualizando... 🔄");
    cargarPedidos();
  });

  // Filtros de estado
  document.querySelectorAll("#adminPanel .filtro").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#adminPanel .filtro").forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");
      filtroEstado = btn.dataset.estado;
      pintarPedidos();
    });
  });
});
