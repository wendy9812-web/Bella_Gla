// Panel de clientes de Bella Glam (admin_clientes.html).
// ---------------------------------------------------------------------------
// Lee la tabla `contactos` de Supabase (los mensajes del formulario).
// Solo la puede leer una administradora con sesion iniciada cuyo correo
// este autorizado en la tabla `admins`. Lo controla la base de datos (RLS).
//
// Ya NO hay ninguna contraseña escrita aqui: la valida Supabase Auth.

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

function formatoFecha(iso) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto == null ? "" : String(texto);
  return div.innerHTML;
}

// --- Traer los mensajes desde Supabase ---
async function cargarClientes() {
  const lista = document.getElementById("listaClientes");
  const vacio = document.getElementById("clientesVacio");

  const { data, error } = await supabaseClient
    .from("contactos")
    .select("*")
    .order("creado_en", { ascending: false });

  if (error) {
    console.error("No se pudieron leer los mensajes:", error.message);
    avisoAdmin("No se pudieron cargar los mensajes 😕");
    return;
  }

  const clientes = data || [];

  if (clientes.length === 0) {
    lista.innerHTML = "";
    vacio.hidden = false;
    return;
  }
  vacio.hidden = true;

  lista.innerHTML = clientes
    .map(
      (cliente, i) => `
      <article class="pedido-card">
        <header class="pedido-cabecera">
          <div>
            <strong class="pedido-id">Cliente #${clientes.length - i}</strong>
            <span class="pedido-fecha">${formatoFecha(cliente.creado_en)}</span>
          </div>
        </header>

        <div class="pedido-columnas">
          <div class="pedido-envio">
            <h3>👤 Datos personales:</h3>
            <p><strong>${escapeHtml(cliente.nombre)}</strong></p>
            ${cliente.correo ? `<p>✉️ ${escapeHtml(cliente.correo)}</p>` : ""}
            ${cliente.telefono ? `<p>📞 ${escapeHtml(cliente.telefono)}</p>` : ""}
            ${cliente.ciudad ? `<p>🏙️ ${escapeHtml(cliente.ciudad)}</p>` : ""}
            ${cliente.direccion ? `<p>📍 ${escapeHtml(cliente.direccion)}</p>` : ""}
          </div>

          <div class="pedido-detalle">
            <h3>💬 Mensaje:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(cliente.mensaje)}</p>
          </div>
        </div>
      </article>`
    )
    .join("");
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

  await cargarClientes();
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
    cargarClientes();
  });
});
