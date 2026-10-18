// Logica de la pagina "Consulta tu pedido" (consulta.html).
// El cliente escribe su numero de pedido y su telefono para ver el estado.

function formatoFechaCorta(iso) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Convierte una fila de la tabla `pedidos` (columnas con guion_bajo)
// al formato que ya espera pintarResultado() en esta misma pagina.
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

function pintarResultado(p) {
  const resultado = document.getElementById("resultadoConsulta");
  const esPendiente = p.estado === "pendiente";

  const pasos = [
    { texto: "✅ Pedido recibido", clase: "completado" },
    { texto: "🎀 Preparando", clase: esPendiente ? "activo" : "completado" },
    { texto: "📦 Enviado", clase: esPendiente ? "" : "completado" },
  ];

  resultado.innerHTML = `
    <article class="pedido-card">
      <header class="pedido-cabecera">
        <div>
          <strong class="pedido-id">${p.id}</strong>
          <span class="pedido-fecha">${formatoFechaCorta(p.fecha)}</span>
        </div>
        <span class="estado-badge ${p.estado}">
          ${esPendiente ? "⏳ Preparando tu pedido" : "📦 ¡Tu pedido va en camino!"}
        </span>
      </header>

      <div class="estado-pasos">
        ${pasos.map((paso) => `<div class="paso ${paso.clase}">${paso.texto}</div>`).join("")}
      </div>

      <div class="pedido-columnas">
        <div class="pedido-envio">
          <h3>📍 Enviaremos tu pedido a:</h3>
          <p><strong>${p.cliente.nombre}</strong></p>
          <p>${p.cliente.direccion}, ${p.cliente.ciudad}</p>
          <p>💳 ${p.cliente.pago}</p>
          ${p.cliente.notas ? `<p class="pedido-notas">📝 ${p.cliente.notas}</p>` : ""}
        </div>

        <div class="pedido-detalle">
          <h3>🛍️ Tus productos:</h3>
          <ul class="pedido-items">
            ${p.items
              .map(
                (item) => `
              <li>
                <span>${item.cantidad} × ${item.nombre}${item.tono ? ` (Tono: ${item.tono})` : ""}</span>
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
        <p class="consulta-ayuda">¿Tienes dudas sobre tu pedido? <a href="contacto.html">Escríbenos aquí</a> 💌</p>
      </footer>
    </article>`;

  resultado.hidden = false;
  resultado.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formConsulta");
  const inputPedido = document.getElementById("numeroPedido");
  const inputTelefono = document.getElementById("telefonoConsulta");
  const resultado = document.getElementById("resultadoConsulta");
  const error = document.getElementById("consultaError");

  // Si llega con ?pedido=BG-XXXX (desde la confirmacion), se rellena solo
  const parametroPedido = new URLSearchParams(location.search).get("pedido");
  if (parametroPedido) {
    inputPedido.value = parametroPedido;
    inputTelefono.focus();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const codigo = inputPedido.value.trim().toUpperCase();
    const telefono = inputTelefono.value.trim();

    resultado.hidden = true;
    error.hidden = true;

    // Llamamos a la funcion `consultar_pedido` que vive en la base de datos.
    // Solo devuelve el pedido si el codigo Y el telefono coinciden, asi
    // nadie puede ver los pedidos de otras personas.
    try {
      const { data, error: errorConsulta } = await supabaseClient.rpc(
        "consultar_pedido",
        { p_codigo: codigo, p_telefono: telefono }
      );

      if (errorConsulta) {
        console.error("Error al consultar el pedido:", errorConsulta.message);
        error.hidden = false;
        return;
      }

      if (!data || data.length === 0) {
        error.hidden = false;
        return;
      }

      pintarResultado(deFilaAPedido(data[0]));
    } catch (err) {
      console.error("Sin conexion con Supabase:", err);
      error.hidden = false;
    }
  });
});
