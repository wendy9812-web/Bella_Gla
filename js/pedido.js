// Logica de la pagina "Finalizar pedido" (pedido.html).
// Muestra el resumen del carrito y guarda el pedido con los datos de envio.

// ⚠️ CAMBIA ESTE NUMERO por el WhatsApp de la tienda:
// codigo de pais + numero, todo junto y sin "+" ni espacios. Ej: "573001234567"
const WHATSAPP_TIENDA = "573001234567";

// Arma el enlace de WhatsApp con el pedido completo en el mensaje
function enlaceWhatsApp(pedido) {
  const lineas = [
    "¡Hola Bella Glam! 💄 Quiero hacer este pedido:",
    "",
    "🆔 Pedido: " + pedido.id,
    "",
    "🛍️ Productos:",
    ...pedido.items.map(
      (i) =>
        "• " + i.cantidad + " x " + i.nombre +
        (i.tono ? " (Tono: " + i.tono + ")" : "") +
        " — " + formatoPrecio(i.precio * i.cantidad)
    ),
    "",
    "💰 Total: " + formatoPrecio(pedido.total),
    "",
    "📍 Datos de envío:",
    "Nombre: " + pedido.cliente.nombre,
    "Dirección: " + pedido.cliente.direccion + ", " + pedido.cliente.ciudad,
    "Teléfono: " + pedido.cliente.telefono,
    "💳 Pago: " + pedido.cliente.pago,
  ];
  if (pedido.cliente.notas) {
    lineas.push("📝 Notas: " + pedido.cliente.notas);
  }
  return "https://wa.me/" + WHATSAPP_TIENDA + "?text=" + encodeURIComponent(lineas.join("\n"));
}

// Genera un codigo de pedido aleatorio e imposible de adivinar.
// Usa `crypto.getRandomValues` (el generador seguro del navegador) en vez de
// `Math.random`. Ademas evita los caracteres que se confunden al leerlos en voz
// alta (0 y O, 1 e I) para que el cliente pueda dictar su codigo sin errores.
function generarCodigo() {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);

  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    // Respaldo por si el navegador fuera muy antiguo
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  let codigo = "BG-";
  for (let i = 0; i < bytes.length; i++) {
    if (i === 4) codigo += "-";
    codigo += alfabeto[bytes[i] % alfabeto.length];
  }
  return codigo; // Ejemplo: "BG-K7RM-9XQ2"
}

document.addEventListener("DOMContentLoaded", () => {
  const seccionPedido = document.getElementById("seccionPedido");
  const seccionVacio = document.getElementById("pedidoVacio");
  const seccionConfirmado = document.getElementById("pedidoConfirmado");
  const resumenItems = document.getElementById("resumenItems");
  const resumenTotal = document.getElementById("resumenTotal");
  const form = document.getElementById("formPedido");

  const items = Carrito.obtener();

  // Si el carrito esta vacio no hay nada que pedir
  if (items.length === 0) {
    seccionPedido.hidden = true;
    seccionVacio.hidden = false;
    return;
  }

  // --- Resumen del pedido ---
  resumenItems.innerHTML = items
    .map((item) => {
      const p = PRODUCTOS.find((x) => x.id === item.id);
      if (!p) return "";
      return `
        <div class="resumen-item">
          <img src="${p.imagenes[0]}" alt="${p.nombre}">
          <div class="resumen-item-info">
            <strong>${p.nombre}</strong>
            ${item.tono ? `<span>Tono: ${item.tono}</span>` : ""}
            <span>${item.cantidad} x ${formatoPrecio(p.precio)}</span>
          </div>
          <span class="resumen-item-subtotal">${formatoPrecio(p.precio * item.cantidad)}</span>
        </div>`;
    })
    .join("");

  resumenTotal.textContent = formatoPrecio(Carrito.totalDinero());

  // --- Confirmar pedido ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const datos = new FormData(form);

    // Se guarda una "foto" de los productos con nombre y precio,
    // asi el pedido sigue completo aunque el catalogo cambie despues.
    const pedido = {
      id: generarCodigo(),
      fecha: new Date().toISOString(),
      cliente: {
        nombre: datos.get("nombre").trim(),
        telefono: datos.get("telefono").trim(),
        correo: datos.get("correo").trim(),
        ciudad: datos.get("ciudad").trim(),
        direccion: datos.get("direccion").trim(),
        notas: datos.get("notas").trim(),
        pago: datos.get("pago"),
      },
      items: items.map((item) => {
        const p = PRODUCTOS.find((x) => x.id === item.id);
        return {
          id: item.id,
          nombre: p ? p.nombre : "Producto #" + item.id,
          tono: item.tono || null,
          cantidad: item.cantidad,
          precio: p ? p.precio : 0,
        };
      }),
      total: Carrito.totalDinero(),
      estado: "pendiente",
    };

    // Respaldo en el navegador: si Supabase falla, el pedido no se pierde
    Pedidos.agregar(pedido);
    
    // Guardar en Supabase (tabla `pedidos`).
    // RLS deja INSERTAR a cualquier visitante, pero solo la
    // administradora con sesion iniciada puede leer los pedidos.
    // Si la base de datos rechaza el pedido (por ejemplo, un segundo pedido del
    // mismo telefono en menos de un minuto), guardamos el motivo para avisarle
    // al cliente en vez de dejarlo creyendo que todo salio bien.
    let avisoDelServidor = null;

    try {
      const { error } = await supabaseClient.from("pedidos").insert({
        codigo: pedido.id,
        nombre_cliente: pedido.cliente.nombre,
        telefono: pedido.cliente.telefono,
        correo: pedido.cliente.correo || null,
        ciudad: pedido.cliente.ciudad,
        direccion: pedido.cliente.direccion,
        pago: pedido.cliente.pago,
        notas: pedido.cliente.notas || null,
        items: pedido.items,
        total: pedido.total,
      });

      if (error) {
        console.error("Supabase rechazo el pedido:", error.message);
        avisoDelServidor = error.message;
      }
    } catch (err) {
      console.error("Sin conexion con Supabase:", err);
      avisoDelServidor = "No pudimos conectar con el sistema de pedidos.";
    }
    
    Carrito.vaciar();

    // Confirmacion en pantalla
    document.getElementById("codigoPedido").textContent = pedido.id;
    // El boton de consulta lleva el numero de pedido ya escrito en la URL
    document.getElementById("botonConsulta").href =
      "consulta.html?pedido=" + encodeURIComponent(pedido.id);
    // El boton de WhatsApp abre el chat de la tienda con el pedido listo
    document.getElementById("botonWhatsApp").href = enlaceWhatsApp(pedido);
    seccionPedido.hidden = true;
    seccionConfirmado.hidden = false;

    // Si el pedido no llego a la base de datos, se lo decimos claramente. El
    // pedido NO se pierde: queda en el respaldo del navegador y el boton de
    // WhatsApp igual se lo hace llegar a la tienda.
    if (avisoDelServidor) {
      const nota = document.createElement("p");
      nota.className = "aviso-pedido";
      nota.textContent =
        "⚠️ " + avisoDelServidor +
        " Envíanos el pedido por WhatsApp con el botón de abajo para que no se pierda.";
      const botones = seccionConfirmado.querySelector(".confirmacion-botones");
      botones.parentNode.insertBefore(nota, botones);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
