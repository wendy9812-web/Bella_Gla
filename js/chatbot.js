// Interfaz visual del chatbot de Bella Glam.
// Crea el boton flotante, el panel de chat y toda la interaccion.
// La conversacion se guarda en el navegador (localStorage) para que no
// se pierda al recargar o cerrar la pagina.

// --- Historial de conversacion (se guarda en el navegador) ---
const CLAVE_CHAT = "bellaGlamChatHistorial";

function leerHistorial() {
  try {
    const datos = localStorage.getItem(CLAVE_CHAT);
    return datos ? JSON.parse(datos) : [];
  } catch (e) {
    return [];
  }
}

function guardarHistorial(lista) {
  try {
    localStorage.setItem(CLAVE_CHAT, JSON.stringify(lista));
  } catch (e) {
    /* el navegador puede bloquear el almacenamiento */
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // --- Crear la estructura del chatbot si no existe ---
  if (document.getElementById("chatbot")) return;

  const contenedor = document.createElement("div");
  contenedor.id = "chatbot";
  contenedor.innerHTML = [
    // Boton flotante
    '<button class="chatbot-boton" id="chatbotBoton" type="button" aria-label="Abrir chat de ayuda" aria-expanded="false">',
    '  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
    '    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 20.5l1.5-4.9A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"></path>',
    "  </svg>",
    '  <span class="chatbot-texto">¿Necesitas ayuda?</span>',
    "</button>",

    // Panel de chat
    '<div class="chatbot-panel" id="chatbotPanel" role="dialog" aria-label="Chat de ayuda" hidden>',
    '  <header class="chatbot-cabecera">',
    '    <div class="chatbot-identidad">',
    '      <span class="chatbot-avatar" aria-hidden="true">BG</span>',
    "      <div>",
    "        <h2>Asesora Bella Glam</h2>",
    '        <p class="chatbot-estado"><span class="punto-online"></span> En línea</p>',
    "      </div>",
    "    </div>",
    '    <div class="chatbot-acciones">',
    '      <button class="chatbot-limpiar" id="chatbotLimpiar" type="button" aria-label="Borrar historial de conversación" title="Borrar historial">🧹</button>',
    '      <button class="chatbot-cerrar" id="chatbotCerrar" type="button" aria-label="Cerrar chat">&#10005;</button>',
    "    </div>",
    "  </header>",

    '  <div class="chatbot-mensajes" id="chatbotMensajes" aria-live="polite"></div>',

    '  <div class="chatbot-sugerencias" id="chatbotSugerencias"></div>',

    '  <form class="chatbot-formulario" id="chatbotFormulario">',
    '    <label class="visually-hidden" for="chatbotEntrada">Escribe tu mensaje</label>',
    '    <input id="chatbotEntrada" type="text" placeholder="Escribe tu pregunta..." autocomplete="off" maxlength="200">',
    '    <button type="submit" aria-label="Enviar mensaje">',
    '      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
    '        <line x1="22" y1="2" x2="11" y2="13"></line>',
    '        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>',
    "      </svg>",
    "    </button>",
    "  </form>",
    "</div>",
  ].join("");

  document.body.appendChild(contenedor);

  const boton = document.getElementById("chatbotBoton");
  const panel = document.getElementById("chatbotPanel");
  const zonaMensajes = document.getElementById("chatbotMensajes");
  const zonaSugerencias = document.getElementById("chatbotSugerencias");
  const formulario = document.getElementById("chatbotFormulario");
  const entrada = document.getElementById("chatbotEntrada");

  // --- Agregar un mensaje a la conversacion ---
  function agregarMensaje(texto, tipo) {
    const div = document.createElement("div");
    div.className = "chatbot-mensaje chatbot-" + tipo;

    // Conservar saltos de linea del texto
    div.textContent = texto;
    div.style.whiteSpace = "pre-wrap";

    zonaMensajes.appendChild(div);
    zonaMensajes.scrollTop = zonaMensajes.scrollHeight;

    // Guardar el mensaje en el historial
    const historial = leerHistorial();
    historial.push({ tipo: tipo, texto: texto });
    guardarHistorial(historial);

    return div;
  }

  // Mostrar el indicador de "escribiendo"
  function mostrarEscribiendo() {
    const div = document.createElement("div");
    div.className = "chatbot-mensaje chatbot-bot chatbot-escribiendo";
    div.innerHTML = "<span></span><span></span><span></span>";
    zonaMensajes.appendChild(div);
    zonaMensajes.scrollTop = zonaMensajes.scrollHeight;
    return div;
  }

  // --- Pintar botones de sugerencia ---
  function pintarSugerencias(lista) {
    zonaSugerencias.innerHTML = "";
    lista.forEach((texto) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chatbot-chip";
      chip.textContent = texto;
      chip.addEventListener("click", function () {
        zonaSugerencias.innerHTML = "";
        enviar(texto);
      });
      zonaSugerencias.appendChild(chip);
    });
  }

  // --- Procesar un mensaje del usuario ---
  function enviar(texto) {
    if (!texto.trim()) return;

    agregarMensaje(texto, "usuario");
    entrada.value = "";

    const escribiendo = mostrarEscribiendo();

    // Small delay to simulate real conversation feel
    setTimeout(function () {
      escribiendo.remove();
      const respuesta = generarRespuesta(texto);
      agregarMensaje(respuesta.texto, "bot");

      if (respuesta.productoId) {
        mostrarSugerenciasProducto(respuesta.productoId);
      } else if (respuesta.categoria) {
        mostrarSugerenciasCategoria(respuesta.categoria);
      } else {
        pintarSugerencias(SUGERENCIAS_INICIO.slice(0, 3));
      }
    }, 550);
  }

  // Boton para ir directo al producto en el catalogo
  function mostrarSugerenciasProducto(productoId) {
    pintarSugerencias(["Ver en el catálogo", "Tengo otra pregunta"]);

    const chip = zonaSugerencias.querySelector("button");
    if (chip) {
      chip.addEventListener("click", function () {
        location.href = "catalogo.html?buscar=" + encodeURIComponent(nombreProducto(productoId));
      });
    }
  }

  // Boton para ir al catalogo con el filtro de esa categoria activo
  function mostrarSugerenciasCategoria(categoria) {
    pintarSugerencias(["Ver esa categoría", "Tengo otra pregunta"]);

    const chip = zonaSugerencias.querySelector("button");
    if (chip) {
      chip.addEventListener("click", function () {
        location.href = "catalogo.html?categoria=" + encodeURIComponent(categoria);
      });
    }
  }

  function nombreProducto(id) {
    const p = PRODUCTOS.find(function (x) {
      return x.id === id;
    });
    return p ? p.nombre : "";
  }

  // --- Abrir y cerrar el panel ---
  function abrir() {
    panel.hidden = false;
    boton.classList.add("oculto");
    boton.setAttribute("aria-expanded", "true");
    setTimeout(function () {
      entrada.focus();
    }, 100);
  }

  function cerrar() {
    panel.hidden = true;
    boton.classList.remove("oculto");
    boton.setAttribute("aria-expanded", "false");
  }

  // --- Eventos ---
  boton.addEventListener("click", abrir);
  document.getElementById("chatbotCerrar").addEventListener("click", cerrar);

  // Borrar el historial de conversacion
  document.getElementById("chatbotLimpiar").addEventListener("click", function () {
    try {
      localStorage.removeItem(CLAVE_CHAT);
    } catch (e) {
      /* almacenamiento bloqueado */
    }
    zonaMensajes.innerHTML = "";
    agregarMensaje("Historial borrado. 🧹 ¿En qué puedo ayudarte hoy?", "bot");
    pintarSugerencias(SUGERENCIAS_INICIO);
  });

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();
    enviar(entrada.value);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) cerrar();
  });

  // --- Restaurar la conversacion guardada al cargar ---
  const historialGuardado = leerHistorial();
  if (historialGuardado.length > 0) {
    historialGuardado.forEach(function (m) {
      const div = document.createElement("div");
      div.className = "chatbot-mensaje chatbot-" + m.tipo;
      div.textContent = m.texto;
      div.style.whiteSpace = "pre-wrap";
      zonaMensajes.appendChild(div);
    });
    zonaMensajes.scrollTop = zonaMensajes.scrollHeight;
    pintarSugerencias(SUGERENCIAS_INICIO.slice(0, 3));
  } else {
    // Mensaje de bienvenida al cargar (la primera vez)
    agregarMensaje(
      "¡Hola! Soy la asesora virtual de Bella Glam. Pregúntame por productos, precios, promociones, envíos o formas de pago.",
      "bot"
    );
    pintarSugerencias(SUGERENCIAS_INICIO);
  }
});